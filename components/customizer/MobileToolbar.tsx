"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  Palette,
  Ruler,
  ImagePlus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import TextStylePanel from "./panels/TextStylePanel";
import TshirtStylePanel from "./panels/TshirtStylePanel";
import LogoPanel from "./panels/LogoPanel";
import { useRef } from "react";
import ActionsPanel from "./panels/ActionsPanel";

export default function MobileToolbar() {
  const {
    totalCost,
    canvas,
    text,
    setText,
    isArabic,
    setIsArabic,
    selectedFont,
    setSelectedFont,
    selectedFontColor,
    setSelectedFontColor,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
  } = useEditorStore();

  const uploadInputRef = useRef<HTMLInputElement>(null);

  const deleteActiveObject = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-2 flex items-center justify-between lg:hidden">
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Ruler />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>T-Shirt Style</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <TshirtStylePanel
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Palette />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Text Options</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <TextStylePanel
                text={text}
                setText={setText}
                isArabic={isArabic}
                setIsArabic={setIsArabic}
                selectedFont={selectedFont}
                setSelectedFont={setSelectedFont}
                selectedFontColor={selectedFontColor}
                setSelectedFontColor={setSelectedFontColor}
              />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <ImagePlus />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Logo Options</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <LogoPanel uploadInputRef={uploadInputRef} />
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500"
          onClick={deleteActiveObject}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-lg font-bold">{totalCost.toFixed(2)} EGP</p>
        </div>
        <ActionsPanel />
      </div>
    </div>
  );
}
