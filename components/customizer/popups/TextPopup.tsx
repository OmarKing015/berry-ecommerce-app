"use client";

import { useState } from "react";
import { fabric } from "fabric";
import { motion } from "framer-motion";
import { Type, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TextPopupProps {
  onClose: () => void;
}

const FONT_COLORS = [
    { name: "Midnight", value: "#000000", ring: "ring-gray-800" },
    { name: "Snow", value: "#FFFFFF", ring: "ring-gray-200" },
    { name: "Crimson", value: "#FF0000", ring: "ring-red-500" },
    { name: "Ocean", value: "#0000FF", ring: "ring-blue-500" },
    { name: "Forest", value: "#008000", ring: "ring-green-500" },
    { name: "Sunshine", value: "#FFFF00", ring: "ring-yellow-500" },
    { name: "Royal", value: "#800080", ring: "ring-purple-500" },
    { name: "Sunset", value: "#FFA500", ring: "ring-orange-500" },
];

const FONTS = {
    english: ["Inter", "Roboto", "Poppins", "Montserrat", "Playfair Display", "Oswald", "Lato", "Source Sans Pro", "Nunito", "Merriweather"],
    arabic: ["Noto Sans Arabic", "Amiri", "Cairo", "Almarai", "Lalezar", "Markazi Text", "Mada", "Tajawal", "El Messiri", "Lemonada"],
};

const TextPopup = ({ onClose }: TextPopupProps) => {
  const { canvas } = useEditorStore();
  const [text, setText] = useState("Your Text Here");
  const [isArabic, setIsArabic] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedFontColor, setSelectedFontColor] = useState("#000000");
  const [customColorValue, setCustomColorValue] = useState("#000000");
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);

  const addText = () => {
    if (!canvas) return;
    const textObject = new fabric.IText(text || "Your Text Here", {
      left: 150,
      top: 200,
      fill: selectedFontColor,
      fontFamily: selectedFont,
      fontSize: 24,
      fontWeight: "bold",
      // @ts-ignore
      cost: text.length * 0.1,
      type: "text",
    });
    canvas.add(textObject);
    canvas.setActiveObject(textObject);
    canvas.renderAll();
    onClose();
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
    if (activeObject && (activeObject.type === "i-text" || activeObject.type === "text")) {
      // @ts-ignore
      activeObject.set({ fill: color });
      canvas.renderAll();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed top-0 left-0 h-full w-80 bg-background/90 backdrop-blur-lg border-r border-border/50 z-20 p-6 flex flex-col"
    >
      <div className="flex-grow overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold">Add Text</h2>

        <div className="space-y-2">
          <Label htmlFor="text-input">Text Content</Label>
          <input id="text-input" type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background/50"/>
        </div>

        <div className="flex items-center justify-between p-2 rounded-md bg-muted/30">
          <Label htmlFor="language-toggle">English</Label>
          <Switch id="language-toggle" checked={isArabic} onCheckedChange={setIsArabic} />
          <Label htmlFor="language-toggle">العربية</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font-select">Font Family</Label>
          <Select value={selectedFont} onValueChange={changeFont}>
            <SelectTrigger id="font-select"><SelectValue placeholder="Choose Font" /></SelectTrigger>
            <SelectContent>
              {(isArabic ? FONTS.arabic : FONTS.english).map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Font Color</Label>
          <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: selectedFontColor }} />
                  <span>{FONT_COLORS.find(c => c.value === selectedFontColor)?.name || "Custom"}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <TooltipProvider>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {FONT_COLORS.map((color) => (
                    <Tooltip key={color.value}>
                      <TooltipTrigger asChild>
                        <button
                          className={`w-10 h-10 rounded-lg border-2 ${selectedFontColor === color.value ? `ring-2 ${color.ring}` : 'border-border'}`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => {
                            changeFontColor(color.value);
                            setCustomColorValue(color.value);
                            setColorPopoverOpen(false);
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent><p>{color.name}</p></TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <Separator />
                <div className="flex gap-2">
                  <input type="color" value={customColorValue} onChange={(e) => { setCustomColorValue(e.target.value); changeFontColor(e.target.value); }} className="w-12 h-10 rounded-lg"/>
                  <input type="text" value={customColorValue} onChange={(e) => { if (/^#[0-9A-F]{6}$/i.test(e.target.value)) { setCustomColorValue(e.target.value); changeFontColor(e.target.value); }}} placeholder="#000000" className="flex-1 px-3 py-2 rounded-lg border"/>
                </div>
              </div>
              </TooltipProvider>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <button onClick={addText} className="w-full mt-4 p-2 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2">
        <Type className="h-4 w-4" />
        Add Text & Close
      </button>
    </motion.div>
  );
};

export default TextPopup;
