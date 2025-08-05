"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/customizer/use-toast";
import { useEditorStore } from "@/store/editorStore";
import useBasketStore from "@/store/store";
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { useAppContext } from "@/context/context";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState } from "react";
import JSZip from "jszip";

export default function ActionsPanel() {
  const { toast } = useToast();
  const { canvas, totalCost, shirtStyle } = useEditorStore();
  const { addItem } = useBasketStore();
  const { setZipedFile, extraCost } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderNow = async () => {
    // This function will be simplified as we are not downloading the file anymore
    // but we will keep the logic to add to basket
    if (!canvas) {
      toast({
        title: "Error",
        description: "Canvas not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const product = await getProductBySlug("custom-tshirt");
      addItem(product, "M", extraCost); // Assuming size M for now, this can be improved
      toast({
        title: "Added to Basket!",
        description: "Your custom t-shirt has been added to your basket.",
      });
      redirect("/basket");
    } catch (error) {
      console.error("Failed to add to basket:", error);
      toast({
        title: "Error",
        description: "Failed to add to basket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold text-sm text-muted-foreground">Actions</h2>
      <SignedIn>
        <Button onClick={orderNow} size="lg" disabled={isProcessing}>
          {isProcessing ? "Processing..." : " Add to Basket"}
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </div>
  );
}
