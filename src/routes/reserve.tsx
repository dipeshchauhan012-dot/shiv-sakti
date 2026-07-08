import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Calendar, Users, MessageCircle, CheckCircle2 } from "lucide-react";

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
    const { error } = await supabase.from("reservations").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      reservation_date: parsed.data.reservation_date,
      reservation_time: parsed.data.reservation_time,
      guest_count: parsed.data.guest_count,
      special_request: parsed.data.special_request || null,
    });
    setSubmitting(false);
    if (error) { toast.error("Reservation failed. Try WhatsApp instead."); return; }
    setDone({ name: parsed.data.name, date: parsed.data.reservation_date, time: parsed.data.reservation_time, guests: parsed.data.guest_count });
    toast.success("Reservation received!");
  }

  if (done) {
    const wa = whatsappLink(`Hi Shiv Shakti, I just booked a table.\nName: ${done.name}\nDate: ${done.date}\nTime: ${done.time}\nGuests: ${done.guests}`);
    return (
      <>
        <Toaster />
        <section className="container-x py-24 text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-14 w-14 mx-auto text-[color:var(--whatsapp)]" />
          <h1 className="mt-4 font-display text-4xl">Reservation received</h1>
          <p className="mt-3 text-muted-foreground">Thanks {done.name}! We'll confirm your table for <b>{done.guests}</b> on <b>{done.date}</b> at <b>{done.time}</b> shortly.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Confirm on WhatsApp</a>
            <button onClick={() => setDone(null)} className="btn-outline-gold text-primary" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>Book another</button>
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
          <p className="mt-4 text-primary-foreground/80 max-w-lg mx-auto">Please share your details — we'll confirm your table over WhatsApp within minutes.</p>
        </div>
      </section>

      <section className="container-x py-12 max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="card-premium p-6 md:p-8 space-y-5 reveal">
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
          <button disabled={submitting} className="btn-gold w-full">{submitting ? "Booking…" : "Reserve Table"}</button>
          <p className="text-xs text-muted-foreground text-center">By reserving, you agree to be contacted by our team for confirmation.</p>
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
