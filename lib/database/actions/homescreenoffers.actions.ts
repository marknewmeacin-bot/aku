"use server";

import { handleError } from "@/lib/utils";
import { connectToDatabase } from "../connect";
import mongoose from "mongoose";

type OfferDocument = {
  _id: unknown;
  title?: string;
  offerType?: string;
  type?: string;
  images?: { url?: string; public_id?: string }[];
  image?: string | { url?: string; public_id?: string };
  imageUrl?: string;
  [key: string]: unknown;
};

async function getOffers(type: "specialCombo" | "crazyDeal") {
  await connectToDatabase();

  const collectionNames = [
    "homescreenoffers",
    "homeScreenOffers",
    "home_screen_offers",
  ];
  const normalizedType = type.toLowerCase().replace(/[^a-z]/g, "");
  const offers: OfferDocument[] = [];

  for (const collectionName of collectionNames) {
    const collection = mongoose.connection.collection(collectionName);
    const documents = (await collection.find({}).toArray()) as OfferDocument[];

    for (const document of documents) {
      const documentType = String(
        document.offerType ?? document.type ?? ""
      )
        .toLowerCase()
        .replace(/[^a-z]/g, "");

      if (documentType !== normalizedType) continue;

      const image =
        typeof document.image === "string"
          ? { url: document.image }
          : document.image?.url
            ? document.image
            : document.imageUrl
              ? { url: document.imageUrl }
              : undefined;

      offers.push({
        ...document,
        images:
          document.images?.length ? document.images : image ? [image] : [],
      });
    }

    if (offers.length > 0) break;
  }

  return JSON.parse(JSON.stringify(offers));
}

// Get all offers for home screen
export async function getAllSpecialComboOffers() {
  try {
    return {
      offers: await getOffers("specialCombo"),
      message: "Successfully fetched specialCombo offers.",
      success: true,
    };
  } catch (error) {
    handleError(error);
  }
}
// Get all offers for home screen
export async function getAllCrazyDealOffers() {
  try {
    return {
      offers: await getOffers("crazyDeal"),
      message: "Successfully fetched crazyDeal offers.",
      success: true,
    };
  } catch (error) {
    handleError(error);
  }
}
