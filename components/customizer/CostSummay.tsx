"use client";

import { useEditorStore } from "../../store/editorStore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import useBasketStore from "@/store/store";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function CostSummary() {
  const { totalCost, canvas } = useEditorStore();
  const { addItem } = useBasketStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToBasket = async () => {
    if (!selectedSize) {
      toast.error("Please select a size before adding to the basket.");
      return;
    }
    if (!canvas) {
        toast.error("Editor not ready. Please wait a moment and try again.");
        return;
    }

    setIsLoading(true);
    try {
      const imageData = canvas.toDataURL({
        format: 'png',
        quality: 1,
      });

      const slug = `custom-tshirt-${Date.now()}`;

      const response = await fetch('/api/custom-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Custom T-shirt",
          price: totalCost,
          size: selectedSize, // The API expects a single value
          imageData,
          slug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create custom product.");
      }

      const newProduct = await response.json();

      // The price is already final, so extraCost is 0
      addItem(newProduct, selectedSize, 0);

      toast.success("Custom T-shirt added to basket!");

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to add to basket: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xs sm:mx-auto sm:mt-8 m-5 lg:fixed lg:bottom-4 lg:right-4 lg:w-72 shadow-2xl backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">Finalize Your Design</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
            <Label className="text-base font-medium">Total Cost</Label>
            <p className="text-3xl font-bold text-black">
            {totalCost.toFixed(2)} EGP
            </p>
            <p className="text-xs text-muted-foreground mt-1">
            Price includes all customizations.
            </p>
        </div>
        <div>
            <Label className="text-base font-medium">Select Size</Label>
            <RadioGroup
                value={selectedSize ?? ""}
                onValueChange={setSelectedSize}
                className="mt-2 grid grid-cols-5 gap-2"
            >
                {SIZES.map((size) => (
                    <div key={size}>
                        <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                        <Label
                            htmlFor={`size-${size}`}
                            className={`cursor-pointer rounded-md border-2 ${selectedSize === size ? 'border-primary' : 'border-border'} flex items-center justify-center p-2 text-sm font-semibold hover:bg-accent`}
                        >
                            {size}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>

      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAddToBasket}
          disabled={isLoading || !selectedSize}
          className="w-full"
          size="lg"
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating..." : "Add to Basket"}
        </Button>
      </CardFooter>
    </Card>
  );
}
