"use client";
import { useState, forwardRef, useId } from "react";

import styles from "./Input.module.scss";

const Input = forwardRef(
  (
    {
      label,
      error,
      showPasswordToggle = false,
      type = "text",
      className,
      containerClassName,
      id,
      autocomplete,
      rounded = "small",
      icon,
      iconPosition = "left",
      placeholder,
      onChange,
      onBlur,
      onFocus,
      as,
      rows,
      labelWhite = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [fileName, setFileName] = useState("");
    const inputId = id || useId();

    const inputType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

    const handleFileChange = (e) => {
      if (type === "file" && e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name);
      }
      // Always call the external onChange handler if provided
      if (onChange) {
        onChange(e);
      }
    };

    const handleFocus = (event) => {
      setIsFocused(true);
      if (typeof onFocus === "function") {
        onFocus(event);
      }
    };

    const handleBlur = (event) => {
      setIsFocused(false);
      if (typeof onBlur === "function") {
        onBlur(event);
      }
    };

    const getInputClasses = () => {
      const classes = [styles.input];
      if (error) classes.push(styles["input--error"]);
      if (isFocused) classes.push(styles["input--focused"]);
      if (rounded !== "none") classes.push(styles[`input--rounded-${rounded}`]);
      if (type === "file") classes.push(styles["input--file"]);
      if (as === "textarea") classes.push(styles["input--textarea"]);
      if (showPasswordToggle) classes.push(styles["input--password"]);
      if (className) classes.push(className);
      return classes.join(" ");
    };

    const getInputContainerClasses = () => {
      const classes = [styles.inputContainer];
      if (type === "file") classes.push(styles["inputContainer--file"]);
      if (icon && iconPosition === "right")
        classes.push(styles["inputContainer--iconRight"]);
      return classes.join(" ");
    };

    const getIconClasses = () => {
      const classes = [styles.icon];
      if (iconPosition === "right") classes.push(styles["icon--right"]);
      return classes.join(" ");
    };

    const getLabelClasses = () => {
      const classes = [styles.label];
      if (labelWhite) classes.push(styles["label--white"]);
      return classes.join(" ");
    };

    return (
      <>
        <div className={`${styles.inputWrapper} ${containerClassName || ""}`}>
          {label && (
            <label htmlFor={inputId} className={getLabelClasses()}>
              {label}
            </label>
          )}
          <div className={getInputContainerClasses()}>
            <div className={styles.inputRow}>
              {icon && iconPosition === "left" && (
                <span className={getIconClasses()}>
                  {typeof icon === "string" ? (
                    <img src={icon} alt="icon" />
                  ) : (
                    icon
                  )}
                </span>
              )}
              {type === "file" ? (
                <div className={styles.fileInputWrapper}>
                  <input
                    ref={ref}
                    id={inputId}
                    name={inputId}
                    type={inputType}
                    autoComplete={autocomplete}
                    className={getInputClasses()}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleFileChange}
                    {...props}
                  />
                  <span
                    className={styles.fileInputText}
                    title={fileName || placeholder || "Seleccionar archivo"}
                  >
                    {fileName || placeholder || "Seleccionar archivo"}
                  </span>
                </div>
              ) : as === "textarea" ? (
                <textarea
                  ref={ref}
                  id={inputId}
                  name={inputId}
                  autoComplete={autocomplete}
                  className={getInputClasses()}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={
                    icon && iconPosition === "left" ? { paddingLeft: 40 } : {}
                  }
                  placeholder={placeholder}
                  onChange={onChange}
                  rows={rows}
                  {...props}
                />
              ) : (
                <input
                  ref={ref}
                  id={inputId}
                  name={inputId}
                  type={inputType}
                  autoComplete={autocomplete}
                  className={getInputClasses()}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  style={
                    icon && iconPosition === "left" ? { paddingLeft: 40 } : {}
                  }
                  placeholder={placeholder}
                  onChange={onChange}
                  {...props}
                />
              )}
              {icon && iconPosition === "right" && (
                <span className={getIconClasses()}>
                  {typeof icon === "string" ? (
                    <img src={icon} alt="icon" />
                  ) : (
                    icon
                  )}
                </span>
              )}
              {showPasswordToggle && (
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
          {error && <span className={styles.error}>{error}</span>}
        </div>
      </>
    );
  }
);

Input.displayName = "Input";

export default Input;
