import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone, Clock } from "lucide-react";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="container-x py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">{SITE.short}</div>
          <div className="text-xs uppercase tracking-[0.2em] text-secondary mt-1">
            Restaurant & Banquet
          </div>
          <p className="mt-4 text-sm text-primary-foreground/70 max-w-xs">{SITE.tagline}. Serving families in Surat with pure vegetarian excellence.</p>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-secondary hover:text-secondary/80"
          >
            <Instagram className="h-4 w-4" /> @{SITE.instagram}
          </a>
        </div>

        <div>
          <h4 className="font-display text-lg text-secondary">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/menu" className="hover:text-secondary">Menu</Link></li>
            <li><Link to="/about" className="hover:text-secondary">About</Link></li>
            <li><Link to="/gallery" className="hover:text-secondary">Gallery</Link></li>
            <li><Link to="/banquet" className="hover:text-secondary">Banquet Booking</Link></li>
            <li><Link to="/reserve" className="hover:text-secondary">Reserve Table</Link></li>
            <li><Link to="/order" className="hover:text-secondary">Order Online</Link></li>
            <li><Link to="/contact" className="hover:text-secondary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-secondary">Visit</h4>
          <div className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <div className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" /><span>{SITE.address}</span></div>
            <div className="flex flex-col gap-1">
              {SITE.phones.map((p) => (
                <a key={p} href={`tel:+91${p}`} className="flex items-center gap-2 hover:text-secondary">
                  <Phone className="h-4 w-4 text-secondary" /> +91 {p}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-secondary">Hours</h4>
          <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Lunch: {SITE.hours.lunch}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-secondary" /> Dinner: {SITE.hours.dinner}</div>
            <div className="mt-3 text-xs text-primary-foreground/60">Open all 7 days</div>
          </div>
        </div>
      </div>
      <div className="gold-divider" />
      <div className="container-x py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved. · Pure Vegetarian · {SITE.city}, {SITE.region}
      </div>
    </footer>
  );
}
