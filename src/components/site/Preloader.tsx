import { useEffect, useState, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export function Preloader() {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [destroy, setDestroy] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isInitial = useRef(true);

  // Set mounted to true only on the client after hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isInitial.current) {
      isInitial.current = false;
      // Initial page entry: play full preloader for 2.2s
      setIsNavigating(false);
      setHidden(false);
      setDestroy(false);
      document.body.style.overflow = "hidden";

      const timerHide = setTimeout(() => {
        setHidden(true);
        document.body.style.overflow = "";
      }, 2200);

      const timerDestroy = setTimeout(() => {
        setDestroy(true);
      }, 2800);

      return () => {
        clearTimeout(timerHide);
        clearTimeout(timerDestroy);
        document.body.style.overflow = "";
      };
    } else {
      // Subsequent navigations: play quick preloader transition for 900ms
      setIsNavigating(true);
      setDestroy(false);
      setHidden(false);
      
      const timerHide = setTimeout(() => {
        setHidden(true);
      }, 900);

      const timerDestroy = setTimeout(() => {
        setDestroy(true);
      }, 1400);

      return () => {
        clearTimeout(timerHide);
        clearTimeout(timerDestroy);
      };
    }
  }, [location.pathname, mounted]);

  // Return null during server rendering and initial client hydration to avoid mismatch
  if (!mounted || destroy) return null;

  return (
    <div className={`preloader ${hidden ? "hidden" : ""} ${isNavigating ? "is-navigating" : ""}`} aria-hidden="true">
      <div className="preloader-logo">{SITE.short || "Shiv Shakti"}</div>
      <div className="preloader-tagline">Restaurant &amp; Banquet</div>
      <div className="preloader-bar-track">
        <div className="preloader-bar-fill" />
      </div>
    </div>
  );
}
