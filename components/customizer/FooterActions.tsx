"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Loader2, Undo, Redo } from "lucide-react";
import { motion } from "framer-motion";
import CostSummary from "./CostSummay";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FooterActions = () => {
  const { addToBasket, undo, redo, canUndo, canRedo } = useEditorStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToBasket = async () => {
    if (!selectedSize) return;
    setIsLoading(true);
    await addToBasket(selectedSize);
    setIsLoading(false);
  };

  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-t border-border/50 shadow-lg p-4 flex flex-col lg:flex-row items-center gap-4">
      <div className="flex-grow w-full lg:w-auto">
        <CostSummary />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={undo} disabled={!canUndo}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={redo} disabled={!canRedo}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium">Size:</Label>
        <RadioGroup value={selectedSize ?? ""} onValueChange={setSelectedSize} className="flex gap-2">
          {SIZES.map((size) => (
            <div key={size} className="contents">
              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
              <Label
                htmlFor={`size-${size}`}
                className={`cursor-pointer rounded-md border-2 px-3 py-1 text-sm ${selectedSize === size ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="w-full lg:w-auto">
        <SignedIn>
          <Button onClick={handleAddToBasket} disabled={isLoading || !selectedSize} className="w-full">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Add to Basket
          </Button>
        </SignedIn>
        <SignedOut>
          <Button className="w-full">
            <SignInButton mode="modal">
              <span className="flex items-center">
                <Sparkles className="mr-2" />
                Sign In to Create
              </span>
            </SignInButton>
          </Button>
        </SignedOut>
      </div>
    </div>
  );
};

export default FooterActions;
