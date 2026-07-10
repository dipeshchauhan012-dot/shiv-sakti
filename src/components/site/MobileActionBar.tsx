import { Home, Utensils, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { useCart } from "@/lib/cart";

export function MobileActionBar() {
  const { count, setOpen: setCartOpen } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={{ className: "text-primary" }}
          className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground text-[11px] font-medium transition-colors"
        >
          <Home className="h-5 w-5" /> Home
        </Link>
        <Link
          to="/menu"
          activeProps={{ className: "text-primary" }}
          className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground text-[11px] font-medium transition-colors"
        >
          <Utensils className="h-5 w-5" /> Menu
        </Link>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center gap-1 py-2.5 text-muted-foreground text-[11px] font-medium transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </div>
          Cart
        </button>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-muted-foreground text-[11px] font-medium transition-colors hover:text-primary"
        >
          <MapPin className="h-5 w-5" /> Directions
        </a>
      </div>
    </div>
  );
}
