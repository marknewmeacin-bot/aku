"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categories = [
  { name: "Bath & Body", count: 45 },
  { name: "Candles", count: 1 },
  { name: "Cosmetics", count: 8 },
  { name: "Fragrance", count: 73 },
  { name: "Hair Care", count: 2 },
  { name: "Lip Care", count: 3 },
];

const productTypes = [
  { name: "Attar", count: 1 },
  { name: "Attar Set", count: 1 },
  { name: "Body Deo - 150ml", count: 4 },
  { name: "Body Lotion - 200ml", count: 7 },
  { name: "Body Mist - 150ml", count: 4 },
  { name: "Candle Gift set", count: 1 },
];

const availabilityOptions = [
  { name: "In stock", count: 148 },
  { name: "Out of stock", count: 9 },
];

interface FilterContentProps {
  priceRange: number[];
  setPriceRange: React.Dispatch<React.SetStateAction<number[]>>;
  onClose: () => void;
}

const FilterContent = ({
  priceRange,
  setPriceRange,
  onClose,
}: FilterContentProps) => {
  const resetPrice = () => {
    setPriceRange([0, 2249]);
  };

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Price */}
        <div>
          <h3 className="mb-2 font-semibold">Price</h3>

          <Button
            type="button"
            variant="ghost"
            onClick={resetPrice}
            className="mb-2 h-auto p-0 text-sm font-normal hover:bg-transparent"
          >
            Reset
          </Button>

          <Slider
            max={2249}
            min={0}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-2"
          />

          <p className="text-sm">
            Price: ₹{priceRange[0]} - ₹{priceRange[1]}
          </p>
        </div>

        {/* Category */}
        <div>
          <h3 className="mb-2 font-semibold">Category</h3>

          <Button
            type="button"
            variant="ghost"
            className="mb-2 h-auto p-0 text-sm font-normal hover:bg-transparent"
          >
            Reset
          </Button>

          {categories.map((category) => (
            <div
              key={category.name}
              className="mb-2 flex items-center space-x-2"
            >
              <Checkbox id={`category-${category.name}`} />

              <label
                htmlFor={`category-${category.name}`}
                className="cursor-pointer text-sm"
              >
                {category.name} ({category.count})
              </label>
            </div>
          ))}
        </div>

        {/* Product Type */}
        <div>
          <h3 className="mb-2 font-semibold">Product Type</h3>

          <Button
            type="button"
            variant="ghost"
            className="mb-2 h-auto p-0 text-sm font-normal hover:bg-transparent"
          >
            Reset
          </Button>

          {productTypes.map((type) => (
            <div
              key={type.name}
              className="mb-2 flex items-center space-x-2"
            >
              <Checkbox id={`type-${type.name}`} />

              <label
                htmlFor={`type-${type.name}`}
                className="cursor-pointer text-sm"
              >
                {type.name} ({type.count})
              </label>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div>
          <h3 className="mb-2 font-semibold">Availability</h3>

          <Button
            type="button"
            variant="ghost"
            className="mb-2 h-auto p-0 text-sm font-normal hover:bg-transparent"
          >
            Reset
          </Button>

          {availabilityOptions.map((option) => (
            <div
              key={option.name}
              className="mb-2 flex items-center space-x-2"
            >
              <Checkbox id={`availability-${option.name}`} />

              <label
                htmlFor={`availability-${option.name}`}
                className="cursor-pointer text-sm"
              >
                {option.name} ({option.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between">
        <Button
          type="button"
          className="bg-black text-white hover:bg-gray-800"
          onClick={onClose}
        >
          APPLY
        </Button>

        <Button type="button" variant="outline" onClick={onClose}>
          CLEAR
        </Button>
      </div>
    </div>
  );
};

const FilterButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 2249]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <div className="relative w-full">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex items-center bg-black px-4 py-2 text-white">
              FILTER
              <span className="ml-2">+</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="h-full overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <FilterContent
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClose={() => {}}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <>
          <Button
            type="button"
            className="flex items-center bg-black px-4 py-2 text-white"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            FILTER

            {isOpen ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-[80vw]">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>

              <FilterContent
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onClose={() => setIsOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default FilterButton;