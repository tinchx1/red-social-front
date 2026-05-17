"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-day-picker/dist/style.css";
import CalendarIcon from "@/assets/calendar.svg?react";
import Input from "@/components/ui/Input/Input";
import styles from "./DatePicker.module.scss";

// Ensure locale is set once for the module
dayjs.locale("es");

const toDate = (value) => (value ? dayjs(value).toDate() : undefined);

const toRange = (value) => {
  if (!value) return undefined;
  if (value.from || value.to) {
    return {
      from: value.from ? dayjs(value.from).toDate() : undefined,
      to: value.to ? dayjs(value.to).toDate() : undefined,
    };
  }
  return undefined;
};

const MonthCalendar = ({
  selectedDate,
  selectedRange,
  month,
  onMonthChange,
  minDate,
  maxDate,
  onSelect,
  mode,
  className,
  disabledDates,
  ...props
}) => {
  const calendarClassName = [styles.calendar, className]
    .filter(Boolean)
    .join(" ");

  const isRangeMode = mode === "range";
  const selected = isRangeMode ? selectedRange : selectedDate;

  const dayPickerProps = {
    mode: mode || "single",
    selected,
    onSelect,
    month,
    onMonthChange,
    fromDate: minDate,
    toDate: maxDate,
    showOutsideDays: false,
    className: calendarClassName,
    navLayout: "around",
    weekStartsOn: 1,
    formatters: {
      formatMonthCaption: (date) => dayjs(date).format("MMMM YYYY"),
      formatWeekdayName: (date) =>
        dayjs(date).format("dd").charAt(0).toUpperCase(),
    },
    ...props,
  };

  if (disabledDates) {
    dayPickerProps.disabled = disabledDates;
  }

  return <DayPicker {...dayPickerProps} />;
};

