import { MessageCircle } from "lucide-react";
import { whatsappGeneric } from "@/lib/whatsapp";

export function WhatsAppFAB() {
  return (
    <a
      href={whatsappGeneric()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="animate-pulse-whatsapp fixed z-40 bottom-20 right-4 md:bottom-6 md:right-6 grid h-14 w-14 place-items-center rounded-full bg-[color:var(--whatsapp)] text-white shadow-[0_10px_30px_-6px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
