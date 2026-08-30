"use client";

import { useEffect, useState } from "react";

import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useAtom, useStore } from "jotai";

import { Button } from "@/components/ui/button";
import { cartMenuState } from "./store";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { saveCartForUser } from "@/lib/database/actions/cart.actions";
import { FaArrowCircleRight } from "react-icons/fa";
import { handleError, getErrorMessage } from "@/lib/utils";
import CartSheetItems from "../cart/CartSheetItems";
import { toast } from "sonner";

const CartDrawer = () => {
  type CartItem = {
    _uid: string;
    _id: string;
    style: number;
    size: string;
    price: number | string;
    qty: number;
    color: { color: string; image: string };
    vendor?: { _id?: string; [key: string]: unknown };
  };
  const router = useRouter();
  const { userId } = useAuth();
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  const [cartMenuOpen, setCartMenuOpen] = useAtom(cartMenuState, {
    store: useStore(),
  });
  const handleOnClickCartMenu = () => {
    setCartMenuOpen(true);
    console.log("cart", cartMenuOpen);
  };
  const cart = useCartStore(
    (state: { cart: { cartItems: CartItem[] } }) => state.cart.cartItems
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || cart.length === 0) return;

    const save = async () => {
      try {
        await saveCartForUser(cart, userId);
      } catch (error) {
        handleError(error);
      }
    };

    const timeout = window.setTimeout(save, 300);
    return () => window.clearTimeout(timeout);
  }, [cart, userId]);
  const total = cart.reduce(
    (sum: number, item: CartItem) =>
      sum + parseFloat(String(item.price)) * item.qty,
    0
  );
  const saveCartToDbHandler = async () => {
    if (userId && userId !== null) {
      setLoading(true);

      try {
        const res = await saveCartForUser(cart, userId);
        if (res?.success) {
          setLoading(false);
          setCartMenuOpen(false);
          router.push("/checkout");
        } else {
          setLoading(false);
          toast.error(res?.message || "Failed to save cart");
        }
      } catch (err) {
        setLoading(false);
        toast.error(getErrorMessage(err) || "Error saving cart");
        console.error(err);
      }
    } else {
      router.push(`/sign-in?redirect_url=${encodeURIComponent("/checkout")}`);
    }
  };

  const handleShopAllClick = () => {
    setCartMenuOpen(false);
    router.push("/shop");
  };

  return (
    <div className="relative">
      <Sheet open={cartMenuOpen}>
        <SheetTrigger asChild>
          <Button
            onClick={() => handleOnClickCartMenu()}
            variant={"ghost"}
            size={"icon"}
            className="relative"
          >
            <ShoppingBag size={24} />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-black rounded-full">
              {cart.length}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90%] max-w-[450px] sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle className="subHeading">CART</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex justify-center h-[80vh] items-center">
                <div className="">
                  <h1 className="text-2xl mb-[10px] text-center flex items-center justify-center  font-bold ">
                    {" "}
                    Your Cart is empty
                  </h1>
                  <Button
                    onClick={handleShopAllClick}
                    className="flex justify-center items-center w-full gap-[10px]"
                  >
                    Shop All
                    <FaArrowCircleRight />
                  </Button>
                </div>
              </div>
            ) : (
              cart.map((product: CartItem) => (
                <CartSheetItems product={product} key={product._uid} />
              ))
            )}
          </div>
          <div className="absolute bottom-2 w-[90%] mt-6  bg-white">
            <p className="text-sm text-gray-500">
              Tax included. Shipping calculated at checkout.
            </p>
            <Button
              onClick={() => saveCartToDbHandler()}
              disabled={cart.length === 0}
              className="w-full mt-4 bg-black text-white hover:bg-gray-800 gap-[10px]"
            >
              {loading
                ? "Loading..."
                : `Continue to Secure Checkout - ₹${total}`}
              <FaArrowCircleRight />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CartDrawer;
