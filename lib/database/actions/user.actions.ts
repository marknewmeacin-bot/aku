"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "../connect";
import Cart from "../models/cart.model";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";
import User from "../models/user.model";
import { handleError } from "@/lib/utils";

type UserData = Record<string, unknown>;

type UserResponse = {
  success: boolean;
  message: string;
  user?: any;
};

type AddressResponse = {
  success: boolean;
  message?: string;
  address?: any;
  addresses?: any[];
};

type CouponResponse = {
  success: boolean;
  message: string;
  totalAfterDiscount?: string;
  discount?: number;
};

type OrdersResponse = {
  success: boolean;
  message?: string;
  orders?: any[];
};

/* Create User */
export async function createUser(user: UserData) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return {
      success: true,
      message: "User created successfully.",
      user: JSON.parse(JSON.stringify(newUser)),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to create user.",
      user: null,
    };
  }
}

/* Get User */
export async function getUserById(
  clerkId: string
): Promise<UserResponse> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return {
        success: false,
        message: "User not found with this ID.",
        user: null,
      };
    }

    return {
      success: true,
      message: "Successfully fetched user data.",
      user: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to fetch user.",
      user: null,
    };
  }
}

/* Update User */
export async function updateUser(
  clerkId: string,
  userData: UserData
): Promise<UserResponse> {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      userData,
      { new: true }
    );

    if (!updatedUser) {
      return {
        success: false,
        message: "User not found with this ID.",
        user: null,
      };
    }

    return {
      success: true,
      message: "User updated successfully.",
      user: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to update user.",
      user: null,
    };
  }
}

/* Delete User */
export async function deleteUser(
  clerkId: string
): Promise<UserResponse> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return {
        success: false,
        message: "User not found with this ID.",
        user: null,
      };
    }

    const deletedUser = await User.findByIdAndDelete(user._id);

    if (!deletedUser) {
      return {
        success: false,
        message: "Something went wrong.",
        user: null,
      };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "User deleted successfully.",
      user: JSON.parse(JSON.stringify(deletedUser)),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to delete user.",
      user: null,
    };
  }
}

/* Change Active Address */
export async function changeActiveAddress(
  id: string,
  userId: string
): Promise<AddressResponse> {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        addresses: [],
      };
    }

    const addresses = (user.address ?? []).map(
      (address: any) => ({
        ...address.toObject(),
        active: address._id.toString() === id,
      })
    );

    user.address = addresses;

    await user.save();

    return {
      success: true,
      addresses: JSON.parse(JSON.stringify(addresses)),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to update active address.",
      addresses: [],
    };
  }
}

/* Delete Address */
export async function deleteAddress(
  id: string,
  userId: string
): Promise<AddressResponse> {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        addresses: [],
      };
    }

    user.address = (user.address ?? []).filter(
      (address: any) =>
        address._id.toString() !== id
    );

    await user.save();

    return {
      success: true,
      addresses: JSON.parse(
        JSON.stringify(user.address)
      ),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to delete address.",
      addresses: [],
    };
  }
}

/* Save Address */
export async function saveAddress(
  address: Record<string, unknown>,
  userId: string
): Promise<AddressResponse> {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        address: null,
      };
    }

    const normalizedAddress = {
      ...(address ?? {}),
      active: true,
    };

    user.address = normalizedAddress;
    user.billingAddress = normalizedAddress;

    await user.save();

    return {
      success: true,
      message: "Address saved successfully.",
      address: JSON.parse(
        JSON.stringify(user.billingAddress ?? user.address)
      ),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to save address.",
      address: null,
    };
  }
}

/* Apply Coupon */
export async function applyCoupon(
  coupon: string,
  userId: string
): Promise<CouponResponse> {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const couponCode = coupon.trim();

    if (!couponCode) {
      return {
        success: false,
        message: "Please enter a coupon code.",
      };
    }

    const checkCoupon = await Coupon.findOne({
      coupon: couponCode,
    });

    if (!checkCoupon) {
      return {
        success: false,
        message: "Invalid Coupon.",
      };
    }

    const cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      return {
        success: false,
        message: "Cart not found.",
      };
    }

    const discount = Number(checkCoupon.discount) || 0;
    const cartTotal = Number(cart.cartTotal) || 0;

    const totalAfterDiscount =
      cartTotal - (cartTotal * discount) / 100;

    await Cart.findOneAndUpdate(
      { user: userId },
      { totalAfterDiscount },
      { new: true }
    );

    return {
      success: true,
      message: "Successfully applied Coupon.",
      totalAfterDiscount:
        totalAfterDiscount.toFixed(2),
      discount,
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to apply coupon.",
    };
  }
}

/* Get User Orders */
export async function getAllUserOrdersProfile(
  clerkId: string
): Promise<OrdersResponse> {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
        orders: [],
      };
    }

    const orders = await Order.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const filteredOrders = orders.map((order) => ({
      id: order._id,
      date: new Date(
        order.createdAt
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      total: order.total,
    }));

    return {
      success: true,
      orders: JSON.parse(
        JSON.stringify(filteredOrders)
      ),
    };
  } catch (error) {
    handleError(error);

    return {
      success: false,
      message: "Failed to fetch orders.",
      orders: [],
    };
  }
}