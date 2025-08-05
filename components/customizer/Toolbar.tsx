"use client";
import type React from "react";
import { useRef, useEffect } from "react";
import { fabric } from "fabric";
import {
  Trash2,
  Palette,
} from "lucide-react";
import { useEditorStore } from "../../store/editorStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { costEngine } from "@/lib/costEngine";
import TshirtStylePanel from "./panels/TshirtStylePanel";
import TextStylePanel from "./panels/TextStylePanel";
import LogoPanel from "./panels/LogoPanel";
import HistoryPanel from "./panels/HistoryPanel";
import ActionsPanel from "./panels/ActionsPanel";

export default function Toolbar() {
  const {
    canvas,
    setText,
    text,
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
    <TooltipProvider>
      <aside className="w-full lg:w-72 bg-card border-r p-4 flex flex-col gap-6">
        <TshirtStylePanel
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        <Separator />

        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Palette /> Customize
          </h2>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-4">
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
            </TabsContent>
            <TabsContent value="logo" className="space-y-4">
              <LogoPanel uploadInputRef={uploadInputRef} />
            </TabsContent>
          </Tabs>
          <Button variant="destructive" onClick={deleteActiveObject}>
            <Trash2 className="mr-2" /> Delete Selected
          </Button>
        </div>

        <Separator />

        <HistoryPanel />

        <Separator />

        <ActionsPanel />
      </aside>
    </TooltipProvider>
  );
}
