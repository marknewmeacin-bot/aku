"use client";

import { ChevronDown, Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useForm } from "@mantine/form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { handleError } from "@/lib/utils";
import { createProductReview } from "@/lib/database/actions/product.actions";

interface ProductReviewComponentProps {
  product: any;
  rating: number;
  numofReviews: number;
  ratings: any;
}

const ProductReviewComponent = ({
  product,
  rating,
  numofReviews,
}: ProductReviewComponentProps) => {
  const { user } = useClerk();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState(product.reviews || []);
  const [sortBy, setSortBy] = useState("Most Recent");

  const form = useForm({
    initialValues: {
      rating: "",
      review: "",
    },

    validate: {
      rating: (value) =>
        value ? null : "Rating is required.",

      review: (value) =>
        value.trim().length > 0
          ? null
          : "Review cannot be empty.",
    },
  });

  const reviewData = {
    averageRating: rating,
    totalReviews: numofReviews,
    ratingBreakDown: product.ratingBreakdown || [],
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await createProductReview(
        Number(form.values.rating),
        form.values.review,
        user.id,
        product._id
      );

      if (response?.reviews) {
        setReviews(response.reviews);
      }

      form.reset();

      toast.success("Successfully added product review");
    } catch (error) {
      handleError(error);
      toast.error("Failed to add product review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ownContainer mt-[20px] p-4">
      <h2 className="heading">Customer Reviews</h2>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Review Summary */}
        <div className="md:w-1/3">
          <div className="mb-2 flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= Math.round(reviewData.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}

            <span className="ml-2 text-xl font-semibold">
              {reviewData.averageRating.toFixed(1)}
            </span>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Based on {reviewData.totalReviews} reviews
          </p>

          {reviewData.ratingBreakDown.map((item: any) => (
            <div
              key={item.stars}
              className="mb-2 flex items-center"
            >
              <div className="flex w-24 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= item.stars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="ml-2 h-2.5 w-full rounded-full bg-gray-200">
                <div
                  className="h-2.5 rounded-full bg-yellow-400"
                  style={{
                    width: `${item.percentage}%`,
                  }}
                />
              </div>

              <span className="ml-2 w-12 text-sm text-gray-600">
                {item.percentage}%
              </span>

              <span className="ml-2 w-12 text-sm text-gray-600">
                ({item.count})
              </span>
            </div>
          ))}

          <Link href={`/review/${product.slug}`}>
            <button className="mt-2 text-sm text-blue-600">
              See all reviews
            </button>
          </Link>
        </div>

        {/* Reviews */}
        <div className="md:w-2/3">
          <div className="mb-4 flex justify-between">
            {user ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Leave a Review</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Submit Your Review
                    </DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={form.onSubmit(handleSubmit)}
                  >
                    <div className="mb-4">
                      <Select
                        value={form.values.rating}
                        onValueChange={(value) =>
                          form.setFieldValue(
                            "rating",
                            value
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Rating" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Rating
                            </SelectLabel>

                            <SelectItem value="1">
                              1 Star
                            </SelectItem>

                            <SelectItem value="2">
                              2 Stars
                            </SelectItem>

                            <SelectItem value="3">
                              3 Stars
                            </SelectItem>

                            <SelectItem value="4">
                              4 Stars
                            </SelectItem>

                            <SelectItem value="5">
                              5 Stars
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mb-4">
                      <Textarea
                        placeholder="Write your review here"
                        {...form.getInputProps("review")}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={loading}
                      >
                        {loading
                          ? "Submitting..."
                          : "Submit Review"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                onClick={() =>
                  router.push("/sign-in")
                }
              >
                Login to add review
              </Button>
            )}

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="appearance-none rounded border px-4 py-2 pr-8 leading-tight focus:border-blue-500 focus:outline-none"
              >
                <option value="Most Recent">
                  Most Recent
                </option>

                <option value="Highest Rated">
                  Highest Rated
                </option>

                <option value="Lowest Rated">
                  Lowest Rated
                </option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Review List */}
          {product.rating === 0 ||
          product.numofReviews === 0 ? (
            <div className="flex justify-center">
              No Reviews yet.
            </div>
          ) : (
            reviews
              .slice(0, 3)
              .map((review: any, index: number) => (
                <div
                  className="border-t pt-4"
                  key={review._id || index}
                >
                  <div className="mb-2 flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-xl font-semibold">
                      {review.reviewBy?.username
                        ?.substring(0, 1)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center">
                        <span className="mr-2 font-semibold capitalize">
                          {review.reviewBy?.username}
                        </span>

                        <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Verified
                        </span>
                      </div>

                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <=
                                Math.round(
                                  review.rating
                                )
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mb-2 text-lg">
                    {review.review}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewComponent;