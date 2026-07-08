import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CheckCircle2, MessageCircle, PartyPopper } from "lucide-react";
import banquet from "@/assets/banquet-hall.jpg";

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
    const { error } = await supabase.from("banquet_enquiries").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      event_date: parsed.data.event_date,
      guest_count: parsed.data.guest_count,
      event_type: parsed.data.event_type,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) { toast.error("Enquiry failed. Try WhatsApp instead."); return; }
    setDone({ name: parsed.data.name, date: parsed.data.event_date, guests: parsed.data.guest_count, type: parsed.data.event_type });
    toast.success("Enquiry received!");
  }

  if (done) {
    const wa = whatsappLink(`Hi Shiv Shakti, I've just sent a banquet enquiry.\nName: ${done.name}\nEvent: ${done.type}\nDate: ${done.date}\nGuests: ${done.guests}`);
    return (
      <>
        <Toaster />
        <section className="container-x py-24 text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-14 w-14 mx-auto text-[color:var(--whatsapp)]" />
          <h1 className="mt-4 font-display text-4xl">Enquiry received</h1>
          <p className="mt-3 text-muted-foreground">Thanks {done.name}! Our events team will reach out to plan your <b>{done.type}</b> for <b>{done.guests}</b> guests on <b>{done.date}</b>.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-gold mt-6 inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
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

        <form onSubmit={onSubmit} className="card-premium p-6 md:p-8 space-y-4 reveal-right">
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
          <button disabled={submitting} className="btn-gold w-full">{submitting ? "Sending…" : "Submit Enquiry"}</button>
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
