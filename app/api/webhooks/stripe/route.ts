import { connectToDatabase } from "@/lib/database/connect";
import Order from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/database/actions/order.actions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ messsage: "Not Allowed" }, { status: 405 });
  }
  const body = await req.text();

  const signature = (await headers()).get("Stripe-Signature") as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_SECRET_WEBHOOK as string
    );
  } catch (error: unknown) {
    return new Response("Webhook Error", { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new Response(null, { status: 503 });
    }

    await connectToDatabase();
    const order = await Order.findById(orderId).populate({
      path: "user",
      model: User,
    });

    if (!order) {
      console.error("Stripe checkout completed but order was not found:", orderId);
      return new Response(null, { status: 404 });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    await sendOrderConfirmationEmail(order);
  } else {
    console.log("unhandled event");
  }
  return new Response(null, { status: 200 });
}
