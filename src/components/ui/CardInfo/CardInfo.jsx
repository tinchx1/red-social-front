"use client";
import styles from "./CardInfo.module.scss";

/**
 * CardInfo component that displays a list of items with titles and descriptions.
 *
 * @param {Object} props - Component properties.
 * @param {Array<{title: string, text: string}>} props.items - Array of items to display, each with a title and text.
 * @param {string} [props.className] - Additional CSS class name.
 * @returns {JSX.Element} The CardInfo component.
 */
const CardInfo = ({ items = [], className }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.cardInfo} ${className || ""}`}>
      {items.map((item, index) => (
        <div key={index} className={styles.cardInfo__item}>
          <h3 className={styles.cardInfo__title}>{item.title}</h3>
          <p className={styles.cardInfo__text}>{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default CardInfo;










