"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { ADS_SOCKET_URL } from "@/constants/ads";
import adsApi from "@/lib/adsApi";

export const AdsListContext = createContext(null);

const normalizeAds = (ads = []) => {
  if (!Array.isArray(ads)) {
    return [];
  }

  return ads.filter(Boolean).map((ad, fallbackIndex) => {
    const parsedPosition = Number(ad.position);
    return {
      ...ad,
      position: Number.isFinite(parsedPosition)
        ? parsedPosition
        : fallbackIndex,
    };
  });
};

export function AdsListProvider({ initialAds = [], children }) {
  const [socket, setSocket] = useState(null);
  const normalized = useMemo(() => normalizeAds(initialAds), [initialAds]);

  const adsRef = useRef(normalized);
  useEffect(() => {
    adsRef.current = normalized;
  }, [normalized]);

  const listenersRef = useRef(new Map());
  const [status, setStatus] = useState("idle");

  const resolveAdByPosition = useCallback((index) => {
    if (!Number.isFinite(index)) {
      return null;
    }

    return (
      adsRef.current.find(
        (ad) => Number.isFinite(ad?.position) && Number(ad.position) === index
      ) || null
    );
  }, []);

  // Notificar a todos los listeners cuando cambia un ad
  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((listeners, index) => {
      if (!listeners?.size) {
        return;
      }

      const snapshot = resolveAdByPosition(index);
      listeners.forEach((listener) => {
        listener(snapshot);
      });
    });
  }, [resolveAdByPosition]);

  // Actualizar ads y notificar
  const updateAds = useCallback(
    (newAds) => {
      const normalized = normalizeAds(newAds);
      const currentStr = JSON.stringify(adsRef.current);
      const nextStr = JSON.stringify(normalized);

      if (currentStr === nextStr) {
        return;
      }

      adsRef.current = normalized;
      notifyListeners();
    },
    [notifyListeners]
  );

  // Conectar al WebSocket del microservicio de ads
  useEffect(() => {
    const adsSocket = io(ADS_SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    adsSocket.on("connect", () => {
      setStatus("connected");
      setSocket(adsSocket);
    });

    adsSocket.on("disconnect", () => {
      setStatus("disconnected");
    });

    adsSocket.on("connect_error", () => {
      setStatus("error");
    });

    setStatus("connecting");

    return () => {
      adsSocket.disconnect();
      setSocket(null);
    };
  }, []);

  // WebSocket: escuchar actualizaciones de ads
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleAdsUpdate = (data) => {
      // El backend emite: { positions: [{ position, ad }, ...], timestamp: ... }
      if (data?.positions && Array.isArray(data.positions)) {
        // El backend envía: { position, asset_url, click_url, ... } directamente
        // NO envuelto en un objeto 'ad'
        const validPositions = data.positions.filter((posData) => {
          // Los datos del ad vienen directamente en posData, no en posData.ad
          return posData && (posData.asset_url || posData.image);
        });

        const ads = validPositions
          .sort((a, b) => (a.position || 0) - (b.position || 0)) // Ordenar por posición
          .map((posData) => {
            // El backend envía los datos directamente, no en posData.ad
            return {
              ...posData,
              position: posData.position,
            };
          })
          .filter((ad) => ad.asset_url || ad.image); // Filtrar una vez más por si acaso

        if (ads.length > 0) {
          updateAds(ads);
        }
      } else if (Array.isArray(data)) {
        // Fallback: si viene como array directo, filtrar válidos
        const validAds = data.filter((ad) => ad && (ad.asset_url || ad.image));
        if (validAds.length > 0) {
          updateAds(validAds);
        }
      }
    };

    const handleConnect = () => {
      setStatus("connected");
    };

    const handleDisconnect = () => {
      setStatus("disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    // El backend de ads emite 'allAdsUpdate' (ver adBroadcastService.js)
    socket.on("allAdsUpdate", handleAdsUpdate);

    setStatus("connected");

    // Fallback: si no hay WebSocket después de 5s, hacer fetch inicial
    const fallbackTimeout = setTimeout(async () => {
      if (status === "connecting") {
        try {
          const response = await adsApi.get("/ads/all-positions/now");
          const newAds = response.data?.positions ?? [];
          if (newAds.length > 0) {
            updateAds(newAds);
          }
        } catch (error) {
          setStatus("error");
        }
      }
    }, 5000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("ads:update", handleAdsUpdate);
        socket.off("ads:all-positions", handleAdsUpdate);
        socket.off("allAdsUpdate", handleAdsUpdate);
      }
      setStatus("idle");
    };
  }, [socket, updateAds, status]);

  // Suscribirse a un índice de ad específico
  const subscribeToIndex = useCallback(
    (index, listener) => {
      if (!Number.isFinite(index) || typeof listener !== "function") {
        return () => {};
      }

      if (!listenersRef.current.has(index)) {
        listenersRef.current.set(index, new Set());
      }

      const listeners = listenersRef.current.get(index);
      listeners.add(listener);

      // Enviar snapshot inicial
      listener(resolveAdByPosition(index));

      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          listenersRef.current.delete(index);
        }
      };
    },
    [resolveAdByPosition]
  );

  // Obtener snapshot de un índice
  const getIndexSnapshot = useCallback(
    (index) => resolveAdByPosition(index),
    [resolveAdByPosition]
  );

  // Obtener todos los ads
  const getAllAds = useCallback(() => adsRef.current, []);

  const value = useMemo(
    () => ({
      subscribeToIndex,
      getIndexSnapshot,
      getAllAds,
      status,
      ads: adsRef.current,
    }),
    [subscribeToIndex, getIndexSnapshot, getAllAds, status]
  );

  return (
    <AdsListContext.Provider value={value}>{children}</AdsListContext.Provider>
  );
}

export const useAdsList = () => {
  const context = useContext(AdsListContext);
  if (context === null) {
    throw new Error("useAdsList must be used within AdsListProvider");
  }
  return context;
};

// Hook similar a useAdsSlots pero para índices
export const useAdsByIndices = (indices = []) => {
  const store = useAdsList();

  const indicesKey = useMemo(() => {
    if (!Array.isArray(indices) || !indices.length) {
      return "";
    }
    const sanitized = indices
      .map((index) => Number(index))
      .filter((index) => Number.isFinite(index));
    return sanitized.join("|");
  }, [indices]);

  const initialSnapshot = useMemo(() => {
    if (!store || !indicesKey) {
      return [];
    }
    return indicesKey
      .split("|")
      .map((value) => Number(value))
      .filter((index) => Number.isFinite(index))
      .map((index) => store.getIndexSnapshot(index));
  }, [indicesKey, store]);

  const [ads, setAds] = useState(initialSnapshot);

  useEffect(() => {
    if (!store || !indicesKey) {
      setAds([]);
      return undefined;
    }

    const parsedIndices = indicesKey
      .split("|")
      .map((value) => Number(value))
      .filter((index) => Number.isFinite(index));

    setAds(parsedIndices.map((index) => store.getIndexSnapshot(index)));

    const unsubscribes = parsedIndices.map((index, arrayIndex) =>
      store.subscribeToIndex(index, (data) => {
        setAds((prev) => {
          const next = [...prev];
          next[arrayIndex] = data;
          return next;
        });
      })
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, [indicesKey, store]);

  return indicesKey ? ads : [];
};
