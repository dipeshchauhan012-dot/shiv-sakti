import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Calendar, Users, MessageCircle, CheckCircle2, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [
      { title: `Reserve a Table · ${SITE.name} · Surat` },
      { name: "description", content: `Book your family table at ${SITE.name}, ${SITE.city}. Fast confirmation over WhatsApp.` },
      { property: "og:title", content: `Reserve Table — ${SITE.name}` },
      { property: "og:url", content: "/reserve" },
    ],
    links: [{ rel: "canonical", href: "/reserve" }],
  }),
  component: Reserve,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid phone"),
  reservation_date: z.string().min(1, "Pick a date"),
  reservation_time: z.string().min(1, "Pick a time"),
  guest_count: z.coerce.number().int().min(1).max(200),
  special_request: z.string().max(500).optional().or(z.literal("")),
});

function Reserve() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { name: string; date: string; time: string; guests: number }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form"); return;
    }
    setSubmitting(true);

    try {
      await supabase.from("reservations").insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        reservation_date: parsed.data.reservation_date,
        reservation_time: parsed.data.reservation_time,
        guest_count: parsed.data.guest_count,
        special_request: parsed.data.special_request || null,
      });
    } catch (err) {
      console.error("Silent reservation DB log failed, continuing to WhatsApp:", err);
    }

    const message = `Hi Shiv Shakti, I'd like to reserve a table.\n\nName: ${parsed.data.name}\nPhone: ${parsed.data.phone}\nDate: ${parsed.data.reservation_date}\nTime: ${parsed.data.reservation_time}\nGuests: ${parsed.data.guest_count}${parsed.data.special_request ? `\nNotes: ${parsed.data.special_request}` : ""}`;
    const waUrl = whatsappLink(message);

    setSubmitting(false);
    setDone({ name: parsed.data.name, date: parsed.data.reservation_date, time: parsed.data.reservation_time, guests: parsed.data.guest_count });
    
    // Auto-open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Redirecting to WhatsApp to send reservation details...");
  }

  if (done) {
    return (
      <>
        <Toaster />
        <section className="container-x py-24 text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-16 w-16 mx-auto text-[color:var(--whatsapp)] animate-scale-in" />
          <h1 className="mt-4 font-display text-4xl">Reservation details sent</h1>
          <p className="mt-3 text-muted-foreground">Thanks {done.name}! Your reservation request has been sent via WhatsApp. We will confirm shortly.</p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link to="/menu" className="btn-gold px-8 py-3 rounded-full text-base font-semibold">Browse Menu</Link>
            <a
              href={`tel:+91${SITE.phones[0]}`}
              className="btn-outline-gold inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-semibold"
              style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
            >
              <Phone className="h-5 w-5 text-secondary" /> Call to Confirm
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-x text-center">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Table Reservation</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Reserve your <span className="text-gradient-gold">family table</span></h1>
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">Please share your details — confirm over WhatsApp or make a call.</p>
        </div>
      </section>

      <section className="container-x py-12 max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="card-premium p-6 md:p-8 space-y-6 reveal">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name" name="name" required />
            <Field label="Phone" name="phone" type="tel" required inputMode="tel" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Date" name="reservation_date" type="date" required icon={<Calendar className="h-4 w-4" />} />
            <Field label="Time" name="reservation_time" type="time" required />
            <Field label="Guests" name="guest_count" type="number" required min={1} max={200} icon={<Users className="h-4 w-4" />} />
          </div>
          <Field label="Special request (optional)" name="special_request" textarea />
          
          <div className="flex flex-col gap-3 pt-2">
            <button
              disabled={submitting}
              className="w-full rounded-full py-3.5 text-base font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              {submitting ? "Redirecting to WhatsApp…" : "Reserve on WhatsApp"}
            </button>
            
            <a
              href={`tel:+91${SITE.phones[0]}`}
              className="w-full rounded-full py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-border hover:border-secondary bg-card text-foreground"
            >
              <Phone className="h-4 w-4 text-secondary" /> Or Call to Reserve: +91 {SITE.phones[0]}
            </a>
          </div>
        </form>
      </section>
    </>
  );
}

function Field({ label, name, type = "text", required, textarea, inputMode, min, max, icon }: { label: string; name: string; type?: string; required?: boolean; textarea?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; min?: number; max?: number; icon?: React.ReactNode }) {
  const cls = "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1.5">{icon}{label}{required && " *"}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} className={cls + " mt-1"} />
      ) : (
        <input name={name} type={type} required={required} inputMode={inputMode} min={min} max={max} className={cls + " mt-1"} />
      )}
    </label>
  );
}
