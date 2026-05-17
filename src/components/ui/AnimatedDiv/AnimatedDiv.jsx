"use client";
import React, { useEffect, useRef, useState, isValidElement, cloneElement } from "react";
import styles from "./AnimatedDiv.module.scss";

/**
 * @param {{ children: React.ReactNode; animation?: "fadeInUp" | "fadeIn" | "slideInLeft" | "scaleIn"; className?: string; delay?: number }} props
 */
export default function AnimatedDiv({
  children,
  animation = "fadeInUp",
  className = "",
  delay = 0,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px 0px -50px 0px",
      },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay]);

  const getClasses = () => {
    let baseClass = "";
    let animatedClass = "";

    switch (animation) {
      case "fadeInUp":
        baseClass = styles.fadeInUpInitial;
        animatedClass = styles.fadeInUpAnimated;
        break;
      case "fadeIn":
        baseClass = styles.fadeInInitial;
        animatedClass = styles.fadeInAnimated;
        break;
      case "slideInLeft":
        baseClass = styles.slideInLeftInitial;
        animatedClass = styles.slideInLeftAnimated;
        break;
      case "scaleIn":
        baseClass = styles.scaleInInitial;
        animatedClass = styles.scaleInAnimated;
        break;
      default:
        baseClass = styles.fadeInUpInitial;
        animatedClass = styles.fadeInUpAnimated;
    }

    return isVisible ? animatedClass : baseClass;
  };

  const animationClasses = `${getClasses()} ${className}`.trim();

  // If a single valid React element is passed, clone it to avoid wrapper layout issues
  if (isValidElement(children)) {
    const existingClassName = children.props.className || "";
    const childClassName = [existingClassName, animationClasses].filter(Boolean).join(" ");
    return cloneElement(children, {
      ref: elementRef,
      className: childClassName,
    });
  }

  // Fallback for multiple or non-element children: wrapper with display: contents to avoid affecting layout
  return (
    <div ref={elementRef} className={`${styles.displayContents} ${animationClasses}`.trim()}>
      {children}
    </div>
  );
}