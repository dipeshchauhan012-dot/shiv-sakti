import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { menuQueryOptions } from "@/lib/menu";
import { SITE, primaryPhoneTel } from "@/lib/site";
import { whatsappGeneric, whatsappItemMessage, whatsappLink } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { MapPin, Phone, Clock, MessageCircle, Star, Utensils, PartyPopper, Users, Award, ChefHat } from "lucide-react";
import { CountUp } from "@/components/site/CountUp";
import hero from "@/assets/hero-thali.jpg";
import banquet from "@/assets/banquet-hall.jpg";
import interior from "@/assets/restaurant-interior.jpg";
import dishTikka from "@/assets/dish-paneer-tikka.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishPaneerButter from "@/assets/dish-paneer-butter.jpg";
import dishManchurian from "@/assets/dish-manchurian.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(menuQueryOptions());
  },
  head: () => ({
    meta: [
      { title: `${SITE.name} · Pure Veg Family Restaurant & Banquet in Surat` },
      { name: "description", content: `Pure Veg family restaurant & banquet hall in ${SITE.city}. Order online, book a table or reserve our banquet hall for weddings, birthdays & corporate events.` },
      { property: "og:title", content: SITE.name },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const DISH_IMAGE_MAP: Record<string, string> = {
  "Paneer Tikka Dry": dishTikka,
  "Paneer Butter Masala": dishPaneerButter,
  "Special Dum Biryani": dishBiryani,
  "Veg Manchurian Dry/Gravy": dishManchurian,
};

function Home() {
  const { data } = useSuspenseQuery(menuQueryOptions());
  const featured = data.items.filter((i) => i.is_featured).slice(0, 6);
  const popular = data.items.filter((i) => i.is_popular).slice(0, 8);
  const specials = data.items.filter((i) => i.is_special).slice(0, 6);
  const chinese = data.items.filter((i) => data.categories.find((c) => c.id === i.category_id)?.slug === "chinese").slice(0, 4);
  const punjabi = data.items.filter((i) => data.categories.find((c) => c.id === i.category_id)?.slug === "punjabi-dishes").slice(0, 4);
  const paneer = data.items.filter((i) => data.categories.find((c) => c.id === i.category_id)?.slug === "paneer-special").slice(0, 4);

  return (
    <>
      <Toaster position="top-center" richColors />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero} alt="Signature pure veg thali" width={1600} height={1200} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--espresso)]/95 via-[color:var(--espresso)]/80 to-[color:var(--espresso)]/40" />
        </div>

        {/* Floating shapes */}
        <div className="floating-shape floating-shape-1"></div>
        <div className="floating-shape floating-shape-2"></div>
        <div className="floating-shape floating-shape-3"></div>
        <div className="floating-shape floating-shape-4"></div>

        <div className="container-x relative py-20 md:py-32 text-primary-foreground">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              Pure Veg · Since Generations · {SITE.city}
            </div>
            <h1 className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
              {SITE.name.split("&")[0].trim()} <span className="text-gradient-gold">&amp; Banquet</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-primary-foreground/85">{SITE.tagline}. Family dining, party orders, home delivery & banquet bookings — crafted with love in Surat.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/order" className="btn-gold">Order Online</Link>
              <Link to="/reserve" className="btn-outline-gold">Reserve Table</Link>
              <a href={whatsappGeneric()} target="_blank" rel="noopener noreferrer" className="btn-outline-gold inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> WhatsApp Order
              </a>
              <a href={primaryPhoneTel} className="btn-outline-gold inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> Call Now
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-primary-foreground/80">
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Lunch {SITE.hours.lunch}</span>
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Dinner {SITE.hours.dinner}</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue hidden md:block" aria-hidden="true">
          <div className="scroll-cue-mouse">
            <div className="scroll-cue-dot"></div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container-x py-16 md:py-24">
        <div className="reveal">
          <SectionHeader eyebrow="Why families choose us" title="A pure-veg experience, done properly" />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            { icon: Utensils, title: "100% Pure Veg", body: "Every dish, every sauce — strictly vegetarian, prepared in a dedicated pure-veg kitchen." },
            { icon: Users, title: "Family-First Dining", body: "Warm, welcoming seating for families of every size, including little ones." },
            { icon: PartyPopper, title: "Banquet & Parties", body: "Birthdays, engagements, corporate lunches — we host it, plan it, and serve it." },
            { icon: Award, title: "Loved in Surat", body: "Trusted for quality, consistency and generous portions across dine-in & delivery." },
          ].map((f, idx) => (
            <div key={f.title} className="card-premium card-premium-hover p-6 reveal" data-delay={idx * 100}>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[color:var(--gold-soft)]">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED DISHES */}
      {featured.length > 0 && (
        <FeaturedGrid title="Signature Dishes" eyebrow="Chef's Featured" items={featured} imageMap={DISH_IMAGE_MAP} />
      )}

      {/* SPECIALS */}
      {specials.length > 0 && (
        <ItemStrip title="House Specials" eyebrow="Only at Shiv Shakti" items={specials} tone="dark" />
      )}

      {/* POPULAR */}
      {popular.length > 0 && (
        <ItemStrip title="Most Loved" eyebrow="Popular with regulars" items={popular} />
      )}

      {/* CATEGORY TRIPLE */}
      <section className="container-x py-16 md:py-24 grid gap-8 lg:grid-cols-3">
        <div className="reveal" data-delay={0}>
          <CategoryCard title="Paneer Specials" tag="Signature Paneer" items={paneer} slug="paneer-special" />
        </div>
        <div className="reveal" data-delay={100}>
          <CategoryCard title="Punjabi Classics" tag="Dhaba Style" items={punjabi} slug="punjabi-dishes" />
        </div>
        <div className="reveal" data-delay={200}>
          <CategoryCard title="Indo-Chinese" tag="Wok Fresh" items={chinese} slug="chinese" />
        </div>
      </section>

      {/* BANQUET */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="container-x py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-left">
            <div className="text-secondary uppercase tracking-[0.2em] text-xs">Banquet Services</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Host your <span className="text-gradient-gold">next celebration</span> with us</h2>
            <p className="mt-5 text-primary-foreground/80 max-w-lg">Weddings, engagements, birthdays, corporate lunches and family functions — our banquet hall and party team handle every detail, from décor to service.</p>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-primary-foreground/85">
              <li className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Custom menu planning</li>
              <li className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Elegant décor options</li>
              <li className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Dedicated service team</li>
              <li className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-secondary" /> Corporate & family events</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/banquet" className="btn-gold">Enquire Now</Link>
              <a href={whatsappLink("Hi Shiv Shakti, I'd like to enquire about banquet booking.")} target="_blank" rel="noopener noreferrer" className="btn-outline-gold inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Chat on WhatsApp</a>
            </div>
          </div>
          <div className="relative reveal-right">
            <img src={banquet} alt="Elegant banquet hall set for a celebration" width={1600} height={1000} loading="lazy" className="rounded-2xl shadow-2xl border border-secondary/30" />
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="container-x py-20 grid lg:grid-cols-2 gap-16 items-center overflow-visible">
        {/* Overlapping Images block */}
        <div className="about-images reveal-left">
          <div className="about-ornament"></div>
          <img
            src={interior}
            alt="Warm family dining ambiance"
            className="about-img-main aspect-[4/5]"
            loading="lazy"
          />
          <img
            src={dishPaneerButter}
            alt="Paneer Butter Masala"
            className="about-img-small aspect-[3/4]"
            loading="lazy"
          />
        </div>
        <div className="reveal-right">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Our Story</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Rooted in Surat, <span className="text-gradient-gold">served with soul</span></h2>
          <p className="mt-5 text-muted-foreground">{SITE.name} began with a simple promise — treat every guest like family, and cook every dish like it's going to your own table. Today we serve thousands of Surat's families across dine-in, takeaway, delivery and our banquet hall.</p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <StatBlock v={<CountUp end={150} suffix="+" />} l="Dishes" />
            <StatBlock v={<CountUp end={10} suffix="k+" />} l="Happy families" />
            <StatBlock v={<CountUp end={100} suffix="% Pure" />} l="Veg promise" />
          </div>
          <Link to="/about" className="btn-gold mt-8 inline-flex">Read our story</Link>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="container-x py-16 overflow-hidden">
        <div className="reveal">
          <SectionHeader eyebrow="What guests say" title="Voices from our tables" />
        </div>
        <div className="mt-10 reviews-marquee-container">
          <div className="reviews-marquee-track">
            {[
              { name: "Priya S.", text: "The Paneer Shiv Shakti Tadka is unbelievable. We now come here every weekend as a family." },
              { name: "Rahul M.", text: "Booked our daughter's birthday at the banquet. Service was outstanding, food was praised by every guest." },
              { name: "Anjali K.", text: "Best pure-veg in the area. Fast delivery, generous portions, everything piping hot." },
              { name: "Rajesh P.", text: "The Paneer Butter Masala is absolutely divine! My family visits every weekend and the staff treats us like royalty." },
              { name: "Sneha M.", text: "Best Chinese food in the area! The Veg Manchurian and Hakka Noodles taste just like authentic street-style Chinese." },
              { name: "Amit K.", text: "Hosted my engagement party at the banquet hall — the setup was beautiful and the food was out of this world." },
            ].concat([
              { name: "Priya S.", text: "The Paneer Shiv Shakti Tadka is unbelievable. We now come here every weekend as a family." },
              { name: "Rahul M.", text: "Booked our daughter's birthday at the banquet. Service was outstanding, food was praised by every guest." },
              { name: "Anjali K.", text: "Best pure-veg in the area. Fast delivery, generous portions, everything piping hot." },
              { name: "Rajesh P.", text: "The Paneer Butter Masala is absolutely divine! My family visits every weekend and the staff treats us like royalty." },
              { name: "Sneha M.", text: "Best Chinese food in the area! The Veg Manchurian and Hakka Noodles taste just like authentic street-style Chinese." },
              { name: "Amit K.", text: "Hosted my engagement party at the banquet hall — the setup was beautiful and the food was out of this world." },
            ]).map((r, idx) => (
              <div key={idx} className="card-premium p-6 w-[320px] md:w-[350px] shrink-0">
                <div className="flex gap-1 text-secondary">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}</div>
                <p className="mt-4 text-sm text-foreground/85">"{r.text}"</p>
                <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">— {r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP + CONTACT */}
      <section className="container-x py-16 grid lg:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-elegant)] reveal-left">
          <iframe title="Location map" src={SITE.mapsEmbed} className="w-full h-[380px]" loading="lazy" />
        </div>
        <div className="card-premium p-8 reveal-right">
          <ChefHat className="h-8 w-8 text-secondary" />
          <h3 className="mt-3 font-display text-3xl">Visit us today</h3>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" /><span>{SITE.address}</span></div>
            <div className="flex flex-col gap-1">
              {SITE.phones.map((p) => (
                <a key={p} href={`tel:+91${p}`} className="flex items-center gap-2 hover:text-secondary"><Phone className="h-4 w-4 text-secondary" /> +91 {p}</a>
              ))}
            </div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Lunch {SITE.hours.lunch}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Dinner {SITE.hours.dinner}</div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">Get Directions</a>
            <Link to="/reserve" className="btn-outline-gold text-primary" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>Reserve Table</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-secondary uppercase tracking-[0.2em] text-xs">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl md:text-5xl">{title}</h2>
      <div className="mx-auto mt-4 h-px w-24 bg-secondary" />
    </div>
  );
}

function StatBlock({ v, l }: { v: React.ReactNode; l: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="font-display text-2xl text-primary">{v}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
    </div>
  );
}

function FeaturedGrid({ eyebrow, title, items, imageMap }: { eyebrow: string; title: string; items: { id: string; name: string; price: number; description: string | null }[]; imageMap: Record<string, string> }) {
  const { add, setOpen, items: cartItems, setQty } = useCart();
  return (
    <section className="container-x py-16 md:py-24">
      <div className="reveal">
        <SectionHeader eyebrow={eyebrow} title={title} />
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => {
          const img = imageMap[it.name];
          const cartItem = cartItems.find((i) => i.id === it.id);
          const qty = cartItem ? cartItem.qty : 0;
          return (
            <div key={it.id} className="card-premium card-premium-hover overflow-hidden group reveal" data-delay={idx * 100}>
              {img ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={img} alt={it.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-[color:var(--gold-soft)] to-[color:var(--gold)] grid place-items-center">
                  <ChefHat className="h-12 w-12 text-primary/70" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl">{it.name}</h3>
                  <span className="font-semibold text-primary whitespace-nowrap">₹{it.price}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">Signature preparation, made fresh to order in our pure-veg kitchen.</p>
                <div className="mt-4 flex gap-2">
                  {qty > 0 ? (
                    <div className="flex items-center justify-between border border-secondary rounded-full h-11 flex-1 overflow-hidden bg-card">
                      <button
                        onClick={() => setQty(it.id, qty - 1)}
                        className="px-4 h-full hover:bg-secondary/10 text-primary font-bold transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="font-semibold text-primary">{qty}</span>
                      <button
                        onClick={() => setQty(it.id, qty + 1)}
                        className="px-4 h-full hover:bg-secondary/10 text-primary font-bold transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { add({ id: it.id, name: it.name, price: it.price }); toast.success(`${it.name} added to cart`); }}
                      className="btn-gold text-sm flex-1"
                    >
                      Add to Cart
                    </button>
                  )}
                  <a href={whatsappLink(whatsappItemMessage(it.name, it.price))} target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp" className="grid h-11 w-11 place-items-center rounded-full border border-border hover:border-secondary text-[color:var(--whatsapp)] shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link to="/menu" className="btn-outline-gold text-primary inline-flex" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>View full menu</Link>
      </div>
    </section>
  );
}

function ItemStrip({ eyebrow, title, items, tone }: { eyebrow: string; title: string; items: { id: string; name: string; price: number }[]; tone?: "dark" }) {
  const { add, setOpen } = useCart();
  const dark = tone === "dark";
  return (
    <section className={dark ? "bg-primary text-primary-foreground py-20" : "py-16"}>
      <div className="container-x">
        <div className="flex items-end justify-between gap-6 flex-wrap reveal">
          <div>
            <div className={"uppercase tracking-[0.2em] text-xs " + (dark ? "text-secondary" : "text-secondary")}>{eyebrow}</div>
            <h2 className={"mt-2 font-display text-3xl md:text-4xl " + (dark ? "text-primary-foreground" : "")}>{title}</h2>
          </div>
          <Link to="/menu" className={dark ? "btn-outline-gold" : "btn-outline-gold text-primary"} style={dark ? undefined : { color: "var(--primary)", borderColor: "var(--primary)" }}>See all →</Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, idx) => (
            <div key={it.id} className={"group rounded-xl p-5 border transition-all reveal " + (dark ? "border-secondary/25 bg-white/[0.04] hover:bg-white/[0.08]" : "border-border bg-card hover:border-secondary card-premium-hover")} data-delay={idx * 80}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display text-lg leading-tight">{it.name}</h4>
                <span className={"font-semibold text-sm whitespace-nowrap " + (dark ? "text-secondary" : "text-primary")}>₹{it.price}</span>
              </div>
              <button
                onClick={() => { add({ id: it.id, name: it.name, price: it.price }); toast.success(`${it.name} added`); setOpen(true); }}
                className={"mt-4 text-xs font-medium " + (dark ? "text-secondary hover:text-secondary/80" : "text-primary hover:text-secondary")}
              >
                + Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ title, tag, items, slug }: { title: string; tag: string; items: { id: string; name: string; price: number }[]; slug: string }) {
  return (
    <div className="card-premium p-6 flex flex-col">
      <div className="text-secondary uppercase tracking-[0.2em] text-[11px]">{tag}</div>
      <h3 className="mt-1 font-display text-2xl">{title}</h3>
      <div className="mt-5 space-y-3 flex-1">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm border-b border-dashed border-border/60 pb-2 last:border-0">
            <span>{it.name}</span>
            <span className="font-semibold text-primary">₹{it.price}</span>
          </div>
        ))}
      </div>
      <Link to="/menu" search={{ cat: slug } as never} className="mt-6 text-sm font-semibold text-primary hover:text-secondary">Explore {title} →</Link>
    </div>
  );
}
