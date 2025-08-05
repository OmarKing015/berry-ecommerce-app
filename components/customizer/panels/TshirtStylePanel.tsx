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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Ruler } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEditorStore } from "@/store/editorStore";
import { Separator } from "@/components/ui/separator";

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SHIRT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#000080" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
];

interface TshirtStylePanelProps {
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export default function TshirtStylePanel({
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
}: TshirtStylePanelProps) {
  const { shirtStyle, toggleShirtStyle, canvas } = useEditorStore();

  const updateShirtColor = (color: string) => {
    setSelectedColor(color);
    if (canvas) {
      // The background color is set on the main canvas component
      // when rendering the t-shirt image.
      // We just need to trigger a re-render.
      canvas.renderAll();
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
          <Ruler /> T-Shirt Style
        </h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="shirt-style-toggle">Slim Fit</Label>
          <Switch
            id="shirt-style-toggle"
            checked={shirtStyle === "oversized"}
            onCheckedChange={toggleShirtStyle}
          />
          <Label htmlFor="shirt-style-toggle">Oversized</Label>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-sm text-muted-foreground">Size</h2>
        <RadioGroup
          value={selectedSize}
          onValueChange={setSelectedSize}
          className="flex flex-wrap gap-2"
        >
          {SHIRT_SIZES.map((size) => (
            <div key={size} className="flex items-center space-x-1">
              <RadioGroupItem value={size} id={`size-${size}`} />
              <Label htmlFor={`size-${size}`}>{size}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-sm text-muted-foreground">Color</h2>
        <div className="flex flex-wrap gap-2">
          {SHIRT_COLORS.map((color) => (
            <Tooltip key={color.value}>
              <TooltipTrigger asChild>
                <button
                  className={`w-8 h-8 rounded-full border ${
                    selectedColor === color.value ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => updateShirtColor(color.value)}
                >
                  {selectedColor === color.value && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
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
      </div>
    </TooltipProvider>
  );
}
