"use server";

import { redirect } from "next/navigation";
import {
  revalidateTag,
  unstable_cache,
} from "next/cache";

import { handleError } from "@/lib/utils";

import { connectToDatabase } from "../connect";
import Category from "../models/category.model";
import Product from "../models/product.model";
import SubCategory from "../models/subCategory.model";
import User from "../models/user.model";

// ============================================================
// GET TOP SELLING PRODUCTS
// ============================================================

export const getTopSellingProducts = unstable_cache(
  async () => {
    try {
      await connectToDatabase();

      const products = await Product.find()
        .sort({ "subProduct.sold": -1 })
        .limit(4)
        .lean();

      if (!products.length) {
        return {
          products: [],
          success: false,
          message: "Products are not yet created!",
        };
      }

      return {
        products: JSON.parse(JSON.stringify(products)),
        success: true,
        message: "Products fetched successfully.",
      };
    } catch (error) {
      handleError(error);
    }
  },
  ["top_selling_products"],
  {
    revalidate: 1800,
  }
);

// ============================================================
// GET NEW ARRIVAL PRODUCTS
// ============================================================

export const getNewArrivalProducts = unstable_cache(
  async () => {
    try {
      await connectToDatabase();

      const products = await Product.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

      if (!products.length) {
        return {
          products: [],
          success: false,
          message: "Products are not yet created!",
        };
      }

      return {
        products: JSON.parse(JSON.stringify(products)),
        success: true,
        message: "Fetched all new arrival products.",
      };
    } catch (error) {
      handleError(error);
    }
  },
  ["new_arrival_products"],
  {
    revalidate: 1800,
  }
);

// ============================================================
// GET PRODUCTS BY SEARCH QUERY
// ============================================================

