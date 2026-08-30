"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import {
  getProductsByQuery,
  getTopSellingProducts,
} from "@/lib/database/actions/product.actions";
import { getAllSubCategories } from "@/lib/database/actions/subCategory.actions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleError, getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";

type SubCategory = {
  _id: string;
  name: string;
};

const SearchModal = ({ setOpen }: { setOpen: any }) => {
  const router = useRouter();
  const [query, setQuery] = useState<string>("");
  const [products, setProducts] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    async function fetchTrendingSearches() {
      try {
        const res = await getAllSubCategories();
        setTrendingSearches(
          res?.subCategories?.map((subCategory: SubCategory) => subCategory) ||
            []
        );
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }

    fetchTrendingSearches();
  }, []);
  useEffect(() => {
    async function fetchBestSellerProducts() {
      try {
        await getTopSellingProducts().then((res) => {
          if (res?.success) {
            setProducts(res?.products);
            console.log(res?.products);
          } else {
            setProducts(res?.products);
            toast.error(res?.message || "Failed to fetch products");
          }
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
    fetchBestSellerProducts();
  }, []);
  useEffect(() => {
    async function fetchDataByQuery() {
      try {
        setLoading(true);
        const res = await getProductsByQuery(query);
        if (res?.success) {
          setProducts(res?.products);
          setLoading(false);
        } else {
          setProducts(res?.products);
          // toast.error(res?.message);
          setLoading(false);
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
        setLoading(false);
      }
    }

    if (query.length > 0) fetchDataByQuery();
  }, [query.length]);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <Dialog>
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-lg bg-background p-4 shadow-lg z-50 mx-4 sm:p-6 md:mx-6 md:max-w-lg lg:mx-auto lg:max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search</h2>
            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="search"
            placeholder="Search..."
            className="w-full mb-4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Trending Searches</h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search) => (
                <Button
                  key={search._id}
                  variant={"outline"}
                  size={"sm"}
                  onClick={() =>
                    handleNavigation(
                      `/shop/subCategory/${search._id}?name=${encodeURIComponent(search.name)}`
                    )
                  }
                >
                  {search.name}
                </Button>
              ))}
            </div>
          </div>
          <div className="">
            <h3 className="text-sm font-semibold mb-2">
              {query.length > 0 ? "Search Results" : "Recommended for you"}
            </h3>
            {loading && (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin" size={50} />
              </div>
            )}
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:space-x-0 sm:gap-2">
              {query.length > 0
                ? products.map((product: any, index: number) => (
                    <div
                      key={index}
                      className="cursor-pointer"
                      onClick={() => handleNavigation(`/product/${product.slug}?style=0`)}
                    >
                      <div className="space-y-2 min-w-[110px] flex-shrink-0 sm:min-w-0">
                        <div className="aspect-square relative">
                          <img
                            src={product.subProducts[0]?.images[0]?.url}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full rounded-none object-cover"
                          />

                          {product.subProducts[0]?.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              {product.subProducts[0]?.discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="">
                          <h4 className="font-semibold text-sm">
                            {product.name}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">
                              ₹{product.subProducts[0]?.sizes[0]?.price}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹
                              {product.subProducts[0]?.sizes[0]?.price *
                                (1 + product.subProducts[0]?.discount / 100)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : products.map((product: any, index) => (
                    <div
                      key={index}
                      className="cursor-pointer"
                      onClick={() => handleNavigation(`/product/${product.slug}?style=0`)}
                    >
                      <div className="space-y-2 min-w-[110px] flex-shrink-0 sm:min-w-0">
                        <div className="aspect-square relative">
                          <img
                            src={product.subProducts[0]?.images[0]?.url}
                            alt={product.name}
                            className="absolute inset-0 h-full w-full rounded-none object-cover"
                          />
                          {product.subProducts[0]?.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              {product.subProducts[0].discount}% OFF
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {product.name}
                          </h4>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">
                              ₹
                              {product.subProducts[0]?.discount > 0
                                ? (
                                    product.subProducts[0].sizes[0].price -
                                    (product.subProducts[0].sizes[0].price *
                                      product.subProducts[0].discount) /
                                      100
                                  ).toFixed(2)
                                : product.subProducts[0].sizes[0].price}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {product.subProducts[0]?.discount > 0 && (
                                <div>
                                  ₹{product.subProducts[0]?.sizes[0]?.price}
                                </div>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
            {query.length > 0 && products.length === 0 && (
              <div>No Results found for "{query}".</div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SearchModal;
