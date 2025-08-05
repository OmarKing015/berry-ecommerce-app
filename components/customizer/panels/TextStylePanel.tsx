"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Type } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { fabric } from "fabric";

const FONT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
  { name: "Orange", value: "#FFA500" },
];

const FONTS = {
  english: [
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Georgia",
  ],
  arabic: [
    "Noto Sans Arabic",
    "Amiri",
    "Cairo",
    "Almarai",
    "Lalezar",
    "Markazi Text",
    "Mada",
    "Tajawal",
    "El Messiri",
    "Lemonada",
    "Changa",
    "Reem Kufi",
  ],
};

interface TextStylePanelProps {
  text: string;
  setText: (text: string) => void;
  isArabic: boolean;
  setIsArabic: (isArabic: boolean) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedFontColor: string;
  setSelectedFontColor: (color: string) => void;
}

export default function TextStylePanel({
  text,
  setText,
  isArabic,
  setIsArabic,
  selectedFont,
  setSelectedFont,
  selectedFontColor,
  setSelectedFontColor,
}: TextStylePanelProps) {
  const { canvas } = useEditorStore();

  const addText = () => {
    if (!canvas) return;

    const textObject = new fabric.IText(text || "Type here", {
      left: 150,
      top: 200,
      fill: selectedFontColor,
      fontFamily: selectedFont,
      // @ts-ignore
      cost: text.length * 0.1,
      type: "text",
    });

    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
  };

  const changeFont = (font: string) => {
    setSelectedFont(font);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      // @ts-ignore
      activeObject.set({ fontFamily: font });
      canvas.renderAll();
    }
  };

  const changeFontColor = (color: string) => {
    setSelectedFontColor(color);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (
      activeObject &&
      (activeObject.type === "i-text" || activeObject.type === "text")
    ) {
      // @ts-ignore
      activeObject.set({ fill: color });
      canvas.renderAll();
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="text-input">Text Content</Label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border rounded p-2"
          />
          <div className="flex items-center space-x-2 mt-2">
            <Label htmlFor="language-toggle">English</Label>
            <Switch
              id="language-toggle"
              checked={isArabic}
              onCheckedChange={setIsArabic}
            />
            <Label htmlFor="language-toggle">Arabic</Label>
          </div>
          <Label htmlFor="font-select" className="mt-2">
            Font
          </Label>
          <Select value={selectedFont} onValueChange={changeFont}>
            <SelectTrigger id="font-select">
              <SelectValue placeholder="Select Font" />
            </SelectTrigger>
            <SelectContent>
              {(isArabic ? FONTS.arabic : FONTS.english).map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>
                    {isArabic ? "عربي" : "English"}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label className="mt-2">Font Color</Label>
          <div className="flex flex-wrap gap-2">
            {FONT_COLORS.map((color) => (
              <Tooltip key={color.value}>
                <TooltipTrigger asChild>
                  <button
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedFontColor === color.value
                        ? "ring-2 ring-primary border-primary"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => changeFontColor(color.value)}
                  >
                    {selectedFontColor === color.value && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            color.value === "#FFFFFF" ? "bg-black" : "bg-white"
                          }`}
                        />
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addText}
            className="mt-2 bg-transparent"
          >
            <Type className="mr-2" /> Add Text
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
