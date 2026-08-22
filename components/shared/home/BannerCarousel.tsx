"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  url: string;
  public_id?: string;
}

interface BannerCarouselProps {
  desktopImages: Banner[] | string[];
}

const mobileImages = [
  "https://placehold.co/400x200?text=Mobile+Slide+1",
  "https://placehold.co/400x200?text=Mobile+Slide+2",
  "https://placehold.co/400x200?text=Mobile+Slide+3",
];

const BannerCarousel = ({ desktopImages }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const desktopBannerUrls = desktopImages
    .map((image) => (typeof image === "string" ? image : image?.url))
    .filter((url): url is string => Boolean(url));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 485px)");

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const images = isMobile ? mobileImages : desktopBannerUrls;

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0;
      return (prev + 1) % images.length;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0;
      return (prev - 1 + images.length) % images.length;
    });
  };

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative mb-5 h-[400px] w-full overflow-hidden">
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={`Banner ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-none text-black"
          >
            <ChevronLeft size={24} />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-none text-black"
          >
            <ChevronRight size={24} />
          </Button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to banner ${index + 1}`}
                className={`h-3 w-3 rounded-full ${
                  index === currentIndex
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;