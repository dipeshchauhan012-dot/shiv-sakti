import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";

const SITE_TITLE = `${SITE.name} · Pure Veg Family Restaurant & Banquet in Surat`;
const SITE_DESC = `${SITE.name} — Pure Veg family restaurant & banquet hall in Surat. Dine-in, takeaway, home delivery, table reservations & banquet booking. Punjabi, Chinese, Paneer specials. Open ${SITE.hours.lunch} & ${SITE.hours.dinner}.`;

function NotFoundComponent() {
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-20">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-primary">404</h1>
        <h2 className="mt-3 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist. Head back home to explore our menu.
        </p>
        <Link to="/" className="btn-gold mt-6 inline-flex">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-20 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl text-primary">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or return home.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-gold">Try again</button>
          <Link to="/" className="btn-outline-gold" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>Home</Link>
        </div>
      </div>
    </div>
  );
}

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: SITE.name,
  description: SITE.tagline,
  image: "/og-image.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Shop No. 8 & 9, Green Residency Commercial Shopping Center, Opp. Madhav Chrest",
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    addressCountry: SITE.country,
  },
  telephone: SITE.phones.map((p) => `+91${p}`),
  servesCuisine: SITE.cuisine,
  priceRange: SITE.priceRange,
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "11:00", closes: "15:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "18:30", closes: "22:45" },
  ],
  hasMenu: "/menu",
  acceptsReservations: "https://schema.org/True",
  sameAs: [SITE.instagramUrl],
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#2a1a10" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: SITE.name },
      { name: "keywords", content: "Shiv Shakti Restaurant, pure veg restaurant Surat, family restaurant Surat, banquet hall Surat, Punjabi food Surat, Paneer, home delivery Surat, table reservation, Dindoli restaurant" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { title: "Shiv Shakti Restaurant & Banquet" },
      { property: "og:title", content: "Shiv Shakti Restaurant & Banquet" },
      { name: "twitter:title", content: "Shiv Shakti Restaurant & Banquet" },
      { name: "description", content: "Pure Veg Family Restaurant & Banquet Hall in Surat. Dine-In, Takeaway, Home Delivery, Table Reservation, Banquet Booking, Party Orders & WhatsApp Ordering." },
      { property: "og:description", content: "Pure Veg Family Restaurant & Banquet Hall in Surat. Dine-In, Takeaway, Home Delivery, Table Reservation, Banquet Booking, Party Orders & WhatsApp Ordering." },
      { name: "twitter:description", content: "Pure Veg Family Restaurant & Banquet Hall in Surat. Dine-In, Takeaway, Home Delivery, Table Reservation, Banquet Booking, Party Orders & WhatsApp Ordering." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/093f7701-08d5-4965-974f-3b6ebe48a686/id-preview-4a679ca9--fb65ebe5-c0f9-438e-9beb-6f5677d17dad.lovable.app-1783284938496.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/093f7701-08d5-4965-974f-3b6ebe48a686/id-preview-4a679ca9--fb65ebe5-c0f9-438e-9beb-6f5677d17dad.lovable.app-1783284938496.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORG_JSONLD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteLayout>
        <Outlet />
      </SiteLayout>
    </QueryClientProvider>
  );
}
