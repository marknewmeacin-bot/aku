"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/cart";

export default function ClearCartOnOrderSuccess({
  paymentMethod,
}: {
  paymentMethod?: string;
}) {
  const { emptyCart } = useCartStore();
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (hasClearedRef.current) return;
    if (paymentMethod === "stripe") {
      emptyCart();
      hasClearedRef.current = true;
    }
  }, [emptyCart, paymentMethod]);

  return null;
}
