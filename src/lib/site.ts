export const SITE = {
  name: "Shiv Shakti Restaurant & Banquet",
  short: "Shiv Shakti",
  tagline: "Pure Veg Family Restaurant & Banquet Hall",
  address:
    "Shop No. 8 & 9, Green Residency Commercial Shopping Center, Opp. Madhav Chrest, Surat, Gujarat",
  phones: ["9898653141", "7999620244", "7284948729"],
  whatsapp: "917999620244", // international format for wa.me links
  whatsappDisplay: "+91 79996 20244",
  instagram: "shivshakti_dindoli",
  instagramUrl: "https://instagram.com/shivshakti_dindoli",
  mapsUrl: "https://maps.app.goo.gl/R7jkphawn4zpKCJ88",
  mapsEmbed:
    "https://maps.google.com/maps?q=Shiv+Shakti+Restaurant+Green+Residency+Surat&t=&z=15&ie=UTF8&iwloc=&output=embed",
  hours: {
    lunch: "11:00 AM – 3:30 PM",
    dinner: "6:30 PM – 10:45 PM",
  },
  city: "Surat",
  region: "Gujarat",
  country: "IN",
  priceRange: "₹₹",
  cuisine: ["Indian", "North Indian", "Punjabi", "Chinese", "Gujarati", "Pure Vegetarian"],
} as const;

export const primaryPhoneTel = `tel:+91${SITE.phones[0]}`;
export const whatsappBase = `https://wa.me/${SITE.whatsapp}`;
