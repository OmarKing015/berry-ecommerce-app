"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

// Interface for a single category, as per the user's specification
interface Category {
  name: string;
  imageUrl: string;
  href: string;
}

// Interface for the component's props
interface CategorySelectorProps {
  categories: Category[];
}

/**
 * A component to display a grid of product categories.
 * Each category is represented by a card with an image and a title,
 * and links to the corresponding category page.
 * It also features a dismissible banner at the bottom.
 */
export const CategorySelector = ({ categories }: CategorySelectorProps) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <div className="w-full font-sans">
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link href={category.href} key={category.name}>
              <div className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden transform hover:-translate-y-1">
                <div className="relative w-full h-56">
                  <Image
                    src={category.imageUrl}
                    alt={`Image for ${category.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 capitalize text-center">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {isBannerVisible && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 max-w-sm z-50">
          <div className="flex-grow">
            <p className="font-bold">Don&apos;t miss out!</p>
            <p className="text-sm">Check our new arrivals and special offers.</p>
          </div>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// For backwards compatibility, in case other parts of the app still use the old name.
// I noticed a typo in the original file (CatogerySelectorComponent) and I'm providing this export to prevent breaking changes.
// After confirming it's not used elsewhere, this can be removed.
export const CatogerySelectorComponent = CategorySelector;
