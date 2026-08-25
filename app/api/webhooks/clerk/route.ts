import {
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/database/actions/user.actions";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Webhook secret is not configured",
        },
        { status: 500 }
      );
    }

    // Get Svix headers
    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Svix headers",
        },
        { status: 400 }
      );
    }

    // Get raw request body
    const body = await req.text();

    // Verify webhook
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Webhook verification failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature",
        },
        { status: 400 }
      );
    }

    const eventType = evt.type;

    // USER CREATED
    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        image_url,
        username,
      } = evt.data;

      const email = email_addresses?.[0]?.email_address;

      if (!email) {
        return NextResponse.json(
          {
            success: false,
            message: "User email not found",
          },
          { status: 400 }
        );
      }

      const user = {
        clerkId: id,
        email,
        image: image_url || "",
        username: username || "",
      };

      const newUser = await createUser(user);

      console.log("User created in MongoDB:", id);

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
    }

    // USER UPDATED
    if (eventType === "user.updated") {
      const {
        id,
        image_url,
        username,
      } = evt.data;

      const user = {
        image: image_url || "",
        username: username || "",
      };

      const updatedUser = await updateUser(id, user);

      console.log("User updated in MongoDB:", id);

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    }

    // USER DELETED
    if (eventType === "user.deleted") {
      const { id } = evt.data;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is missing",
          },
          { status: 400 }
        );
      }

      const deletedUser = await deleteUser(id);

      console.log("User deleted from MongoDB:", id);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
        user: deletedUser,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Event ${eventType} received`,
    });
  } catch (error) {
    console.error("Clerk webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}