import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE, primaryPhoneTel } from "@/lib/site";
import { whatsappGeneric, whatsappLink } from "@/lib/whatsapp";
import { MapPin, Phone, Clock, MessageCircle, Instagram } from "lucide-react";
import { toast } from "sonner";
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

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid phone"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  message: z.string().trim().min(2, "Message required").max(2000),
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);

    try {
      await supabase.from("contact_leads").insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        message: parsed.data.message,
      });
    } catch (err) {
      console.error("Silent contact DB log failed, continuing to WhatsApp:", err);
    }

    const text = `Hi Shiv Shakti, I'd like to get in touch.\n\nName: ${parsed.data.name}\nPhone: ${parsed.data.phone}${parsed.data.email ? `\nEmail: ${parsed.data.email}` : ""}\nMessage: ${parsed.data.message}`;
    const waUrl = whatsappLink(text);

    setSubmitting(false);
    
    // Auto-open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Redirecting to WhatsApp to send message...");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-x text-center">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Contact</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">We'd love to <span className="text-gradient-gold">hear from you</span></h1>
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

        <form onSubmit={onSubmit} className="card-premium p-6 space-y-4 reveal-right">
          <h3 className="font-display text-2xl">Send us a message</h3>
          <p className="text-sm text-muted-foreground">Questions, feedback, special requests — we reply within business hours.</p>
          <Field label="Full name" name="name" required />
          <Field label="Phone" name="phone" type="tel" required inputMode="tel" />
          <Field label="Email (optional)" name="email" type="email" />
          <Field label="Message" name="message" required textarea />
          
          <div className="pt-2">
            <button
              disabled={submitting}
              className="w-full rounded-full py-3.5 text-base font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              {submitting ? "Redirecting to WhatsApp…" : "Send Message on WhatsApp"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, textarea, inputMode }: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  const cls = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className={cls + " mt-1"} />
      ) : (
        <input name={name} type={type} required={required} inputMode={inputMode} className={cls + " mt-1"} />
      )}
    </label>
  );
}
