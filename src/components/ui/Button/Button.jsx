"use client";
import styles from "./Button.module.scss";

/**
 * Button component with support for different variants, icons, and styling options.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.variant="default"] - Button variant (default, primary, secondary, etc.).
 * @param {React.ReactNode} [props.icon] - Icon element to display in the button.
 * @param {string} [props.iconPosition="left"] - Position of the icon relative to text ("left" or "right").
 * @param {React.ReactNode} props.children - Button content/text.
 * @param {Function} [props.onClick] - Click event handler function.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {'md'|'sm'|'xs'} [props.size='md'] - Predefined size variants.
 * @param {string} [props.rounded="none"] - Border radius style ("none", "small", "medium", "large").
 * @param {boolean} [props.animate=false] - Whether to apply entrance animation.
 * @param {number} [props.animationDelay=0] - Animation delay in milliseconds.
 * @param {Object} [props.style] - Custom inline styles to apply to the button.
 * @param {Object} props - Additional HTML button attributes.
 * @returns {JSX.Element} The button component.
 */
const Button = ({
  variant = "default",
  icon,
  iconPosition = "left",
  children,
  onClick,
  disabled = false,
  rounded = "none",
  size = "",
  animate = false,
  animationDelay = 0,
  style,
  className,
  ...props
}) => {
  const isIconOnly = icon && !children;

  const getButtonClasses = () => {
    const classes = [styles.button];

    if (variant !== "default") {
      classes.push(styles[`button--${variant}`]);
    }

    if (rounded !== "none") {
      classes.push(styles[`button--rounded-${rounded}`]);
    }

    if (isIconOnly) {
      classes.push(styles["button--icon-only"]);
    }

    if (animate) {
      classes.push(styles["button--animate"]);
    }

    if (size !== "md") {
      classes.push(styles[`button--size-${size}`]);
    }

    return classes.join(" ");
  };

  const renderContent = () => {
    if (isIconOnly) {
      return icon;
    }

    if (!icon) {
      return children;
    }

    return iconPosition === "left" ? (
      <>
        <span className={styles.button__icon}>{icon}</span>
        {children}
      </>
    ) : (
      <>
        {children}
        <span className={styles.button__icon}>{icon}</span>
      </>
    );
  };

  const buttonStyle = animate
    ? {
        ...style,
        animationDelay: `${animationDelay}ms`,
      }
    : style;

  const mergedClassName = [getButtonClasses(), className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={mergedClassName}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
