"use client";
import { useEffect, useState } from "react";
import styles from "./Toast.module.scss";

/**
 * Toast component
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showToast - Determines whether the toast is visible
 * @param {function} props.setShowToast - Function to update the toast state
 * @param {number} props.status - Determines the status (Success = 200, Error = 404)
 * @param {string} props.textSuccess - Text to show when the status is Success
 * @param {string} props.textError - Text to show when the status is Error
 * @param {number} props.duration - Duration of the toast to be visible
 * @param {string|null} props.linkToPost - Optional link to redirect to the shared post
 * @returns {JSX.Element} The toast component
 */
const Toast = ({
  showToast,
  setShowToast,
  status,
  textSuccess,
  textError,
  duration,
  linkToPost,
  linkLabel = "Ver publicación compartida",
}) => {
  const [loadingBarWidth, setLoadingBarWidth] = useState(0);

  useEffect(() => {
    let intervalId;
    let startTime;

    const toastDuration = () => {
      const elapsedTime = Date.now() - startTime;
      const newWidth = Math.min((elapsedTime / duration) * 100, 100);
      setLoadingBarWidth(newWidth);

      if (elapsedTime >= duration) {
        clearInterval(intervalId);
        setShowToast(false);
      }
    };

    if (showToast) {
      setLoadingBarWidth(0);
      startTime = Date.now();

      intervalId = setInterval(toastDuration, 10);
    }

    return () => clearInterval(intervalId);
  }, [showToast, duration, setShowToast]);

  return (
    <div
      className={`${styles.toast} ${showToast ? styles["toast-display"] : ""} ${
        status === 404 ? styles["error-toast"] : styles["success-toast"]
      }`}
    >
      <div className={styles.toastContent}>
        <p>
          {status === 200 ? textSuccess : textError}
          {status === 200 && linkToPost && (
            <>
              {" "}
              <a
                className={styles.linkButton}
                href={linkToPost}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkLabel}
              </a>
            </>
          )}
        </p>
      </div>
      <hr
        className={styles["loading-bar"]}
        style={{ width: `${loadingBarWidth}%` }}
      />
    </div>
  );
};

export default Toast;
