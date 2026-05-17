"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { DatePicker, Input, Select, Spinner } from "@/components";
import CardInfo from "../CardInfo/CardInfo";
import { useAdForm } from "@/contexts/AdFormContext";
import { getAvailability, calculatePricing } from "@/actions/ads";
import styles from "./DateRangeSelection.module.scss";

const TIME_OPTIONS = [
  { value: 80, label: "80 minutos" },
  { value: 160, label: "160 minutos" },
  { value: 240, label: "240 minutos" },
  { value: 320, label: "320 minutos" },
  { value: 400, label: "400 minutos" },
];

const MIN_DAYS = 15;

export default function DateRangeSelection({ pricingData }) {
  const {
    dailyMinutes,
    setDailyMinutes,
    selectedFormat,
    totalPrice,
    setTotalPrice,
    updateAdFormData,
    adFormData,
  } = useAdForm();

  const [dateRange, setDateRange] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [rangeError, setRangeError] = useState("");

  const minDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date;
  }, []);

  // Función para formatear fecha a YYYY-MM-DD
  const formatDateForAPI = (date) => {
    return dayjs(date).format("YYYY-MM-DD");
  };

  // Función para obtener disponibilidad
  const fetchAvailability = useCallback(
    async (position, dailyMinutesValue, startDate, endDate) => {
      if (!position || !dailyMinutesValue || !startDate || !endDate) {
        setUnavailableDates([]);
        return;
      }

      setLoading(true);
      try {
        const response = await getAvailability({
          position,
          dailyMinutes: dailyMinutesValue,
          startDate: formatDateForAPI(startDate),
          endDate: formatDateForAPI(endDate),
        });
        setUnavailableDates(response.unavailableDates || []);
      } catch (error) {
        console.error("Error fetching availability:", error);
        setUnavailableDates([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Efecto para obtener disponibilidad cuando cambian dailyMinutes o selectedFormat
  // Siempre obtenemos disponibilidad para el rango completo (minDate a maxDate)
  useEffect(() => {
    if (!selectedFormat?.position || !dailyMinutes) return;

    fetchAvailability(selectedFormat.position, dailyMinutes, minDate, maxDate);
  }, [
    selectedFormat?.position,
    dailyMinutes,
    minDate,
    maxDate,
    fetchAvailability,
  ]);

  // Función para verificar si desde una fecha hay 15 días consecutivos disponibles hasta un límite
  const has15ConsecutiveAvailableDaysFromDate = useCallback(
    (testDate, limitDate) => {
      const unavailableSet = new Set(
        unavailableDates.map((date) => {
          if (typeof date === "string" && date.includes("T")) {
            return date.split("T")[0];
          }
          return dayjs(date).format("YYYY-MM-DD");
        })
      );

      const testDateDayjs = dayjs(testDate).startOf("day");
      const limitDateDayjs = dayjs(limitDate).startOf("day");

      let checkedDays = 0;
      let currentDate = testDateDayjs.add(1, "day");

      while (
        checkedDays < MIN_DAYS &&
        !currentDate.isAfter(limitDateDayjs, "day")
      ) {
        const dateStr = currentDate.format("YYYY-MM-DD");

        if (unavailableSet.has(dateStr)) {
          return false;
        }

        checkedDays += 1;
        currentDate = currentDate.add(1, "day");
      }

      return checkedDays === MIN_DAYS;
    },
    [unavailableDates]
  );

  // Calcular disabledDates
  const disabledDates = useMemo(() => {
    const unavailableSet = new Set(
      unavailableDates.map((date) => {
        if (typeof date === "string" && date.includes("T")) {
          return date.split("T")[0];
        }
        return dayjs(date).format("YYYY-MM-DD");
      })
    );

    const minDateDayjs = dayjs(minDate).startOf("day");
    const maxDateDayjs = dayjs(maxDate).startOf("day");
    const last15DaysStart = maxDateDayjs.subtract(MIN_DAYS - 1, "day");

    return (date) => {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const dateDayjs = dayjs(date).startOf("day");

      // Bloquear si está en unavailableDates
      if (unavailableSet.has(dateStr)) {
        return true;
      }

      // No bloquear si está en los últimos 15 días (solo se bloquea si está en unavailableDates)
      if (!dateDayjs.isBefore(last15DaysStart, "day")) {
        return false;
      }

      // Bloquear si desde esta fecha no hay 15 días consecutivos disponibles hasta maxDate
      const has15FromThisDate = has15ConsecutiveAvailableDaysFromDate(
        dateDayjs,
        maxDateDayjs
      );

      return !has15FromThisDate;
    };
  }, [
    unavailableDates,
    has15ConsecutiveAvailableDaysFromDate,
    minDate,
    maxDate,
  ]);

  const basePrices = useMemo(() => {
    if (!pricingData?.positions) {
      return [];
    }

    const pricesText = pricingData.positions
      .map((position) => `*N°${position.position}: ${position.totalPrice}`)
      .join("\n");

    return [
      {
        title: pricesText || "PRECIOS BASE POR ANUNCIO",
      },
    ];
  }, [pricingData]);

  const cardInfoItems = [
    {
      title: "¿CÓMO SE CALCULA EL VALOR TOTAL?",
      text: "El valor total del anuncio se calcula en base a la posición y tamaño del mismo, más la cantidad de tiempo seleccionado por día.",
    },
    {
      title: "PRECIOS BASE POR ANUNCIO",
      text: "El precio base corresponde a 15 días con 80 minutos por día. Este es el mínimo de duración y tiempo diario para contratar un anuncio.",
    },
    ...basePrices,
  ];

  // Función para validar que no haya fechas deshabilitadas en el rango
  const validateDateRange = useCallback(
    (range) => {
      if (!range?.from || !range?.to) {
        return null;
      }

      const fromDate = dayjs(range.from).startOf("day");
      const toDate = dayjs(range.to).startOf("day");
      let currentDate = fromDate;

      while (!currentDate.isAfter(toDate, "day")) {
        if (disabledDates(currentDate.toDate())) {
          return "El rango seleccionado contiene fechas no disponibles";
        }
        currentDate = currentDate.add(1, "day");
      }

      return null;
    },
    [disabledDates]
  );

  const handleDateRangeChange = (range) => {
    const error = validateDateRange(range);
    setRangeError(error || "");
    setDateRange(range || null);
    setPriceError("");
    updateAdFormData({
      startDate: range?.from && !error ? formatDateForAPI(range.from) : null,
    });
  };

  const handleDailyMinutesChange = (value) => {
    setDailyMinutes(value);
    setDateRange(null);
    setPriceError("");
    setRangeError("");
  };

  const basePriceForSelectedFormat = useMemo(() => {
    if (!pricingData?.positions || !selectedFormat?.position) {
      return null;
    }

    const match = pricingData.positions.find(
      (position) => position.position === selectedFormat.position
    );

    if (!match || match.totalPrice === undefined || match.totalPrice === null) {
      return null;
    }

    const parsed = Number(match.totalPrice);
    return Number.isNaN(parsed) ? null : parsed;
  }, [pricingData, selectedFormat?.position]);

  const contractDays = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return null;
    }

    return dayjs(dateRange.to).diff(dayjs(dateRange.from), "day") + 1;
  }, [dateRange]);

  useEffect(() => {
    updateAdFormData({ contractDays });
  }, [contractDays, updateAdFormData]);

  // Sincronizar dateRange local cuando se limpia startDate desde el contexto
  useEffect(() => {
    if (!adFormData.startDate && dateRange) {
      setDateRange(null);
      setRangeError("");
      setPriceError("");
    }
  }, [adFormData.startDate, dateRange]);

  // Validar el rango cuando cambian las fechas deshabilitadas
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const error = validateDateRange(dateRange);
      setRangeError(error || "");
      if (error) {
        updateAdFormData({
          startDate: null,
        });
      }
    }
  }, [dateRange, validateDateRange, updateAdFormData]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      return;
    }
    if (basePriceForSelectedFormat === null) {
      return;
    }
    setTotalPrice(basePriceForSelectedFormat);
  }, [basePriceForSelectedFormat, dateRange, setTotalPrice]);

  useEffect(() => {
    if (
      !selectedFormat?.position ||
      !contractDays ||
      contractDays < MIN_DAYS ||
      !dailyMinutes
    ) {
      setPriceLoading(false);
      return;
    }

    let isSubscribed = true;
    setPriceError("");
    setPriceLoading(true);

    calculatePricing({
      positions: [selectedFormat.position],
      dailyMinutes,
      contractDays,
    })
      .then((response) => {
        if (!isSubscribed) return;
        // El precio puede estar en pricing.totalPrice o en pricing.positions[0].totalPrice
        const computedPrice =
          response?.pricing?.totalPrice ??
          response?.pricing?.positions?.[0]?.totalPrice;
        if (computedPrice === undefined || computedPrice === null) return;
        const parsed = Number(computedPrice);
        if (Number.isNaN(parsed)) return;
        setTotalPrice(parsed);
      })
      .catch((error) => {
        if (!isSubscribed) return;
        console.error("Error calculating pricing:", error);
        setPriceError("No pudimos calcular el valor. Probá de nuevo.");
      })
      .finally(() => {
        if (!isSubscribed) return;
        setPriceLoading(false);
      });

    return () => {
      isSubscribed = false;
      setPriceLoading(false);
    };
  }, [contractDays, dailyMinutes, selectedFormat?.position, setTotalPrice]);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, []);

  const displayPriceValue = useMemo(() => {
    if (priceLoading) {
      return "Calculando";
    }

    const valueToShow = totalPrice ?? basePriceForSelectedFormat ?? null;

    if (valueToShow === null) {
      return "Seleccioná un rango para calcular";
    }

    const formatted = formatCurrency(valueToShow);
    if (!formatted) {
      return "Valor no disponible";
    }

    return `Valor total: ${formatted}`;
  }, [basePriceForSelectedFormat, formatCurrency, priceLoading, totalPrice]);

  return (
    <div className={styles.container}>
      <div className={styles.field}>
        <Select
          label="*Tiempo por día"
          value={dailyMinutes}
          onChange={handleDailyMinutesChange}
          options={TIME_OPTIONS}
          placeholder="80 minutos por día"
        />
      </div>

      <div className={styles.field}>
        <DatePicker
          label="*Desde y hasta"
          mode="range"
          minDate={minDate}
          maxDate={maxDate}
          minDays={MIN_DAYS}
          value={dateRange}
          onChange={handleDateRangeChange}
          disabledDates={disabledDates}
          error={rangeError}
        />
      </div>
      <div className={styles.field}>
        <div className={styles.priceInputWrapper}>
          <Input
            label="Valor del anuncio"
            value={displayPriceValue}
            readOnly
            style={{ backgroundColor: "#E6F3F9", color: "#01618A", opacity: 1 }}
            aria-live="polite"
            error={priceError}
          />
          {priceLoading && (
            <span className={styles.spinnerWrapper}>
              <Spinner size="small" color="primary" />
            </span>
          )}
        </div>
      </div>
      <CardInfo items={cardInfoItems} />
    </div>
  );
}
