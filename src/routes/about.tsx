import { createFileRoute, Link } from "@tanstack/react-router";
import { Utensils, Heart, PartyPopper, Leaf, ChefHat, Shield } from "lucide-react";
import { SITE } from "@/lib/site";
import interior from "@/assets/restaurant-interior.jpg";
import banquet from "@/assets/banquet-hall.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About · ${SITE.name} · Pure Veg Family Restaurant Surat` },
      { name: "description", content: `The story behind ${SITE.name} — a family-first, pure-veg restaurant and banquet hall in ${SITE.city}.` },
      { property: "og:title", content: `About ${SITE.name}` },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-x max-w-3xl">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">About Us</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">A pure-veg promise. <span className="text-gradient-gold">A family welcome.</span></h1>
          <p className="mt-5 text-primary-foreground/80 text-lg">{SITE.name} is more than a restaurant — it's where Surat's families come for celebrations, weekly dinners, and the comfort of consistently great vegetarian food.</p>
        </div>
      </section>

      <section className="container-x py-16 grid lg:grid-cols-2 gap-10 items-center">
        <img src={interior} alt="Warm dining interior" loading="lazy" width={1600} height={1000} className="rounded-2xl border border-border shadow-[var(--shadow-elegant)] reveal-left" />
        <div className="reveal-right">
          <h2 className="font-display text-3xl md:text-4xl">Our Story</h2>
          <p className="mt-4 text-muted-foreground">Founded with a simple belief — that vegetarian food deserves the finest treatment — {SITE.name} has grown into one of Surat's most trusted family restaurants. Every recipe on our menu has been perfected over the years, and every guest is served with the same care as we'd serve our own family.</p>
          <p className="mt-3 text-muted-foreground">From Punjabi comfort classics to Indo-Chinese favourites, from our signature Paneer Shiv Shakti Tadka to festival-worthy dum biryanis — everything on our menu is 100% pure vegetarian, prepared in a strictly veg kitchen.</p>
        </div>
      </section>

      <section className="container-x pb-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: Leaf, title: "100% Pure Veg", body: "A dedicated vegetarian kitchen — no exceptions, ever." },
          { icon: Heart, title: "Family-First", body: "Warm, welcoming, generous portions — dining that feels like home." },
          { icon: PartyPopper, title: "Banquet Ready", body: "Weddings, engagements, birthdays, corporate lunches — we host it all." },
          { icon: ChefHat, title: "Chef-Led Menu", body: "Signature preparations you won't find anywhere else in Surat." },
          { icon: Utensils, title: "150+ Dishes", body: "Punjabi, Chinese, Paneer, Tandoor, Rice, Chaats, Desserts." },
          { icon: Shield, title: "Consistent Quality", body: "Same recipe, same taste, every visit — that's the Shiv Shakti guarantee." },
        ].map((v, idx) => (
          <div key={v.title} className="card-premium card-premium-hover p-6 reveal" data-delay={idx * 80}>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[color:var(--gold-soft)]">
              <v.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-xl">{v.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
          </div>
        ))}
      </section>

      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-x grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal-left">
            <div className="text-secondary uppercase tracking-[0.2em] text-xs">Banquet Services</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Where celebrations become memories</h2>
            <p className="mt-4 text-primary-foreground/80">Our banquet hall hosts weddings, receptions, engagements, birthdays, corporate lunches, kitty parties and family get-togethers. Our team handles menu planning, décor coordination and service — so you can simply enjoy your day.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/banquet" className="btn-gold">Enquire Banquet</Link>
              <Link to="/contact" className="btn-outline-gold">Contact Us</Link>
            </div>
          </div>
          <img src={banquet} alt="Banquet hall setup" loading="lazy" width={1600} height={1000} className="rounded-2xl border border-secondary/30 shadow-2xl reveal-right" />
        </div>
      </section>
    </>
  );
}
