import React from "react";
import Image from "next/image";
import Link from "next/link";

type SubCategory = {
  _id: string;
  name: string;
  images?: { url?: string }[];
};

const CategorySection = ({
  subCategories,
}: {
  subCategories: SubCategory[];
}) => {
  return (
    <div className="container mx-auto px-4 mb-[20px]">
      <div className="heading my-[10px] ownContainer text-center uppercase heading ownContainer  sm:my-[40px]">
        LUXURY CATEGORIES
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {subCategories.map((category, index) => (
          <Link
            key={category._id || index}
            href={`/shop/subCategory/${category._id}?name=${encodeURIComponent(category.name)}`}
            className="group flex flex-col items-center"
          >
            <div className="w-full overflow-hidden bg-gray-100">
              <Image
                src={category.images?.[0]?.url || "/images/error.png"}
                alt={category.name}
                width={450}
                height={320}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="mt-2 text-center text-sm font-medium group-hover:underline">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