export async function getProductsByQuery(query: string) {
  try {
    await connectToDatabase();

    const products = await Product.find({
      name: {
        $regex: query,
        $options: "i",
      },
    })
      .limit(4)
      .lean();

    if (!products.length) {
      return {
        products: [],
        success: false,
        message: "No products found with this search criteria.",
      };
    }

    return {
      products: JSON.parse(JSON.stringify(products)),
      success: true,
      message: "Successfully fetched all query related products.",
    };
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

export const getSingleProduct = unstable_cache(
  async (slug: string, style: number, size: number) => {
    try {
      await connectToDatabase();

      const product = await Product.findOne({ slug })
        .populate({
          path: "category",
          model: Category,
        })
        .populate({
          path: "subCategories",
          model: SubCategory,
        })
        .populate({
          path: "reviews.reviewBy",
          model: User,
        })
        .lean();

      if (!product) {
        return {
          success: false,
          message: "Product not found.",
        };
      }

      const subProduct = product.subProducts?.[style];

      if (!subProduct) {
        return {
          success: false,
          message: "Product style not found.",
        };
      }

      const selectedSize = subProduct.sizes?.[size];

      if (!selectedSize) {
        return {
          success: false,
          message: "Product size not found.",
        };
      }

      const prices = subProduct.sizes
        .map((item: { price: number }) => item.price)
        .sort((a: number, b: number) => a - b);

      // ========================================================
      // RATING COUNT
      // ========================================================

      const ratingCount: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      product.reviews.forEach((review: { rating: number }) => {
        const rating = review.rating;

        if (ratingCount[rating] !== undefined) {
          ratingCount[rating]++;
        }
      });

      const totalReviews = product.reviews.length;

      // ========================================================
      // RATING BREAKDOWN
      // ========================================================

      const ratingBreakdown = [1, 2, 3, 4, 5].map((stars) => {
        const count = ratingCount[stars];

        const percentage =
          totalReviews > 0
            ? Number(((count / totalReviews) * 100).toFixed(2))
            : 0;

        return {
          stars,
          percentage,
          count,
        };
      });

      // ========================================================
      // PRICE
      // ========================================================

      const priceBefore = selectedSize.price;

      const price =
        subProduct.discount > 0
          ? (
              priceBefore -
              (priceBefore * subProduct.discount) / 100
            ).toFixed(2)
          : priceBefore;

      // ========================================================
      // ALL SIZES
      // ========================================================

      const allSizes = product.subProducts
        .flatMap((item: { sizes: unknown[] }) => item.sizes)
        .sort(
          (a: { size: number }, b: { size: number }) =>
            a.size - b.size
        )
        .filter(
          (
            item: { size: number },
            index: number,
            array: { size: number }[]
          ) =>
            array.findIndex(
              (existing) => existing.size === item.size
            ) === index
        );

      // ========================================================
      // PRODUCT RESPONSE
      // ========================================================

      const newProduct = {
        success: true,

        ...product,

        style,

        images: subProduct.images,
        sizes: subProduct.sizes,
        discount: subProduct.discount,
        sku: subProduct.sku,

        colors: product.subProducts.map(
          (item: { color: unknown }) => item.color
        ),

        priceRange:
          prices.length > 1
            ? `From ₹${prices[0]} to ₹${prices[prices.length - 1]}`
            : undefined,

        price,
        priceBefore,
        quantity: selectedSize.qty,

        ratingBreakdown,
        rating: product.rating,

        allSizes,
      };

      return JSON.parse(JSON.stringify(newProduct));
    } catch (error) {
      handleError(error);
      redirect("/");
    }
  },
  ["product"],
  {
    revalidate: 1800,
    tags: ["product"],
  }
);

// ============================================================
// CREATE / UPDATE PRODUCT REVIEW
// ============================================================

export async function createProductReview(
  rating: number,
  review: string,
  clerkId: string,
  productId: string
) {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId);
    const user = await User.findOne({ clerkId });

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const existingReview = product.reviews.find(
      (item: { reviewBy: { toString(): string } }) =>
        item.reviewBy.toString() === user._id.toString()
    );

    // ==========================================================
    // UPDATE EXISTING REVIEW
    // ==========================================================

    if (existingReview) {
      await Product.updateOne(
        {
          _id: productId,
          "reviews._id": existingReview._id,
        },
        {
          $set: {
            "reviews.$.review": review,
            "reviews.$.rating": rating,
            "reviews.$.reviewCreatedAt": Date.now(),
          },
        }
      );

      const updatedProduct = await Product.findById(productId);

      if (!updatedProduct) {
        return {
          success: false,
          message: "Product not found after update.",
        };
      }

      updatedProduct.numReviews = updatedProduct.reviews.length;

      updatedProduct.rating =
        updatedProduct.reviews.length > 0
          ? updatedProduct.reviews.reduce(
              (total: number, item: { rating: number }) =>
                total + item.rating,
              0
            ) / updatedProduct.reviews.length
          : 0;

      await updatedProduct.save();
      await updatedProduct.populate("reviews.reviewBy");

      revalidateTag("product", "max");

      return {
        success: true,
        reviews: JSON.parse(
          JSON.stringify(updatedProduct.reviews.reverse())
        ),
      };
    }

    // ==========================================================
    // CREATE NEW REVIEW
    // ==========================================================

    const fullReview = {
      reviewBy: user._id,
      rating,
      review,
      reviewCreatedAt: Date.now(),
    };

    product.reviews.push(fullReview);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce(
            (total: number, item: { rating: number }) =>
              total + item.rating,
            0
          ) / product.reviews.length
        : 0;

    await product.save();
    await product.populate("reviews.reviewBy");

    revalidateTag("product", "max");

    return {
      success: true,
      reviews: JSON.parse(
        JSON.stringify(product.reviews.reverse())
      ),
    };
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// GET PRODUCT DETAILS BY ID
// ============================================================

export async function getProductDetailsById(
  productId: string,
  style: number,
  size: number | string
) {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId).lean();

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const selectedStyle = product.subProducts?.[style];

    if (!selectedStyle) {
      return {
        success: false,
        message: "Product style not found.",
      };
    }

    const selectedSize = selectedStyle.sizes?.[Number(size)];

    if (!selectedSize) {
      return {
        success: false,
        message: "Product size not found.",
      };
    }

    const discount = selectedStyle.discount;
    const priceBefore = selectedSize.price;

    const price = discount
      ? priceBefore - (priceBefore * discount) / 100
      : priceBefore;

    const data = {
      _id: product._id.toString(),

      style: Number(style),

      name: product.name,
      description: product.description,
      slug: product.slug,

      sku: selectedStyle.sku,

      brand: product.brand,
      category: product.category,
      subCategories: product.subCategories,

      shipping: product.shipping,

      images: selectedStyle.images,
      color: selectedStyle.color,

      size: selectedSize.size,

      price: price.toFixed(2),
      priceBefore: priceBefore.toFixed(2),

      vendor: product.vendor,
      vendorId: product.vendorId,

      discount,

      saved: Math.round(priceBefore - price),

      quantity: selectedSize.qty,
    };

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    handleError(error);
  }
}

// ============================================================
// GET RELATED PRODUCTS
// ============================================================

export const getRelatedProductsBySubCategoryIds =
  unstable_cache(
    async (subCategoryIds: string[]) => {
      try {
        await connectToDatabase();

        const query = subCategoryIds.length
          ? {
              subCategories: {
                $in: subCategoryIds,
              },
            }
          : {};

        const products = await Product.find(query)
          .limit(12)
          .lean();

        if (!products.length) {
          return {
            success: false,
            products: [],
            message: "No related products found.",
          };
        }

        return {
          success: true,
          products: JSON.parse(JSON.stringify(products)),
        };
      } catch (error) {
        handleError(error);
      }
    },
    ["subcategory_products"],
    {
      revalidate: 1800,
    }
  );

// ============================================================
// GET FEATURED PRODUCTS
// ============================================================

export const getAllFeaturedProducts = unstable_cache(
  async () => {
    try {
      await connectToDatabase();

      const featuredProducts = await Product.find({
        featured: true,
      })
        .populate({
          path: "category",
          model: Category,
        })
        .lean();

      return {
        featuredProducts: JSON.parse(
          JSON.stringify(featuredProducts)
        ),
        success: true,
        message: "Successfully fetched all featured products.",
      };
    } catch (error) {
      handleError(error);
    }
  },
  ["featured_products"],
  {
    revalidate: 1800,
  }
);