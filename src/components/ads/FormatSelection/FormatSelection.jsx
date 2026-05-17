"use client";
import CardInfo from "../CardInfo/CardInfo";
import styles from "./FormatSelection.module.scss";
import { useAdForm } from "@/contexts/AdFormContext";

export default function FormatSelection() {
  const { FORMATS, selectedFormatId, setSelectedFormatId } = useAdForm();

  return (
    <div className={styles.field}>
      <div className={styles.formatGrid}>
        {FORMATS.map((format) => {
          const isActive = format.id === selectedFormatId;
          const gridClass = styles[`formatPosition${format.position}`];
          return (
            <button
              key={format.id}
              type="button"
              className={`${styles.formatOption} ${gridClass} ${
                isActive ? styles.formatOptionActive : ""
              }`}
              style={{
                width: format.width,
                height: format.position === 4 ? 80 : format.height,
              }}
              onClick={() => setSelectedFormatId(format.id)}
            >
              <span className={styles.formatLabel}>{format.label}</span>
            </button>
          );
        })}
      </div>
      <CardInfo
        items={[
          {
            title: "ANUNCIO CUADRADO",
            text: "*El formato de imagen debe ser de 257x257px y pesar menos de 3mb.",
          },
          {
            title: "ANUNCIO RECTANGULAR",
            text: "*El formato de imagen debe ser de 257x514px y pesar menos de 3mb.",
          },
          {
            title: "ANUNCIO HORIZONTAL",
            text: "*El formato de imagen debe ser de 802x160px y pesar menos de 3mb.",
          },
        ]}
      />
    </div>
  );
}
