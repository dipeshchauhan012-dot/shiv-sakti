import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { SITE } from "@/lib/site";
import { whatsappLink, whatsappOrderMessage } from "@/lib/whatsapp";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Minus, Plus, Trash2, MessageCircle, CheckCircle2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/order")({
  head: () => ({
    meta: [
      { title: `Order Online · ${SITE.name} · Surat` },
      { name: "description", content: `Order online from ${SITE.name} — dine-in, takeaway or home delivery in ${SITE.city}. Also order over WhatsApp.` },
      { property: "og:title", content: `Order Online — ${SITE.name}` },
      { property: "og:url", content: "/order" },
    ],
    links: [{ rel: "canonical", href: "/order" }],
  }),
  component: OrderPage,
});

const schema = z.object({
  order_type: z.enum(["dine_in", "takeaway", "delivery"]),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid phone"),
  address: z.string().max(500).optional().or(z.literal("")),
  landmark: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

function OrderPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "delivery">("delivery");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<null | { orderNumber?: number; whatsappUrl: string; name: string }>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) { toast.error("Your cart is empty"); return; }
    const fd = new FormData(e.currentTarget);
    fd.set("order_type", orderType);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Please check the form"); return; }
    if (parsed.data.order_type === "delivery" && !parsed.data.address) { toast.error("Delivery address required"); return; }

    setSubmitting(true);
    let orderNumber: number | undefined;

    try {
      // upsert customer
      const { data: cust } = await supabase.from("customers").upsert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        address: parsed.data.address || null,
        landmark: parsed.data.landmark || null,
      }, { onConflict: "phone" }).select("id").maybeSingle();

      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        customer_id: cust?.id ?? null,
        customer_name: parsed.data.name,
        customer_phone: parsed.data.phone,
        order_type: parsed.data.order_type,
        address: parsed.data.address || null,
        landmark: parsed.data.landmark || null,
        notes: parsed.data.notes || null,
        subtotal,
        total: subtotal,
      }).select("id, order_number").single();

      if (order && !orderErr) {
        orderNumber = order.order_number;
        const orderItems = items.map((i) => ({
          order_id: order.id,
          menu_item_id: i.id,
          item_name: i.name,
          unit_price: i.price,
          quantity: i.qty,
          line_total: i.price * i.qty,
        }));
        await supabase.from("order_items").insert(orderItems);
      }
    } catch (err) {
      console.error("Silent DB logging failed, continuing to WhatsApp:", err);
    }

    const msg = whatsappOrderMessage({
      name: parsed.data.name,
      phone: parsed.data.phone,
      orderType: parsed.data.order_type,
      items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      total: subtotal,
      address: parsed.data.address,
      landmark: parsed.data.landmark,
      notes: parsed.data.notes,
      orderNumber,
    });
    const whatsappUrl = whatsappLink(msg);

    setSubmitting(false);
    setConfirmed({ orderNumber, whatsappUrl, name: parsed.data.name });
    
    // Auto-open WhatsApp
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    clear();
    toast.success("Redirecting to WhatsApp to send order...");
  }

  if (confirmed) {
    return (
      <>
        <Toaster />
        <section className="container-x py-24 text-center max-w-xl mx-auto">
          <CheckCircle2 className="h-16 w-16 mx-auto text-[color:var(--whatsapp)]" />
          <h1 className="mt-4 font-display text-4xl">Thank you, {confirmed.name}!</h1>
          <p className="mt-2 text-muted-foreground">Your order details have been compiled. Please send the message on WhatsApp to confirm with our team.</p>
          <div className="mt-6 flex gap-3 justify-center flex-wrap">
            <a href={confirmed.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center gap-2" style={{ backgroundColor: "#25D366", borderColor: "#25D366", color: "#fff" }}><MessageCircle className="h-4 w-4" /> Send on WhatsApp</a>
            <Link to="/menu" className="btn-outline-gold text-primary" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>Order more</Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="bg-primary text-primary-foreground py-14">
        <div className="container-x">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Checkout</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Place your order</h1>
        </div>
      </section>

      <section className="container-x py-12 grid lg:grid-cols-[1.2fr_1fr] gap-8">
        {/* Left: order type + form */}
        <div className="space-y-6">
          <div className="card-premium p-6">
            <h3 className="font-display text-xl">Order Type</h3>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(["dine_in","takeaway","delivery"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={"rounded-lg border py-3 text-sm font-medium transition-all " + (orderType === t ? "border-secondary bg-secondary/10 text-primary" : "border-border hover:border-secondary/60")}
                >
                  {t === "dine_in" ? "Dine-In" : t === "takeaway" ? "Takeaway" : "Delivery"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="card-premium p-6 space-y-4">
            <h3 className="font-display text-xl">Your details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" name="name" required />
              <Field label="Mobile number" name="phone" type="tel" required inputMode="tel" />
            </div>
            {orderType === "delivery" && (
              <>
                <Field label="Delivery address" name="address" required textarea />
                <Field label="Landmark" name="landmark" />
              </>
            )}
            <Field label="Order notes (optional)" name="notes" textarea />

            <div className="rounded-lg border border-[#25D366]/40 bg-[#25D366]/5 p-4 text-sm text-foreground">
              <b>Confirm your details</b> — clicking the button below will open WhatsApp on your phone/browser to send and confirm this order directly with us.
            </div>

            <button
              disabled={submitting || items.length === 0}
              className="w-full rounded-full py-3.5 text-base font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] shadow-md cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              {submitting ? "Redirecting to WhatsApp…" : items.length === 0 ? "Cart is empty" : `Confirm & Order on WhatsApp · ₹${subtotal}`}
            </button>
          </form>
        </div>

        {/* Right: cart */}
        <aside className="card-premium p-6 h-fit lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Cart Summary</h3>
            <ShoppingBag className="h-5 w-5 text-secondary" />
          </div>
          {items.length === 0 ? (
            <div className="mt-6 text-center text-muted-foreground py-10">
              <p>No items yet.</p>
              <Link to="/menu" className="btn-gold mt-4 inline-flex">Browse Menu</Link>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-start gap-3 border-b border-border/60 pb-3 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground">₹{it.price}</div>
                      <div className="mt-1.5 inline-flex items-center rounded-full border border-border">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="p-1 hover:text-secondary" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                        <span className="px-2 text-xs font-medium">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="p-1 hover:text-secondary" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">₹{it.price * it.qty}</div>
                      <button onClick={() => remove(it.id)} aria-label="Remove" className="mt-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-base font-semibold font-display"><span>Total</span><span className="text-primary">₹{subtotal}</span></div>
              </div>
            </>
          )}
        </aside>
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
        <textarea name={name} required={required} rows={3} className={cls + " mt-1"} />
      ) : (
        <input name={name} type={type} required={required} inputMode={inputMode} className={cls + " mt-1"} />
      )}
    </label>
  );
}
