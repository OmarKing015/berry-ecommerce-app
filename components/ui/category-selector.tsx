"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Category } from "@/sanity.types";
import { imageUrl } from "@/lib/imageUrl";

// Interface for a single category, as per the user's specification

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
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full font-sans">
      <div className="container mx-auto px-4 py-12">
          {" "}
          <h3 className="text-lg">Categories</h3>
          <div className="lg:col-span-4 mb-3">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>{" "}
        

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {" "}
          {categories
            .filter(
              (category) =>
                !category.title?.includes("Custom") &&
                category.title?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((category) => (
              <Link
                href={`/categories/${category.slug?.current}`}
                key={category.title}
              >
                <div className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden transform hover:-translate-y-1">
                  <div className="relative w-full h-56">
                    {category.image && (
                      <Image
                        src={imageUrl(category.image)?.url()}
                        alt={`Image for ${category.title}`}
                        // layout="fill"
                        // objectFit="cover"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}

                    {/* <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div> */}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 capitalize text-center">
                      {category.title}
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
            <p className="text-sm">
              Check our new arrivals and special offers.
            </p>
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
