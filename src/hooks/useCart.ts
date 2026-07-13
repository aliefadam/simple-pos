import { useMemo, useState } from "react";
import type { CartItem, Product } from "../types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                qty: product.trackStock ? Math.min(i.qty + 1, product.stock) : i.qty + 1,
              }
            : i
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, qty: 1, image: "" },
      ];
    });
  }

  function updateQty(productId: string, qty: number, maxStock?: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, qty: Math.max(0, maxStock ? Math.min(qty, maxStock) : qty) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }

  function updateNote(productId: string, note: string) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, note } : i)));
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  function loadItems(newItems: CartItem[]) {
    setItems(newItems);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.qty, 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return { items, addItem, updateQty, updateNote, removeItem, clear, loadItems, total, totalQty };
}