const DatePicker = ({
  selected,
  value,
  onSelect,
  onChange,
  defaultMonth,
  minDate,
  maxDate,
  className,
  popoverClassName,
  calendarClassName,
  label,
  placeholder = "Seleccioná una fecha",
  format = "DD/MM/YYYY",
  disabled = false,
  inline = false,
  closeOnSelect = true,
  inputProps = {},
  mode = "single",
  disabledDates: externalDisabledDates,
  minDays,
  ...dayPickerProps
}) => {
  const { className: dayPickerClassName, ...restDayPickerProps } =
    dayPickerProps;

  const isRangeMode = mode === "range";
  const isControlled = selected !== undefined || value !== undefined;
  const controlledValue = selected ?? value ?? null;

  // Single date mode
  const [internalSelected, setInternalSelected] = useState(() => {
    if (isRangeMode) return undefined;
    return toDate(controlledValue);
  });

  // Range mode
  const [internalRange, setInternalRange] = useState(() => {
    if (!isRangeMode) return undefined;
    return toRange(controlledValue);
  });

  const selectedDate =
    isControlled && !isRangeMode ? toDate(controlledValue) : internalSelected;

  const selectedRange =
    isControlled && isRangeMode ? toRange(controlledValue) : internalRange;

  const minDateObj = useMemo(() => toDate(minDate), [minDate]);
  const maxDateObj = useMemo(() => toDate(maxDate), [maxDate]);
  const defaultMonthObj = useMemo(() => toDate(defaultMonth), [defaultMonth]);

  // Function to disable dates based on maxDate, minDate, and external disabledDates
  const disabledDates = useMemo(() => {
    // Internal disabled logic
    const internalDisabled = (date) => {
      const dateObj = dayjs(date).startOf("day");
      let isDisabled = false;

      // Disable dates before minDate
      if (minDateObj) {
        const minDateDayjs = dayjs(minDateObj).startOf("day");
        if (dateObj.isBefore(minDateDayjs, "day")) {
          isDisabled = true;
        }
      }

      // Disable dates after maxDate
      if (maxDateObj && !isDisabled) {
        const maxDateDayjs = dayjs(maxDateObj).startOf("day");
        if (dateObj.isAfter(maxDateDayjs, "day")) {
          isDisabled = true;
        }
      }

      return isDisabled;
    };

    // Combine internal and external disabled dates
    if (!externalDisabledDates) {
      return internalDisabled;
    }

    // Both exist: combine them
    return (date) => {
      const isInternallyDisabled = internalDisabled(date);
      const isExternallyDisabled =
        typeof externalDisabledDates === "function"
          ? externalDisabledDates(date)
          : Array.isArray(externalDisabledDates)
          ? externalDisabledDates.some((disabledDate) =>
              dayjs(disabledDate).isSame(dayjs(date), "day")
            )
          : false;

      return isInternallyDisabled || isExternallyDisabled;
    };
  }, [externalDisabledDates, minDateObj, maxDateObj]);

  const findFirstAvailableMonth = useCallback(
    (baseDate) => {
      const startMonth = dayjs(baseDate || new Date()).startOf("month");
      let cursor = startMonth;

      // Look ahead up to 24 months to find a month with at least one enabled day
      for (let i = 0; i < 24; i += 1) {
        const daysInMonth = cursor.daysInMonth();
        let hasEnabledDay = false;

        for (let day = 1; day <= daysInMonth; day += 1) {
          const currentDate = cursor.date(day).toDate();
          if (!disabledDates(currentDate)) {
            hasEnabledDay = true;
            break;
          }
        }

        if (hasEnabledDay) {
          return cursor.toDate();
        }

        cursor = cursor.add(1, "month");
      }

      // Fallback to the starting month if nothing found within the window
      return startMonth.toDate();
    },
    [disabledDates]
  );

  // Determine initial month based on controlled value
  const [month, setMonth] = useState(() => {
    if (defaultMonthObj) return findFirstAvailableMonth(defaultMonthObj);
    if (isRangeMode) {
      const range = toRange(controlledValue);
      if (range?.from) return findFirstAvailableMonth(range.from);
    } else {
      const date = toDate(controlledValue);
      if (date) return findFirstAvailableMonth(date);
    }
    return findFirstAvailableMonth(new Date());
  });

  useEffect(() => {
    if (isControlled) {
      if (isRangeMode) {
        setInternalRange(toRange(controlledValue));
      } else {
        setInternalSelected(toDate(controlledValue));
      }
    }
  }, [controlledValue, isControlled, isRangeMode]);

  useEffect(() => {
    if (isManualMonthChange.current) {
      isManualMonthChange.current = false;
      return;
    }
    if (defaultMonthObj && !dayjs(month).isSame(defaultMonthObj, "month")) {
      setMonth(defaultMonthObj);
    } else if (
      isRangeMode &&
      selectedRange?.from &&
      !dayjs(month).isSame(selectedRange.from, "month")
    ) {
      setMonth(selectedRange.from);
    } else if (
      !isRangeMode &&
      selectedDate &&
      !dayjs(month).isSame(selectedDate, "month")
    ) {
      setMonth(selectedDate);
    }
  }, [defaultMonthObj, isRangeMode, selectedRange, selectedDate, month]);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const isManualMonthChange = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    setMonth((currentMonth) => {
      const nextMonth = findFirstAvailableMonth(currentMonth);
      return dayjs(nextMonth).isSame(currentMonth, "month")
        ? currentMonth
        : nextMonth;
    });
  }, [findFirstAvailableMonth]);

  const openPopover = () => {
    if (disabled) return;
    setIsOpen(true);
    const dateToUse = isRangeMode
      ? selectedRange?.from || selectedRange?.to
      : selectedDate;
    if (dateToUse) {
      const nextMonth = findFirstAvailableMonth(dateToUse);
      if (!dayjs(nextMonth).isSame(month, "month")) {
        setMonth(nextMonth);
      }
    } else if (defaultMonthObj) {
      const nextMonth = findFirstAvailableMonth(defaultMonthObj);
      if (!dayjs(nextMonth).isSame(month, "month")) {
        setMonth(nextMonth);
      }
    } else {
      // Reset to current month when no date is selected
      const nextMonth = findFirstAvailableMonth(new Date());
      if (!dayjs(nextMonth).isSame(month, "month")) {
        setMonth(nextMonth);
      }
    }
  };

  const handleDateSelect = (dateOrRange) => {
    if (isRangeMode) {
      // In range mode, dateOrRange can be undefined when clearing
      if (!dateOrRange) {
        if (!isControlled) {
          setInternalRange(undefined);
        }
        if (onSelect) onSelect(undefined);
        if (onChange) onChange(undefined);
        return;
      }

      let range = dateOrRange;

      // If only one date is selected (from === to), treat it as incomplete
      if (
        range.from &&
        range.to &&
        dayjs(range.from).isSame(dayjs(range.to), "day")
      ) {
        range = {
          from: range.from,
          to: undefined,
        };
      }

      // Check if range is actually complete (from and to are different dates)
      const isRangeComplete =
        range.from &&
        range.to &&
        !dayjs(range.from).isSame(dayjs(range.to), "day");

      // Check if range meets minimum days requirement before closing
      let hasValidationError = false;
      if (isRangeComplete && minDays) {
        const daysDiff = dayjs(range.to).diff(dayjs(range.from), "day") + 1;
        if (daysDiff < minDays) {
          hasValidationError = true;
        }
      }

      if (!isControlled) {
        setInternalRange(range);
      }

      if (onSelect) onSelect(range);
      if (onChange) onChange(range);

      // Close only when range is complete and has no validation errors
      if (closeOnSelect && isRangeComplete && !hasValidationError) {
        setIsOpen(false);
      }
    } else {
      // Single date mode
      if (!dateOrRange) return;

      const date = dateOrRange;
      if (!isControlled) {
        setInternalSelected(date);
      }

      if (onSelect) onSelect(date);
      if (onChange) onChange(date);

      if (closeOnSelect) {
        setIsOpen(false);
      }
    }
  };

  const hasSelection = isRangeMode
    ? selectedRange?.from || selectedRange?.to
    : selectedDate;

  // Calculate days difference for range validation
  const getDaysDifference = (range) => {
    if (!range?.from || !range?.to) return null;
    return dayjs(range.to).diff(dayjs(range.from), "day") + 1; // +1 to include both start and end days
  };

  // Check if range meets minimum days requirement
  const rangeError = useMemo(() => {
    if (!isRangeMode || !minDays) return null;
    if (!selectedRange?.from || !selectedRange?.to) return null;

    const daysDiff = getDaysDifference(selectedRange);
    if (daysDiff < minDays) {
      return `Seleccioná al menos ${minDays} días consecutivos disponibles. El rango actual tiene ${daysDiff} día${
        daysDiff !== 1 ? "s" : ""
      }.`;
    }
    return null;
  }, [isRangeMode, minDays, selectedRange]);

  if (inline) {
    const inlineClassName = [styles.inlineContainer, className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={inlineClassName}>
        <MonthCalendar
          mode={mode}
          selectedDate={selectedDate}
          selectedRange={selectedRange}
          month={month}
          onMonthChange={handleMonthChange}
          minDate={minDateObj}
          maxDate={maxDateObj}
          onSelect={handleDateSelect}
          disabledDates={disabledDates}
          className={[calendarClassName, dayPickerClassName]
            .filter(Boolean)
            .join(" ")}
          {...restDayPickerProps}
        />
        {hasSelection && (
          <div className={styles.resetContainer}>
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              Resetear fechas
            </button>
          </div>
        )}
      </div>
    );
  }

  const {
    onFocus: inputOnFocus,
    onClick: inputOnClick,
    onKeyDown: inputOnKeyDown,
    readOnly: inputReadOnly,
    ...restInputProps
  } = inputProps;

  const getDisplayValue = () => {
    if (isRangeMode) {
      if (
        selectedRange?.from &&
        selectedRange?.to &&
        !dayjs(selectedRange.from).isSame(dayjs(selectedRange.to), "day")
      ) {
        return `${dayjs(selectedRange.from).format(format)} - ${dayjs(
          selectedRange.to
        ).format(format)}`;
      } else if (selectedRange?.from) {
        return `${dayjs(selectedRange.from).format(format)} - ...`;
      }
      return "";
    }
    return selectedDate ? dayjs(selectedDate).format(format) : "";
  };

  const displayValue = getDisplayValue();

  // Update placeholder for range mode
  const rangePlaceholder = isRangeMode
    ? "Seleccioná un rango de fechas"
    : placeholder;

  const rootClassName = [styles.container, className].filter(Boolean).join(" ");
  const popoverClassNames = [styles.popover, popoverClassName]
    .filter(Boolean)
    .join(" ");

  const handleInputFocus = (event) => {
    openPopover();
    if (inputOnFocus) inputOnFocus(event);
  };

  const handleInputClick = (event) => {
    openPopover();
    if (inputOnClick) inputOnClick(event);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      openPopover();
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }

    if (inputOnKeyDown) inputOnKeyDown(event);
  };

  const handleMonthChange = (newMonth) => {
    isManualMonthChange.current = true;
    setMonth(newMonth);
  };

  const handleReset = () => {
    if (isRangeMode) {
      // Always update internal state immediately for responsive UI
      setInternalRange(undefined);
      if (onSelect) onSelect(undefined);
      if (onChange) onChange(undefined);
    } else {
      // Always update internal state immediately for responsive UI
      setInternalSelected(undefined);
      if (onSelect) onSelect(undefined);
      if (onChange) onChange(undefined);
    }
  };

  const hasSelectionForPopover = isRangeMode
    ? selectedRange?.from || selectedRange?.to
    : selectedDate;

  return (
    <div className={rootClassName} ref={containerRef}>
      <Input
        {...restInputProps}
        value={displayValue}
        readOnly={inputReadOnly ?? true}
        label={label}
        placeholder={rangePlaceholder}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onKeyDown={handleInputKeyDown}
        icon={<CalendarIcon color="#101F2A" />}
        iconPosition="left"
        disabled={disabled}
        error={rangeError}
      />
      {isOpen && (
        <div className={popoverClassNames}>
          <MonthCalendar
            mode={mode}
            selectedDate={selectedDate}
            selectedRange={selectedRange}
            month={month}
            onMonthChange={handleMonthChange}
            minDate={minDateObj}
            maxDate={maxDateObj}
            onSelect={handleDateSelect}
            disabledDates={disabledDates}
            className={[calendarClassName, dayPickerClassName]
              .filter(Boolean)
              .join(" ")}
            {...restDayPickerProps}
          />
          {hasSelectionForPopover && (
            <div className={styles.resetContainer}>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleReset}
              >
                Borrar fechas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
