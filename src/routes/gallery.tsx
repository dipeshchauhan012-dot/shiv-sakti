import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site";
import hero from "@/assets/hero-thali.jpg";
import banquet from "@/assets/banquet-hall.jpg";
import interior from "@/assets/restaurant-interior.jpg";
import dishTikka from "@/assets/dish-paneer-tikka.jpg";
import dishBiryani from "@/assets/dish-biryani.jpg";
import dishPaneerButter from "@/assets/dish-paneer-butter.jpg";
import dishManchurian from "@/assets/dish-manchurian.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery · ${SITE.name} · Restaurant & Banquet Photos` },
      { name: "description", content: `Photos of dishes, dining ambiance and banquet setups at ${SITE.name}, Surat.` },
      { property: "og:title", content: `Gallery — ${SITE.name}` },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const shots: { src: string; alt: string; span?: string }[] = [
  { src: hero, alt: "Signature pure veg thali", span: "md:col-span-2 md:row-span-2" },
  { src: dishPaneerButter, alt: "Paneer butter masala" },
  { src: interior, alt: "Family dining ambiance" },
  { src: dishTikka, alt: "Sizzling paneer tikka" },
  { src: banquet, alt: "Banquet hall setup", span: "md:col-span-2" },
  { src: dishBiryani, alt: "Special dum biryani" },
  { src: dishManchurian, alt: "Veg manchurian" },
];

function Gallery() {
  return (
    <>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-x text-center">
          <div className="text-secondary uppercase tracking-[0.2em] text-xs">Gallery</div>
          <h1 className="mt-3 font-display text-4xl md:text-6xl">A taste, in <span className="text-gradient-gold">pictures</span></h1>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
          {shots.map((s, i) => (
            <div key={i} className={"overflow-hidden rounded-xl border border-border group reveal " + (s.span ?? "")} data-delay={i * 80}>
              <img src={s.src} alt={s.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">More photos coming soon — follow us on Instagram <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:text-secondary">@{SITE.instagram}</a></p>
      </section>
    </>
  );
}
