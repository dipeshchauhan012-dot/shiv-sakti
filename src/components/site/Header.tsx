import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { SITE } from "@/lib/site";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/banquet", label: "Banquet" },
  { to: "/reserve", label: "Reserve" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`glass-nav sticky top-0 z-40 transition-all duration-300 ${scrolled ? "scrolled" : ""}`}>

      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl">
            श
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg md:text-xl text-primary">{SITE.short}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hidden sm:block">
              Restaurant & Banquet
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border hover:border-secondary transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold grid place-items-center">
                {count}
              </span>
            )}
          </button>
          <Link to="/order" className="btn-gold hidden md:inline-flex text-sm">
            Order Online
          </Link>
          <button
            aria-label="Toggle menu"
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-border"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container-x flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="py-3 text-base font-medium text-foreground/80 hover:text-primary border-b border-border/60 last:border-0"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
