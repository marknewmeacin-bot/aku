"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "../connect";
import Cart from "../models/cart.model";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";
import User from "../models/user.model";
import { handleError } from "@/lib/utils";

type UserData = Record<string, unknown>;

// Create user
export async function createUser(user: UserData) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// Get user by Clerk ID
export async function getUserById(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return {
        success: false,
        message: "User not found with this ID!",
        user: null,
      };
    }

    return {
      success: true,
      message: "Successfully fetched User data.",
      user: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    handleError(error);
  }
}

// Update user
export async function updateUser(
  clerkId: string,
  userData: UserData
) {
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
        message: "User not found with this ID!",
        user: null,
      };
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// Delete user
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      return {
        success: false,
        message: "User not found with this ID!",
        user: null,
      };
    }

    const deletedUser = await User.findByIdAndDelete(
      userToDelete._id
    );

    revalidatePath("/");

    if (!deletedUser) {
      return {
        success: false,
        message: "Something went wrong",
        user: null,
      };
    }

    return {
      success: true,
      message: "Successfully deleted User",
      user: JSON.parse(JSON.stringify(deletedUser)),
    };
  } catch (error) {
    handleError(error);
  }
}

// Change active address
export async function changeActiveAddress(
  id: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
        addresses: [],
      };
    }

    const addresses = (user.address ?? []).map(
      (address: any) => {
        const addressData = address.toObject();

        return {
          ...addressData,
          active: address._id.toString() === id,
        };
      }
    );

    user.address = addresses;

    await user.save();

    return {
      success: true,
      addresses: JSON.parse(JSON.stringify(addresses)),
    };
  } catch (error) {
    handleError(error);
  }
}

// Delete address
export async function deleteAddress(
  id: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
        addresses: [],
      };
    }

    user.address = (user.address ?? []).filter(
      (address: any) => address._id.toString() !== id
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
  }
}

// Save address
export async function saveAddress(
  address: Record<string, unknown>,
  userId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
        addresses: [],
      };
    }

    if (!Array.isArray(user.address)) {
      user.address = [];
    }

    user.address.push(address);

    await user.save();

    return {
      success: true,
      addresses: JSON.parse(
        JSON.stringify(user.address)
      ),
    };
  } catch (error) {
    handleError(error);
  }
}

// Apply coupon
export async function applyCoupon(
  coupon: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const checkCoupon = await Coupon.findOne({ coupon });

    if (!checkCoupon) {
      return {
        success: false,
        message: "Invalid Coupon",
      };
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return {
        success: false,
        message: "Cart not found",
      };
    }

    const totalAfterDiscount =
      cart.cartTotal -
      (cart.cartTotal * checkCoupon.discount) / 100;

    await Cart.findOneAndUpdate(
      { user: userId },
      { totalAfterDiscount },
      { new: true }
    );

    return {
      success: true,
      message: "Successfully applied Coupon",
      totalAfterDiscount: totalAfterDiscount.toFixed(2),
      discount: checkCoupon.discount,
    };
  } catch (error) {
    handleError(error);
  }
}

// Get all orders for user profile
export async function getAllUserOrdersProfile(
  clerkId: string
) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
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
      date: new Date(order.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      ),
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
  }
}