"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.scss";

/**
 * @param {{
 *   content: string | React.ReactNode;
 *   children: React.ReactNode;
 *   position?: 'top' | 'bottom' | 'left' | 'right';
 *   delay?: number;
 *   className?: string;
 *   tooltipClassName?: string;
 *   disabled?: boolean;
 *   noBackground?: boolean;
 * }} props
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
  tooltipClassName = "",
  disabled = false,
  noBackground = false,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !triggerRef.current) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipPosition = () => {
    const offset = 8; // Espacio entre trigger y tooltip

    switch (position) {
      case "top":
        return {
          left: coords.x,
          top: coords.y - offset,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          left: coords.x,
          top: coords.y + offset,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          left: coords.x - offset,
          top: coords.y,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          left: coords.x + offset,
          top: coords.y,
          transform: "translate(0, -50%)",
        };
      default:
        return {
          left: coords.x,
          top: coords.y - offset,
          transform: "translate(-50%, -100%)",
        };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`${styles.trigger} ${className}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>

      {isVisible &&
        createPortal(
          <div
            className={`${styles.tooltip} ${styles[position]} ${tooltipClassName} ${noBackground ? styles.noBackground : ''}`}
            style={getTooltipPosition()}
            role="tooltip"
          >
            <div className={styles.content}>{content}</div>
            <div className={styles.arrow} />
          </div>,
          document.body
        )}
    </>
  );
}