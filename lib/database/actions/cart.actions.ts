"use server";

import { handleError } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";

import { connectToDatabase } from "../connect";
import Cart from "../models/cart.model";
import Product from "../models/product.model";
import User from "../models/user.model";

interface CartItem {
  _id: string;
  style: number;
  size: string;
  qty: number;
  color: {
    color: string;
    image: string;
  };
  vendor?: {
    _id?: string;
    [key: string]: unknown;
  };
}

interface SavedCartProduct {
  name: string;
  product: unknown;
  color: {
    color: string;
    image: string;
  };
  image: string;
  qty: number;
  size: string;
  vendor: Record<string, unknown>;
  vendorId: string;
  price: number;
}

async function findOrCreateUser(clerkId: string) {
  const existingUser = await User.findOne({ clerkId });
  if (existingUser) return existingUser;

  const clerkUser = await currentUser();
  if (!clerkUser || clerkUser.id !== clerkId) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return User.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      email,
      image: clerkUser.imageUrl || "",
      username: clerkUser.username || clerkUser.firstName || "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function saveCartForUser(
  cart: CartItem[],
  clerkId: string
) {
  try {
    await connectToDatabase();

    const user = await findOrCreateUser(clerkId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const products: SavedCartProduct[] = [];

    for (const cartItem of cart) {
      const dbProduct = await Product.findById(cartItem._id).lean();

      if (!dbProduct) {
        continue;
      }

      const subProduct = dbProduct.subProducts[cartItem.style];

      if (!subProduct) {
        continue;
      }

      const selectedSize = subProduct.sizes.find(
        (item: { size: string; price: number }) =>
          item.size === cartItem.size
      );

      if (!selectedSize) {
        continue;
      }

      const originalPrice = Number(selectedSize.price);
      const discount = Number(subProduct.discount) || 0;

      const finalPrice =
        discount > 0
          ? originalPrice - (originalPrice * discount) / 100
          : originalPrice;

      const product: SavedCartProduct = {
        name: dbProduct.name,
        product: dbProduct._id,
        color: {
          color: cartItem.color.color,
          image: cartItem.color.image,
        },
        image: subProduct.images[0]?.url ?? "",
        qty: Number(cartItem.qty),
        size: cartItem.size,
        vendor: cartItem.vendor ?? {},
        vendorId: cartItem.vendor?._id ?? "",
        price: Number(finalPrice.toFixed(2)),
      };

      products.push(product);
    }

    const cartTotal = products.reduce(
      (total, product) => total + product.price * product.qty,
      0
    );

    if (products.length === 0) {
      await Cart.deleteOne({ user: user._id });
    } else {
      await Cart.findOneAndUpdate(
        { user: user._id },
        {
          products,
          cartTotal: Number(cartTotal.toFixed(2)),
          user: user._id,
        },
        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }
      );
    }

    return {
      success: true,
      message: "Cart saved successfully.",
    };
  } catch (error) {
    handleError(error);
  }
}

export async function getSavedCartForUser(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await findOrCreateUser(clerkId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        user: null,
        cart: null,
        address: {},
      };
    }

    const cart = await Cart.findOne({
      user: user._id,
    }).lean();

    return {
      success: true,
      user: JSON.parse(JSON.stringify(user)),
      cart: JSON.parse(JSON.stringify(cart)),
      address: JSON.parse(JSON.stringify(user.address ?? {})),
    };
  } catch (error) {
    handleError(error);
  }
}

interface UpdateCartItem extends CartItem {
  priceBefore?: number;
  price?: number;
  discount?: number;
  quantity?: number;
  shippingFee?: number;
}

export async function updateCartForUser(products: CartItem[]) {
  try {
    await connectToDatabase();

    const updatedProducts = await Promise.all(
      products.map(async (product): Promise<UpdateCartItem> => {
        const dbProduct = await Product.findById(product._id).lean();

        if (!dbProduct) {
          return product;
        }

        const subProduct = dbProduct.subProducts[product.style];

        if (!subProduct) {
          return product;
        }

        const selectedSize = subProduct.sizes.find(
          (item: { size: string; price: number; qty: number }) =>
            item.size === product.size
        );

        if (!selectedSize) {
          return product;
        }

        const originalPrice = Number(selectedSize.price);
        const quantity = Number(selectedSize.qty);
        const discount = Number(subProduct.discount) || 0;

        const finalPrice =
          discount > 0
            ? originalPrice - (originalPrice * discount) / 100
            : originalPrice;

        return {
          ...product,
          priceBefore: originalPrice,
          price: Number(finalPrice.toFixed(2)),
          discount,
          quantity,
          shippingFee: Number(dbProduct.shipping) || 0,
        };
      })
    );

    return {
      success: true,
      message: "Successfully updated the cart.",
      data: JSON.parse(JSON.stringify(updatedProducts)),
    };
  } catch (error) {
    handleError(error);
  }
}