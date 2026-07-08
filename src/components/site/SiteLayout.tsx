import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileActionBar } from "./MobileActionBar";
import { WhatsAppFAB } from "./WhatsAppFAB";
import { CartDrawer } from "./CartDrawer";
import { Preloader } from "./Preloader";
import { CartProvider } from "@/lib/cart";

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute("data-delay") || "0", 10);
            const timerId = setTimeout(() => {
              entry.target.classList.add("revealed");
            }, delay);
            (entry.target as any)._revealTimer = timerId;
          } else {
            // Cancel pending animation timer and hide the element again on scroll exit
            const targetEl = entry.target as any;
            if (targetEl._revealTimer) {
              clearTimeout(targetEl._revealTimer);
              targetEl._revealTimer = null;
            }
            targetEl.classList.remove("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const observeElements = () => {
      const revealEls = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right"
      );
      revealEls.forEach((el) => {
        if (!el.classList.contains("revealed")) {
          observer.observe(el);
        }
      });
    };

    // Observe already rendered elements
    observeElements();

    // Observe newly added elements (e.g. after Suspense resolves data fetching)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location.pathname]); // MutationObserver handles content changes, so we only need to re-run on path changes


  return (
    <CartProvider>
      <Preloader />

      {/* Top Scroll Progress Indicator */}
      <div 
        className="scroll-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <div className="flex min-h-screen flex-col relative overflow-hidden">
        {/* Ambient Drifting Particles in Background */}
        <div className="ambient-particle ambient-particle-gold w-40 h-40 top-[15%] left-[5%]" />
        <div className="ambient-particle ambient-particle-red w-32 h-32 top-[45%] right-[8%]" />
        <div className="ambient-particle ambient-particle-gold w-48 h-48 top-[70%] left-[12%]" />
        <div className="ambient-particle ambient-particle-red w-36 h-36 top-[85%] right-[4%]" />

        <Header />
        
        {/* Main Content with Transition Key */}
        <main key={location.pathname} className="flex-1 pb-24 md:pb-0 page-fade-in relative z-10">
          {children}
        </main>
        
        <Footer />
      </div>
      <WhatsAppFAB />
      <MobileActionBar />
      <CartDrawer />
    </CartProvider>
  );
}


