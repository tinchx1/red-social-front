import styles from "./Spinner.module.scss"

export default function Spinner({ 
  size = "medium", 
  color = "primary", 
  className = "",
  text = null 
}) {
  const spinnerClasses = [
    styles.spinner,
    styles[`spinner--${size}`],
    styles[`spinner--${color}`],
    className
  ].filter(Boolean).join(" ")

  return (
    <div className={styles.container}>
      <div className={spinnerClasses}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}
