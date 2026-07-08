import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-background shadow-2xl flex flex-col animate-fade-up">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="font-display text-xl">Your Cart</div>
            <div className="text-xs text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</div>
          </div>
          <button
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border hover:border-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <p>Your cart is empty.</p>
              <Link to="/menu" onClick={() => setOpen(false)} className="btn-gold inline-flex mt-4 text-sm">
                Browse Menu
              </Link>
            </div>
          )}
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
              <div className="flex-1">
                <div className="font-medium text-sm">{it.name}</div>
                <div className="text-xs text-muted-foreground">₹{it.price} each</div>
                <div className="mt-2 inline-flex items-center rounded-full border border-border">
                  <button aria-label="Decrease" onClick={() => setQty(it.id, it.qty - 1)} className="p-1.5 hover:text-secondary">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium">{it.qty}</span>
                  <button aria-label="Increase" onClick={() => setQty(it.id, it.qty + 1)} className="p-1.5 hover:text-secondary">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{it.price * it.qty}</div>
                <button aria-label="Remove" onClick={() => remove(it.id)} className="mt-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl">₹{subtotal}</span>
            </div>
            <Link
              to="/order"
              onClick={() => setOpen(false)}
              className="btn-gold w-full text-center block"
            >
              Checkout · ₹{subtotal}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
