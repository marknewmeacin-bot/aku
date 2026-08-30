"use server";

import { connectToDatabase } from "../connect";
import Order from "../models/order.model";
import User from "../models/user.model";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import EmailTemplate from "@/lib/emails/index";
import { handleError } from "@/lib/utils";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { unstable_cache } from "next/cache";
const { ObjectId } = mongoose.Types;

export async function sendOrderConfirmationEmail(order: any) {
  try {
    const userEmail = order?.user?.email || order?.email;

    if (!userEmail) {
      console.error("Order confirmation email skipped: no user email found.");
      return {
        success: false,
        message: "No user email available for confirmation email.",
      };
    }

    const gmailUser = process.env.GMAIL_USER || "mark.newme.ac.in@gmail.com";
    const gmailPassword = process.env.GOOGLE_APP_PASSWORD;

    if (!gmailPassword) {
      console.error(
        "Order confirmation email skipped: GOOGLE_APP_PASSWORD is not configured."
      );
      return {
        success: false,
        message: "Email configuration missing.",
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    await transporter.sendMail({
      from: gmailUser,
      to: userEmail,
      subject: "Order Confirmation - Aku",
      html: await render(EmailTemplate(order)),
    });

    return { success: true, message: "Order confirmation email sent successfully." };
  } catch (error) {
    const message = handleError(error);
    console.error("Failed to send order confirmation email:", message);
    return {
      success: false,
      message: message || "Failed to send order confirmation email.",
    };
  }
}

// create an order
export async function createOrder(
  products: {
    product: string;
    name: string;
    image: string;
    size: string;
    qty: number;
    color: { color: string; image: string };
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

    const orderForEmail = await Order.findById(newOrder._id).populate({
      path: "user",
      model: User,
    });

    await sendOrderConfirmationEmail(orderForEmail);

    return {
      message: "Successfully placed Order.",
      orderId: JSON.parse(JSON.stringify(newOrder._id)),
      success: true,
    };
  } catch (error) {
    const message = handleError(error);
    return {
      success: false,
      message: message || "Failed to create order",
      orderId: null,
    };
  }
}

// get order details by its ID
export const getOrderDetailsById = unstable_cache(
  async (orderId: string) => {
    try {
      if (!ObjectId.isValid(orderId)) {
        redirect("/");
      }
      await connectToDatabase();
      const orderData = await Order.findById(orderId)
        .populate({ path: "user", model: User })
        .lean();
      if (!orderData) {
        return {
          message: "Order not found with this ID!",
          success: false,
          orderData: [],
        };
      } else {
        return {
          message: "Successfully grabbed data.",
          success: true,
          orderData: JSON.parse(JSON.stringify(orderData)),
        };
      }
    } catch (error) {
      handleError(error);
      return {
        message: "Failed to fetch order details",
        success: false,
        orderData: null,
      };
    }
  },
  ["order_details"],
  {
    revalidate: 300,
  }
);

// create a stripe order instance
export async function createStripeOrder(
  products: {
    product: string;
    name: string;
    image: string;
    size: string;
    qty: number;
    color: { color: string; image: string };
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
      return redirect("/sign-in");
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

    const lineItems = products.map((item) => ({
      price_data: {
        currency: "inr",
        unit_amount: item.price * 100,
        product_data: {
          name: item.name,
          images: [item.image],
        },
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url:
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/order/${newOrder._id}`
          : `https://aku-h1v7-ten.vercel.app/order/${newOrder._id}`,
      cancel_url:
        process.env.NODE_ENV === "development"
          ? `http://localhost:3000/payment/cancel`
          : `https://aku-h1v7-ten.vercel.app/payment/cancel`,
      metadata: { orderId: newOrder._id.toString() },
    });

    console.log("Stripe session URL:", session.url); // Verify URL in logs
    return { sessionUrl: session.url };
  } catch (error) {
    const message = handleError(error);
    console.error("Error creating Stripe order:", message);
    return { sessionUrl: null, error: message };
  }
}
