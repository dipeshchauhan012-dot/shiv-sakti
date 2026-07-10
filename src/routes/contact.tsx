import { createFileRoute } from "@tanstack/react-router";
import { SITE, primaryPhoneTel } from "@/lib/site";
import { whatsappGeneric } from "@/lib/whatsapp";
import { MapPin, Phone, Clock, MessageCircle, Instagram } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact · ${SITE.name} · Surat` },
      { name: "description", content: `Reach ${SITE.name} — address, phone numbers, WhatsApp and directions in ${SITE.city}.` },
      { property: "og:title", content: `Contact ${SITE.name}` },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-x text-center">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Contact</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-normal">We'd love to <span className="text-gradient-gold">hear from you</span></h1>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-2 gap-10">
        <div className="space-y-6 reveal-left">
          <div className="card-premium p-6">
            <h3 className="font-display text-2xl">Visit us</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" /><span>{SITE.address}</span></div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Lunch {SITE.hours.lunch}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Dinner {SITE.hours.dinner}</div>
              {SITE.phones.map((p) => (
                <a key={p} href={`tel:+91${p}`} className="flex items-center gap-2 hover:text-secondary"><Phone className="h-4 w-4 text-secondary" /> +91 {p}</a>
              ))}
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-secondary"><Instagram className="h-4 w-4 text-secondary" /> @{SITE.instagram}</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={primaryPhoneTel} className="btn-gold inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Call Now</a>
              <a href={whatsappGeneric()} target="_blank" rel="noopener noreferrer" className="btn-outline-gold text-primary inline-flex items-center gap-2" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-gold text-primary" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>Directions</a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-elegant)]">
            <iframe title="Map" src={SITE.mapsEmbed} className="w-full h-[340px]" loading="lazy" />
          </div>
        </div>

        <div className="card-premium p-6 md:p-8 flex flex-col justify-center items-center text-center space-y-6 reveal-right">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-display text-2xl md:text-3xl">Chat with us</h3>
            <p className="mt-3 text-muted-foreground max-w-sm mx-auto text-sm md:text-base leading-relaxed">
              Have questions about our menu, party orders, banquet booking, or feedback? Connect with our team directly on WhatsApp for fast, friendly support!
            </p>
          </div>
          <a
            href={whatsappGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-sm rounded-full py-3.5 text-base font-semibold transition-all flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md cursor-pointer"
          >
            <MessageCircle className="h-5 w-5" /> Send Message on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
