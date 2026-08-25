"use server";

import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { render } from "react-email";
import { redirect } from "next/navigation";

import { connectToDatabase } from "../connect";
import Order from "../models/order.model";
import User from "../models/user.model";

import EmailTemplate from "@/lib/emails/index";
import { handleError } from "@/lib/utils";

const { ObjectId } = mongoose.Types;

// Create an order
export async function createOrder(
  products: {
    product: string;
    name: string;
    image: string;
    size: string;
    qty: number;
    color: {
      color: string;
      image: string;
    };
    price: number;
    status: string;
    productCompletedAt: Date | null;
    _id: string;
  }[],
  shippingAddress: any,
  paymentMethod: string,
  total: number,
  totalBeforeDiscount: number,
  couponApplied: string,
  userId: string,
  totalSaved: number
) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return {
        message: "User not found with provided ID!",
        success: false,
        orderId: null,
      };
    }

    const newOrder = await new Order({
      user: user._id,
      products,
      shippingAddress,
      paymentMethod,
      total,
      totalBeforeDiscount,
      couponApplied,
      totalSaved,
    }).save();

    try {
      const config = {
        service: "gmail",
        auth: {
          user: "raghunadhwinwin@gmail.com",
          pass: process.env.GOOGLE_APP_PASSWORD as string,
        },
      };

      const transporter = nodemailer.createTransport(config);

      const emailData = {
        from: config.auth.user,
        to: user.email,
        subject: "Order Confirmation - Aku",
        html: await render(EmailTemplate(newOrder)),
      };

      await transporter.sendMail(emailData);
    } catch (emailError) {
      console.error("Order saved, but confirmation email failed:", emailError);
    }

    return {
      message: "Successfully placed Order.",
      orderId: newOrder._id.toString(),
      success: true,
    };
  } catch (error) {
    handleError(error);

    return {
      message: "Failed to create order.",
      orderId: null,
      success: false,
    };
  }
}

// Get order details by ID
export const getOrderDetailsById = async (orderId: string) => {
    try {
      if (!ObjectId.isValid(orderId)) {
        redirect("/");
      }

      await connectToDatabase();

      const orderData = await Order.findById(orderId)
        .populate({
          path: "user",
          model: User,
        })
        .lean();

      if (!orderData) {
        return {
          message: "Order not found with this ID!",
          success: false,
          orderData: [],
        };
      }

      return {
        message: "Successfully grabbed data.",
        success: true,
        orderData: JSON.parse(JSON.stringify(orderData)),
      };
    } catch (error) {
      handleError(error);

      return {
        message: "Failed to fetch order details.",
        success: false,
        orderData: [],
      };
    }
};