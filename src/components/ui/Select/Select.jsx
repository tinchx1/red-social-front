"use client";

import { useState, useRef, useEffect, useId } from "react";
import styles from "./Select.module.scss";

/**
 * @param {Object} props
 * @param {string} [props.label]
 * @param {*} props.value
 * @param {(value: *) => void} props.onChange
 * @param {Array<{value: *, label: string}>} props.options
 * @param {string} [props.placeholder="Seleccionar"]
 * @param {string} [props.error]
 * @param {string} [props.className]
 * @param {string} [props.containerClassName]
 * @param {boolean} [props.useCustomSelectedStyle=false]
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.truncate=false]
 * @param {string} [props.prefixClass]
 * @param {'blue' | 'light-blue' | 'neutral'} [props.variant]
 * @param {'bottom' | 'top'} [props.placement="bottom"]
 * @param {number} [props.tabIndex=0]
 * @param {string|number} [props.dropdownWidth] - Width for the dropdown options container
 */
export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  error,
  className,
  containerClassName,
  useCustomSelectedStyle = false,
  disabled = false,
  truncate = false,
  prefixClass,
  variant, // 'blue' | 'light-blue' | 'neutral'
  placement = "bottom", // 'bottom' | 'top'
  tabIndex = 0,
  dropdownWidth, // width for the dropdown options container
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);
  const selectId = useId();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setIsFocused(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsFocused(false);
  };

  const renderWithPrefix = (label) => {
    if (!prefixClass || typeof label !== "string") return label;
    const parts = label.split(/:\s*/);
    if (parts.length < 2) return label;
    const [prefix, ...restParts] = parts;
    const rest = restParts.join(": ");
    return (
      <>
        <p>
          <span className={prefixClass}>{prefix}:</span> {rest}
        </p>
      </>
    );
  };

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption
    ? renderWithPrefix(selectedOption.label)
    : placeholder;

  const getSelectClasses = () => {
    const classes = [styles.select];
    if (error) classes.push(styles["select--error"]);
    if (isFocused || isOpen) classes.push(styles["select--focused"]);
    if (disabled) classes.push(styles["select--disabled"]);
    if (!truncate) classes.push(styles["select--wrap"]); // allow auto height when not truncating
    if (variant && styles[`select--${variant}`])
      classes.push(styles[`select--${variant}`]);
    if (className) classes.push(className);
    return classes.join(" ");
  };

  return (
    <div className={`${styles.selectWrapper} ${containerClassName || ""}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.selectContainer} ref={selectRef}>
        <div
          id={selectId}
          className={getSelectClasses()}
          onClick={handleToggle}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : tabIndex}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <span
            className={`${prefixClass ? "" : styles.selectValue} ${
              !selectedOption ? styles.placeholder : ""
            } ${
              selectedOption
                ? `${styles.selected} ${
                    useCustomSelectedStyle ? styles.selectedCustom : ""
                  }`
                : ""
            } ${styles.truncate}`}
          >
            {displayValue}
          </span>
          <svg
            className={`${styles.selectArrow} ${
              isOpen ? styles["selectArrow--open"] : ""
            }`}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>

        {isOpen && (
          <div
            className={`${styles.selectDropdown} ${
              placement === "top" ? styles["selectDropdownTop"] : ""
            }`}
            style={dropdownWidth ? { width: dropdownWidth } : undefined}
            role="listbox"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`${styles.selectOption} ${
                  option.value === value ? styles["selectOption--selected"] : ""
                } ${truncate ? styles.truncate : styles.wrap}`}
                onClick={() => handleOptionSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {renderWithPrefix(option.label)}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
