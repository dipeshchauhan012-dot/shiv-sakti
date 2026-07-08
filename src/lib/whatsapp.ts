import { SITE, whatsappBase } from "./site";

export type CartLine = { name: string; price: number; qty: number };

export function whatsappLink(text: string) {
  return `${whatsappBase}?text=${encodeURIComponent(text)}`;
}

export function whatsappOrderMessage(opts: {
  name: string;
  phone: string;
  orderType: "dine_in" | "takeaway" | "delivery";
  items: CartLine[];
  total: number;
  address?: string;
  landmark?: string;
  notes?: string;
  orderNumber?: number | string;
}) {
  const typeLabel = {
    dine_in: "Dine-In",
    takeaway: "Takeaway",
    delivery: "Delivery",
  }[opts.orderType];
  const lines = [
    `New Order - ${SITE.name}`,
    opts.orderNumber ? `Order #: ${opts.orderNumber}` : null,
    `Name: ${opts.name}`,
    `Phone: ${opts.phone}`,
    `Order Type: ${typeLabel}`,
    `Items:`,
    ...opts.items.map(
      (it, i) => `${i + 1}. ${it.name} x${it.qty} - ₹${it.price * it.qty}`,
    ),
    `Total: ₹${opts.total}`,
    opts.orderType === "delivery" && opts.address ? `Address: ${opts.address}` : null,
    opts.landmark ? `Landmark: ${opts.landmark}` : null,
    opts.notes ? `Notes: ${opts.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function whatsappItemMessage(itemName: string, price: number) {
  return `Hi ${SITE.short}, I'd like to order: ${itemName} - ₹${price}. Please confirm availability & delivery details.`;
}

export function whatsappGeneric(msg?: string) {
  return whatsappLink(msg ?? `Hi ${SITE.short}, I'd like to place an order.`);
}
