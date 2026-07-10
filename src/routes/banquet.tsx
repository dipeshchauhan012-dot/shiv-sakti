import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2, MessageCircle, PartyPopper, Phone } from "lucide-react";
import banquet from "@/assets/banquet-hall.jpg";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/banquet")({
  head: () => ({
    meta: [
      { title: `Banquet Booking · ${SITE.name} · Weddings, Parties, Events Surat` },
      { name: "description", content: `Book our banquet hall for weddings, engagements, birthdays, corporate lunches & family functions in ${SITE.city}. Custom menu, décor & service.` },
      { property: "og:title", content: `Banquet Booking — ${SITE.name}` },
      { property: "og:url", content: "/banquet" },
    ],
    links: [{ rel: "canonical", href: "/banquet" }],
  }),
  component: Banquet,
});

const EVENT_TYPES = ["Wedding", "Engagement", "Birthday Party", "Anniversary", "Corporate Event", "Family Gathering", "Kitty Party", "Other"];

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/),
  event_date: z.string().min(1),
  guest_count: z.coerce.number().int().min(1).max(2000),
  event_type: z.string().min(1),
  message: z.string().max(2000).optional().or(z.literal("")),
});

function Banquet() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { name: string; date: string; guests: number; type: string }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the form"); return; }
    setSubmitting(true);

    try {
      await supabase.from("banquet_enquiries").insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        event_date: parsed.data.event_date,
        guest_count: parsed.data.guest_count,
        event_type: parsed.data.event_type,
        message: parsed.data.message || null,
      });
    } catch (err) {
      console.error("Silent banquet DB log failed, continuing to WhatsApp:", err);
    }

    const message = `Hi Shiv Shakti, I'd like to enquire about banquet hall booking.\n\nName: ${parsed.data.name}\nPhone: ${parsed.data.phone}\nEvent Type: ${parsed.data.event_type}\nDate: ${parsed.data.event_date}\nGuests: ${parsed.data.guest_count}${parsed.data.message ? `\nNotes: ${parsed.data.message}` : ""}`;
    const waUrl = whatsappLink(message);

    setSubmitting(false);
    setDone({ name: parsed.data.name, date: parsed.data.event_date, guests: parsed.data.guest_count, type: parsed.data.event_type });
    
    // Auto-open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Redirecting to WhatsApp to send enquiry...");
  }

  if (done) {
    return (
      <>
        <Toaster />
        <section className="container-x py-24 text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-16 w-16 mx-auto text-[color:var(--whatsapp)] animate-scale-in" />
          <h1 className="mt-4 font-display text-4xl">Enquiry details sent</h1>
          <p className="mt-3 text-muted-foreground">Thanks {done.name}! Your banquet enquiry has been sent via WhatsApp. Our events team will contact you shortly.</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link to="/menu" className="btn-gold px-8 py-3 rounded-full text-base font-semibold">Browse Menu</Link>
            <a
              href={`tel:+91${SITE.phones[0]}`}
              className="btn-outline-gold inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold"
              style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
            >
              <Phone className="h-5 w-5 text-secondary" /> Call Events Team
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="relative overflow-hidden">
        <img src={banquet} alt="Banquet hall" width={1600} height={1000} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="container-x relative py-20 text-primary-foreground">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Banquet Booking</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl max-w-2xl">Host your <span className="text-gradient-gold">celebration</span> with us</h1>
          <p className="mt-5 max-w-xl text-primary-foreground/85">Weddings, engagements, birthdays, corporate events & family functions — custom menu, décor & service, all pure vegetarian.</p>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-2 gap-10">
        <div className="space-y-5 reveal-left">
          <div className="card-premium p-6">
            <PartyPopper className="h-8 w-8 text-secondary" />
            <h3 className="mt-3 font-display text-2xl">What we handle</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Custom pure-veg menu planning across cuisines</li>
              <li>• Floral & décor coordination options</li>
              <li>• Dedicated waitstaff & event manager</li>
              <li>• Buffet, plated, or live-counter service</li>
              <li>• Kids' menu & senior-friendly options</li>
              <li>• Corporate lunches & tea packages</li>
            </ul>
          </div>
          <div className="card-premium p-6">
            <h3 className="font-display text-2xl">Event types</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <span key={t} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card-premium p-6 md:p-8 space-y-5 reveal-right">
          <h3 className="font-display text-2xl">Send an enquiry</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name" name="name" required />
            <Field label="Phone" name="phone" type="tel" required inputMode="tel" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Event date" name="event_date" type="date" required />
            <Field label="Guest count" name="guest_count" type="number" required min={1} max={2000} />
          </div>
          <label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Event type *</span>
            <select name="event_type" required className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30">
              <option value="">Select event type…</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <Field label="Message / requirements (optional)" name="message" textarea />
          
          <div className="flex flex-col gap-3 pt-2">
            <button
              disabled={submitting}
              className="w-full rounded-full py-3.5 text-base font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              {submitting ? "Redirecting to WhatsApp…" : "Send Enquiry on WhatsApp"}
            </button>
            
            <a
              href={`tel:+91${SITE.phones[0]}`}
              className="w-full rounded-full py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-border hover:border-secondary bg-card text-foreground"
            >
              <Phone className="h-4 w-4 text-secondary" /> Or Call Events Team: +91 {SITE.phones[0]}
            </a>
          </div>
        </form>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, textarea, inputMode, min, max }: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; min?: number; max?: number }) {
  const cls = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}{required && " *"}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} className={cls + " mt-1"} />
      ) : (
        <input name={name} type={type} required={required} inputMode={inputMode} min={min} max={max} className={cls + " mt-1"} />
      )}
    </label>
  );
}
