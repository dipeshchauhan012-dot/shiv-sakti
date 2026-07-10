import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { menuQueryOptions } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { whatsappLink, whatsappItemMessage } from "@/lib/whatsapp";
import { Search, MessageCircle, Leaf } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/menu")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(menuQueryOptions());
  },
  head: () => ({
    meta: [
      { title: `Menu · ${SITE.name} · Pure Veg Restaurant Surat` },
      { name: "description", content: `Explore the full pure-veg menu of ${SITE.name} in Surat — Paneer specials, Punjabi classics, Chinese, tandoor, biryani and more.` },
      { property: "og:title", content: `Menu — ${SITE.name}` },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data } = useSuspenseQuery(menuQueryOptions());
  const [active, setActive] = useState<string>("all");
  const [q, setQ] = useState("");
  const { add, setOpen, items: cartItems, setQty } = useCart();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.items.filter((i) => {
      if (active !== "all" && i.category_id !== active) return false;
      if (term && !i.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [data.items, active, q]);

  const grouped = useMemo(() => {
    const byCat = new Map<string, typeof filtered>();
    for (const it of filtered) {
      if (!byCat.has(it.category_id)) byCat.set(it.category_id, []);
      byCat.get(it.category_id)!.push(it);
    }
    return data.categories
      .filter((c) => byCat.has(c.id))
      .map((c) => ({ cat: c, items: byCat.get(c.id)! }));
  }, [filtered, data.categories]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container-x text-center">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Our Menu</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">Pure Veg <span className="text-gradient-gold">à la Shiv Shakti</span></h1>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">150+ dishes across Punjabi, Chinese, Paneer specials, tandoor, biryani, chaats & more — freshly prepared, generously served.</p>
        </div>
      </section>

      <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="container-x py-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes…"
              className="w-full h-11 pl-9 pr-4 rounded-full border border-border bg-card text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 snap-x">
            <CatChip active={active === "all"} onClick={() => setActive("all")}>All</CatChip>
            {data.categories.map((c) => (
              <CatChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>{c.name}</CatChip>
            ))}
          </div>
        </div>
      </div>

      <section className="container-x py-10 space-y-12">
        {grouped.length === 0 && (
          <div className="text-center text-muted-foreground py-16">No dishes match your search.</div>
        )}
        {grouped.map(({ cat, items }) => (
          <div key={cat.id} className="reveal">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl md:text-3xl">{cat.name}</h2>
              <div className="text-xs text-muted-foreground">{items.length} dishes</div>
            </div>
            <div className="gold-divider mt-3" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {items.map((it) => {
                const cartItem = cartItems.find((i) => i.id === it.id);
                const qty = cartItem ? cartItem.qty : 0;
                return (
                  <div key={it.id} className={"rounded-xl border p-5 transition-all bg-card " + (it.is_available ? "border-border hover:border-secondary hover:shadow-[var(--shadow-elegant)]" : "border-border opacity-50")}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="inline-grid h-4 w-4 place-items-center border border-green-700 rounded-sm shrink-0"><span className="h-2 w-2 rounded-full bg-green-700" /></span>
                          <h3 className="font-display text-lg leading-tight truncate flex-1 min-w-0">{it.name}</h3>
                        </div>
                        {(it.is_special || it.is_popular) && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {it.is_special && <span className="text-[9px] font-semibold bg-secondary/15 text-secondary px-1.5 py-0.5 rounded uppercase tracking-wider">Special</span>}
                            {it.is_popular && <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">Popular</span>}
                          </div>
                        )}
                        {it.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{it.description}</p>}
                        {!it.is_available && <p className="mt-2 text-xs text-destructive uppercase tracking-widest font-semibold">Currently unavailable</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display text-xl text-primary whitespace-nowrap">{it.price > 0 ? `₹${it.price}` : "MRP"}</div>
                      </div>
                    </div>
                    {it.is_available && it.price > 0 && (
                      <div className="mt-4 w-full">
                        {qty > 0 ? (
                          <div className="flex items-center justify-between border border-secondary rounded-full h-10 w-full overflow-hidden bg-card">
                            <button
                              onClick={() => setQty(it.id, qty - 1)}
                              className="px-6 h-full hover:bg-secondary/10 text-primary font-bold transition-colors"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="font-semibold text-primary">{qty}</span>
                            <button
                              onClick={() => setQty(it.id, qty + 1)}
                              className="px-6 h-full hover:bg-secondary/10 text-primary font-bold transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { add({ id: it.id, name: it.name, price: it.price }); toast.success(`${it.name} added`); }}
                            className="btn-gold text-sm w-full"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="container-x pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Leaf className="h-4 w-4 text-green-700" /> Every dish on our menu is 100% pure vegetarian.
        </div>
        <div className="mt-6">
          <Link to="/order" className="btn-gold">Go to Checkout</Link>
        </div>
      </section>
    </>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={"snap-start whitespace-nowrap rounded-full border px-4 h-9 text-sm transition-colors " + (active ? "border-secondary bg-secondary text-secondary-foreground font-semibold" : "border-border text-foreground/80 hover:border-secondary hover:text-primary")}
    >
      {children}
    </button>
  );
}
