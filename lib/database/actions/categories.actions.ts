"use server";

import { handleError } from "@/lib/utils";
import { connectToDatabase } from "../connect";
import Category from "../models/category.model";

export async function getAllCategories() {
    try {
      await connectToDatabase();
      const categories = await Category.find({}).sort({ updatedAt: -1 }).lean();
      return {
        success: true,
        message: "Successfully fetched all categories.",
        categories: JSON.parse(JSON.stringify(categories)),
      };
    } catch (error) {
      handleError(error);
    }
}
