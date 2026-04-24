"use client";

import { useEffect, useRef } from "react";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setVisible = () => {
      element.classList.remove("reveal-hidden");
      element.classList.add("reveal-visible");
    };

    const setHidden = () => {
      element.classList.remove("reveal-visible");
      element.classList.add("reveal-hidden");
    };

    if (mediaQuery.matches) {
      setVisible();
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const isInitiallyVisible = rect.top < viewportHeight * 0.92 && rect.bottom > 0;

    if (isInitiallyVisible) {
      setVisible();
      return;
    }

    setHidden();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible();
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ?? ""}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
