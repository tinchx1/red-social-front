import styles from "./SectorSelector.module.scss"

const SectorSelector = ({ sectors, selected, onSelect, required = false }) => (
  <div className={styles.sectorSelector} aria-required={required ? 'true' : undefined}>
    {sectors.map((sector) => (
      <button
        type="button"
        key={sector}
        className={`${styles.sectorButton} ${selected.includes(sector) ? styles['sectorButton--selected'] : ''}`}
        onClick={() => onSelect(sector)}
      >
        {sector}
      </button>
    ))}
  </div>
)

export default SectorSelector