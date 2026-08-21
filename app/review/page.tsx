"use client";

import React from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  rating: number;
  comment: string;
  author: string;
  date: string;
  helpful: number;
  unhelpful: number;
}

const IndividualProductReviewPage = () => {
  const reviews: Review[] = [
    {
      rating: 5,
      comment: "Cool",
      author: "Varsha Ladhi",
      date: "20 Nov 2024",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 4,
      comment:
        "Good tshirt but a thicker material would have been even better.",
      author: "Vyshali Reddy",
      date: "14 Dec 2023",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 4,
      comment: "Good quality. Nice print.",
      author: "Vasundhra",
      date: "11 Oct 2024",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 5,
      comment: "Better than expected",
      author: "Priyansh Patel",
      date: "22 Aug 2024",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 5,
      comment: "Very good",
      author: "Sandeep Poshala",
      date: "5 May 2024",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 4,
      comment: "Nice",
      author: "Juhi",
      date: "26 June 2024",
      helpful: 0,
      unhelpful: 0,
    },
    {
      rating: 5,
      comment: "Good",
      author: "Kusumanjali",
      date: "19 Nov 2024",
      helpful: 0,
      unhelpful: 0,
    },
  ];

  // Rating counts
  const ratingCounts: Record<number, number> = {
    5: 58,
    4: 16,
    3: 3,
    2: 0,
    1: 1,
  };

  // Rating values
  const ratings: number[] = [5, 4, 3, 2, 1];

  // Calculate total ratings
  const totalRatings: number = ratings.reduce(
    (total, rating) => total + ratingCounts[rating],
    0
  );

  // Calculate total score
  const totalScore: number = ratings.reduce(
    (total, rating) => total + rating * ratingCounts[rating],
    0
  );

  // Calculate average rating
  const averageRating: string =
    totalRatings > 0
      ? (totalScore / totalRatings).toFixed(1)
      : "0.0";

  return (
    <div>
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Information */}
          <div className="md:sticky md:top-6 md:self-start">
            <Card className="p-6">
              <Image
                src="/placeholder.svg"
                alt="Product"
                width={400}
                height={300}
                className="mb-4 w-full rounded-lg"
              />

              <h1 className="mb-2 text-2xl font-bold">
                Product Name
              </h1>

              <p className="mb-4 text-gray-600">
                Product Description
              </p>

              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  Rs. 699
                </span>

                <span className="text-gray-500 line-through">
                  Rs. 1499
                </span>

                <span className="text-orange-500">
                  (Rs. 800 OFF)
                </span>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Ratings */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  RATINGS
                </h2>

                <Star className="h-5 w-5" />
              </div>

              <div className="mb-8 grid gap-8 md:grid-cols-2">
                {/* Average Rating */}
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold">
                    {averageRating}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(Number(averageRating))
                              ? "fill-primary stroke-primary"
                              : "stroke-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="text-sm text-gray-500">
                      {totalRatings} Verified Reviews
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratings.map((rating) => {
                    const percentage =
                      totalRatings > 0
                        ? (ratingCounts[rating] / totalRatings) * 100
                        : 0;

                    return (
                      <div
                        key={rating}
                        className="flex items-center gap-2"
                      >
                        <span className="w-3">
                          {rating}
                        </span>

                        <Star className="h-4 w-4" />

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-8 text-sm text-gray-500">
                          {ratingCounts[rating]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Customer Reviews */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Customer Reviews ({reviews.length})
                  </h3>

                  <Select defaultValue="helpful">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="helpful">
                        Most Helpful
                      </SelectItem>

                      <SelectItem value="recent">
                        Most Recent
                      </SelectItem>

                      <SelectItem value="highest">
                        Highest Rated
                      </SelectItem>

                      <SelectItem value="lowest">
                        Lowest Rated
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div
                      key={index}
                      className="border-b pb-4 last:border-0"
                    >
                      {/* Review Stars */}
                      <div className="mb-2 flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-primary stroke-primary"
                                : "stroke-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="mb-2">
                        {review.comment}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>{review.author}</span>
                          <span>|</span>
                          <span>{review.date}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.helpful}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span>{review.unhelpful}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualProductReviewPage;