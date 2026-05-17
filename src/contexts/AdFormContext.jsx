"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { isValidUrlAds } from "@/utils/validations";
import { getMyProfile } from "@/actions";
import { useAuth } from "@/components/layout/AuthProvider";

const FORMATS = [
  {
    id: "square",
    label: "1",
    width: 167,
    height: 167,
    aspect: 1,
    price: 15000,
    position: 1,
  },
  {
    id: "square_2",
    label: "2",
    width: 167,
    height: 167,
    aspect: 1,
    price: 15000,
    position: 2,
  },
  {
    id: "portrait",
    label: "3",
    width: 167,
    height: 343,
    aspect: 167 / 343,
    price: 25000,
    position: 3,
  },
  {
    id: "landscape",
    label: "4",
    width: 802,
    height: 160,
    aspect: 802 / 160,
    price: 25000,
    position: 4,
  },
];

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const INITIAL_AD_FORM_DATA = {
  clientId: null,
  clickUrl: "",
  position: FORMATS[0].position,
  contractDays: null,
  dailyMinutes: 80,
  startDate: null,
};

const AdFormContext = createContext();

export const AdFormProvider = ({ children }) => {
  const [adFormData, setAdFormData] = useState(INITIAL_AD_FORM_DATA);
  const { user } = useAuth();
  const [selectedFormatId, setSelectedFormatId] = useState(FORMATS[0].id);
  const [dailyMinutes, setDailyMinutes] = useState(80);
  const [croppedImage, setCroppedImage] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingSrc, setPendingSrc] = useState("");
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [totalPrice, setTotalPrice] = useState(null);

  const selectedFormat = useMemo(
    () => FORMATS.find((format) => format.id === selectedFormatId),
    [selectedFormatId]
  );

  useEffect(() => {
    return () => {
      if (croppedImage?.previewUrl) {
        URL.revokeObjectURL(croppedImage.previewUrl);
      }
      if (pendingSrc) {
        URL.revokeObjectURL(pendingSrc);
      }
    };
  }, [croppedImage, pendingSrc]);

  useEffect(() => {
    if (croppedImage && croppedImage.formatId !== selectedFormatId) {
      URL.revokeObjectURL(croppedImage.previewUrl);
      setCroppedImage(null);
    }
  }, [selectedFormatId, croppedImage]);

  useEffect(() => {
    if (!user?.id) return;
    setAdFormData((prev) => {
      if (prev.clientId === user.id) {
        return prev;
      }
      return { ...prev, clientId: user.id };
    });
  }, [user?.id]);

  useEffect(() => {
    if (!selectedFormat?.position) return;
    setAdFormData((prev) => {
      if (prev.position === selectedFormat.position) {
        return prev;
      }
      return { ...prev, position: selectedFormat.position };
    });
  }, [selectedFormat?.position]);

  useEffect(() => {
    setAdFormData((prev) => {
      if (prev.dailyMinutes === dailyMinutes) {
        return prev;
      }
      return { ...prev, dailyMinutes };
    });
  }, [dailyMinutes]);

  const updateAdFormData = useCallback((updates) => {
    setAdFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const validateClickUrl = useCallback((value) => {
    const trimmedValue = value?.trim() || "";
    if (!trimmedValue) {
      setLinkError("Necesitás ingresar el link del anuncio");
      return false;
    }
    if (!isValidUrlAds(trimmedValue)) {
      setLinkError("Ingresá un link válido (ej: https://miempresa.com)");
      return false;
    }
    setLinkError("");
    return true;
  }, []);
  const buildAdPayload = useCallback(async () => {

    if (!croppedImage?.file) {
      throw new Error("Necesitás subir y recortar una imagen.");
    }

    if (!validateClickUrl(adFormData.clickUrl)) {
      throw new Error("Ingresá un link válido para tu anuncio.");
    }
    const userFromProfile = await getMyProfile();
    const required = {
      title:
        "Anuncio de " +
        (userFromProfile?.firstName + (userFromProfile?.lastName ? " " + userFromProfile?.lastName : "")),
      clientId: userFromProfile.id,
      clickUrl: adFormData.clickUrl?.trim(),
      position: selectedFormat?.position ?? adFormData.position,
      contractDays: adFormData.contractDays,
      dailyMinutes: adFormData.dailyMinutes,
      startDate: adFormData.startDate,
    };

    const missing = Object.entries(required)
      .filter(
        ([_, value]) => value === null || value === undefined || value === ""
      )
      .map(([key]) => key);

    if (missing.length) {
      throw new Error(`Faltan datos obligatorios: ${missing.join(", ")}`);
    }

    const assetFile = await fileToBase64(croppedImage.file);

    return {
      ...required,
      assetFile,
    };
  }, [adFormData, croppedImage, selectedFormat?.position, validateClickUrl, user?.id]);

  const handleCropComplete = useCallback(
    ({ file, previewUrl }) => {
      if (croppedImage?.previewUrl) {
        URL.revokeObjectURL(croppedImage.previewUrl);
      }
      setCroppedImage({
        file,
        previewUrl,
        formatId: selectedFormatId,
      });
      setPendingSrc("");
      setPendingFile(null);
    },
    [croppedImage, selectedFormatId]
  );

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setError("El archivo supera los 3MB permitidos.");
        return;
      }

      setError("");
      if (pendingSrc) {
        URL.revokeObjectURL(pendingSrc);
      }

      // Si es GIF, pasar directamente al preview sin recorte
      if (file.type === "image/gif") {
        const objectUrl = URL.createObjectURL(file);
        handleCropComplete({ file, previewUrl: objectUrl });
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPendingFile(file);
      setPendingSrc(objectUrl);
    },
    [pendingSrc, handleCropComplete]
  );

  const handleCropCancel = useCallback(() => {
    if (pendingSrc) {
      URL.revokeObjectURL(pendingSrc);
    }
    setPendingSrc("");
    setPendingFile(null);
  }, [pendingSrc]);

  const handleRemoveImage = useCallback(() => {
    if (croppedImage?.previewUrl) {
      URL.revokeObjectURL(croppedImage.previewUrl);
    }
    setCroppedImage(null);
  }, [croppedImage]);

  const resetForm = useCallback(() => {
    if (croppedImage?.previewUrl) {
      URL.revokeObjectURL(croppedImage.previewUrl);
    }
    if (pendingSrc) {
      URL.revokeObjectURL(pendingSrc);
    }
    setSelectedFormatId(FORMATS[0].id);
    setDailyMinutes(80);
    setCroppedImage(null);
    setPendingFile(null);
    setPendingSrc("");
    setError("");
    setTotalPrice(null);
    setLinkError("");
    setAdFormData((prev) => ({
      ...INITIAL_AD_FORM_DATA,
      clientId: prev.clientId,
    }));
  }, [croppedImage, pendingSrc]);

  return (
    <AdFormContext.Provider
      value={{
        adFormData,
        setAdFormData,
        updateAdFormData,
        FORMATS,
        selectedFormatId,
        setSelectedFormatId,
        selectedFormat,
        dailyMinutes,
        setDailyMinutes,
        croppedImage,
        pendingFile,
        pendingSrc,
        error,
        setError,
        linkError,
        setLinkError,
        totalPrice,
        setTotalPrice,
        validateClickUrl,
        buildAdPayload,
        handleFileChange,
        handleCropCancel,
        handleCropComplete,
        handleRemoveImage,
        resetForm,
      }}
    >
      {children}
    </AdFormContext.Provider>
  );
};

export const useAdForm = () => {
  const context = useContext(AdFormContext);
  if (!context) {
    throw new Error("useAdForm must be used within an AdFormProvider");
  }
  return context;
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
