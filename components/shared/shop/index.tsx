"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAllCategories } from "@/lib/database/actions/categories.actions";
import { getAllSubCategoriesByParentId } from "@/lib/database/actions/subCategory.actions";
import { getErrorMessage, handleError } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Category = {
  _id: string;
  name: string;
};

type SubCategory = {
  _id: string;
  name: string;
  images: { url: string }[];
};

const ShopPageComponent = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const selectedCategory = allCategories.find(
    (category) => category._id === selectedCategoryId
  );
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await getAllCategories().then((res) => {
          if (res?.success) {
            setAllCategories(res?.categories || []);
            setSelectedCategoryId(res?.categories[0]?._id || "");
          }
        });
      } catch (error) {
        handleError(error);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    async function fetchSubCategories() {
      if (selectedCategoryId === "") return;
      await getAllSubCategoriesByParentId(selectedCategoryId)
        .then((res) => {
          setSubCategories(res?.subCategories || []);
        })
        .catch((err) => {
          toast.error(getErrorMessage(err));
          setSubCategories([]);
        });
    }
    fetchSubCategories();
  }, [selectedCategoryId]);
  return (
    <div className="container mx-auto my-[50px] px-4">
      <h1 className="heading mb-8 text-center">Shop All Products</h1>
      <RadioGroup
        value={selectedCategoryId}
        onValueChange={setSelectedCategoryId}
      >
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
          {allCategories.map((category) => (
            <div key={category._id}>
              <RadioGroupItem
                value={category._id}
                id={category._id}
                className="sr-only"
              />
              <Label
                htmlFor={category._id}
                className={`flex min-h-12 cursor-pointer items-center justify-center border px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:min-w-[150px] sm:text-sm ${
                  selectedCategoryId === category._id
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black"
                }`}
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
        <h2 className="heading my-10 border-b border-gray-200 pb-4 text-center uppercase">
          {selectedCategory?.name || "Categories"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subCategories.map((item) => (
            <div className="p-4 border rounded" key={item._id}>
              <Link href={`/shop/subCategory/${item._id}?name=${item.name}`}>
                <Image
                  src={item.images[0].url}
                  alt={item.name}
                  width={450}
                  height={320}
                    className="h-auto w-full object-cover"
                />
              </Link>
              <div className="">{item.name}</div>
              <Link href={`/shop/subCategory/${item._id}?name=${item.name}`}>
                <Button>See All Products</Button>
              </Link>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default ShopPageComponent;
