"use client";

import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Minus, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductCarouselProps {
  products?: any[];
}

const ProductCarousel = ({
  products = [],
}: ProductCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!products.length) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="heading ownContainer mb-[10px] text-center uppercase sm:mb-[40px]">
        Featured Products
      </div>

      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {products.map((product, index) => {
            const subProduct = product?.subProducts?.[0];

            const productImage =
              subProduct?.images?.[0]?.url ||
              "https://placehold.co/600x600";

            const productPrice =
              Number(subProduct?.sizes?.[0]?.price) || 0;

            const discountPercent =
              Number(subProduct?.discount) || 0;

            const originalPrice =
              discountPercent > 0
                ? productPrice +
                  (productPrice * discountPercent) / 100
                : productPrice;

            const category =
              typeof product?.category === "object"
                ? product?.category?.name
                : product?.category || "";

            const rating = Number(product?.rating) || 0;
            const numReviews = Number(product?.numReviews) || 0;
            const description = product?.description || "";

            return (
              <div
                key={product?._id || product?.slug || index}
                className="flex min-w-0 flex-[0_0_100%] flex-col gap-4 sm:gap-8 lg:flex-row"
              >
                {/* Product Image */}
                <div className="flex items-center justify-center lg:w-1/2">
                  <img
                    src={productImage}
                    alt={product?.name || "Product"}
                    width={600}
                    height={600}
                    className="h-auto w-full max-w-md rounded-lg object-cover shadow-md"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-3 lg:w-1/2 sm:space-y-4">
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    {product?.name || "Product"}
                  </h2>

                  {category && (
                    <p className="text-xs text-gray-500 lg:text-sm">
                      {category}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-sm font-medium">
                      {rating}
                    </span>

                    <span className="text-sm text-gray-500">
                      ({numReviews} Reviews)
                    </span>
                  </div>

                  {/* Description */}
                  {description && (
                    <p className="text-sm text-gray-600 sm:text-base">
                      {description.slice(0, 200)}
                      {description.length > 200 && "..."}
                    </p>
                  )}

                  {/* Price + Quantity */}
                  <div className="flex flex-col items-start justify-between py-4 lg:flex-row lg:items-center">
                    {/* Price */}
                    <div className="mb-4 lg:mb-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold lg:text-3xl">
                          ₹{productPrice.toFixed(2)}
                        </span>

                        {discountPercent > 0 && (
                          <>
                            <span className="text-lg text-gray-500 line-through">
                              ₹{originalPrice.toFixed(2)}
                            </span>

                            <span className="font-semibold text-red-500">
                              -{discountPercent}%
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-gray-500">
                        Inclusive of all taxes
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="bg-[#F2F2F2]"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-12 border-y-2 py-[6px] text-center">
                        1
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="bg-[#F2F2F2]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Learn More */}
                  {product?.slug && (
                    <Link href={`/product/${product.slug}?style=0`}>
                      <Button className="w-full px-8 sm:w-auto">
                        Learn More
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {products.length > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={selectedIndex === index}
              className={`h-3 w-3 rounded-full transition-colors ${
                selectedIndex === index
                  ? "bg-gray-800"
                  : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeaturedProducts = ({
  products = [],
}: ProductCarouselProps) => {
  return (
    <div className="space-y-12">
      <ProductCarousel products={products} />
    </div>
  );
};

export default FeaturedProducts;