import { Phone, MessageCircle, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import { whatsappGeneric } from "@/lib/whatsapp";

export function MobileActionBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        <a
          href={`tel:+91${SITE.phones[0]}`}
          className="flex flex-col items-center gap-1 py-2.5 text-primary text-[11px] font-medium"
        >
          <Phone className="h-5 w-5" /> Call
        </a>
        <a
          href={whatsappGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-[color:var(--whatsapp)] text-[11px] font-medium"
        >
          <MessageCircle className="h-5 w-5" /> WhatsApp
        </a>
        <Link
          to="/order"
          className="flex flex-col items-center gap-1 py-2.5 text-primary text-[11px] font-medium"
        >
          <ShoppingBag className="h-5 w-5" /> Order
        </Link>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 py-2.5 text-primary text-[11px] font-medium"
        >
          <MapPin className="h-5 w-5" /> Directions
        </a>
      </div>
    </div>
  );
}
