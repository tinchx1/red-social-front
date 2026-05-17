import styles from "./marquee.module.scss"
export default function Marquee({ children, speed = 30, pauseOnHover = true, direction = "left", className = "", gap, repeat = 5 }) {
  return (
    <div className={`${styles.marqueeContainer} ${className}`}>
      <div
        className={styles.marqueeContent}
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: pauseOnHover ? undefined : "running",
          animationDirection: direction === "right" ? "reverse" : "normal",
          ...(gap !== undefined ? { "--gap": typeof gap === "number" ? `${gap}px` : gap } : {}),
        }}
      >
        {Array.from({ length: repeat }).map((_, index) => (
          <div key={index} className={styles.marqueeItemWrapper}>
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
