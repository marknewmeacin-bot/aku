"use server";

import { handleError } from "@/lib/utils";
import { connectToDatabase } from "../connect";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_SECRET as string,
});

// fetch all website banners
export async function fetchAllWebsiteBanners() {
  try {
    await connectToDatabase();

    const collectionNames = ["banners", "banner", "websitebanners"];
    const databaseBanners = [];

    for (const collectionName of collectionNames) {
      const documents = await mongoose.connection
        .collection(collectionName)
        .find({})
        .sort({ createdAt: -1, updatedAt: -1 })
        .toArray();
      databaseBanners.push(...documents);
      if (documents.length > 0) break;
    }

    const databaseUrls = databaseBanners
      .map((banner) => {
        if (typeof banner.url === "string") return banner.url;
        if (typeof banner.image === "string") return banner.image;
        if (typeof banner.image?.url === "string") return banner.image.url;
        if (typeof banner.imageUrl === "string") return banner.imageUrl;
        if (typeof banner.public_id === "string") {
          return cloudinary.url(banner.public_id, { secure: true });
        }
        if (typeof banner.publicId === "string") {
          return cloudinary.url(banner.publicId, { secure: true });
        }
        if (Array.isArray(banner.images)) {
          const image = banner.images[0];
          if (typeof image === "string") return image;
          if (typeof image?.url === "string") return image.url;
          if (typeof image?.public_id === "string") {
            return cloudinary.url(image.public_id, { secure: true });
          }
        }
        return "";
      })
      .filter(Boolean);

    if (databaseUrls.length > 0) return databaseUrls;

    // Keep compatibility with older admin uploads stored in Cloudinary.
      const result = await cloudinary.api.resources_by_tag("website_banners", {
        type: "upload",
        max_results: 100,
      });
    return result.resources.map((item) => item.url);
  } catch (error) {
    handleError(error);
  }
}
// fetch all app banners
export async function fetchAllAppBanners() {
    try {
      const result = await cloudinary.api.resources_by_tag("app_banners", {
        type: "upload",
        max_results: 100,
      });
      return result.resources;
    } catch (error) {
      handleError(error);
    }
}
