"use client";

import  React from "react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { fabric } from "fabric";
import {
  Type,
  ImagePlus,
  Undo,
  Redo,
  Trash2,
  Palette,
  Sparkles,
  Zap,
  Heart,
  Star,
  ChevronDown,
  ImageIcon,
  X,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "../../store/editorStore";
import useBasketStore from "../../store/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "./use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import JSZip from "jszip";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { costEngine } from "@/lib/costEngine";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { ColorSwatches, TempleteLogos } from "@/sanity.types";
import { imageUrl } from "@/lib/imageUrl";

interface TEMPLATE_LOGOS_TYPE {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

// Move constants outside component to prevent recreation
const SHIRT_COLORS = [
  { name: "Pure White", value: "#FFFFFF", gradient: "from-white to-gray-50" },
  {
    name: "Midnight Black",
    value: "#000000",
    gradient: "from-gray-900 to-black",
  },
  {
    name: "Ocean Navy",
    value: "#000080",
    gradient: "from-blue-900 to-navy-800",
  },
  {
    name: "Crimson Red",
    value: "#FF0000",
    gradient: "from-red-500 to-red-700",
  },
  {
    name: "Forest Green",
    value: "#008000",
    gradient: "from-green-500 to-green-700",
  },
  {
    name: "Sunshine Yellow",
    value: "#FFFF00",
    gradient: "from-yellow-400 to-yellow-500",
  },
];

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

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const FONTS = {
  english: [
    "Inter",
    "Roboto",
    "Poppins",
    "Montserrat",
    "Playfair Display",
    "Oswald",
    "Lato",
    "Source Sans Pro",
    "Nunito",
    "Merriweather",
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
  ],
};



// Add MobileControlButton component
const MobileControlButton = ({ icon, label, onClick, active = false }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
      active ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

// Add MobilePanel component
const MobilePanel = ({ onClose, title, children }: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-16 left-0 right-0 bg-background border-t border-border/50 shadow-lg rounded-t-xl overflow-hidden z-40 max-h-[70vh] overflow-y-auto"
  >
    <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <h3 className="font-semibold">{title}</h3>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
        <X className="h-5 w-5" />
      </button>
    </div>
    <div className="p-4">
      {children}
    </div>
  </motion.div>
);

// Memoized Text Input Component
const TextInput = React.memo(({ value, onChange, placeholder, disabled }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-sm"
      placeholder={placeholder}
    />
  );
});
TextInput.displayName = "TextInput";

// Memoized Color Grid Component
const ColorTextGrid = React.memo(({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  loading = {},
  showTooltip = true 
}: {
  colors: Array<{ _id?: string; value?: string; colorHexCode?: any; colorName?: string; ring?: string }>;  selectedColor: string;
  onColorSelect: (color: string, id?: string) => void;
  loading?: { [key: string]: boolean };
  showTooltip?: boolean;
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color) => {
        const colorValue = color.value || "#000000";
        const colorId = color._id;
        const isSelected = selectedColor === colorValue;
        const isLoading = loading[colorId || "#"];
        
        const button = (
          <button
            key={colorId}
            className={`w-full h-10 rounded-lg border-2 transition-all relative ${
              isSelected
                ? color.colorHexCode?.hex ? `ring-2 ${color.colorHexCode?.hex} border-current shadow-lg` : "ring-2 ring-primary/50 border-primary shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
            style={{ backgroundColor: colorValue }}
            onClick={() => onColorSelect(colorValue, colorId)}
            disabled={isLoading}
          >
            {isSelected && (
              <div className="w-full h-full rounded-lg flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    colorValue === "#FFFFFF" ? "bg-gray-800" : "bg-white"
                  }`}
                />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary" />
              </div>
            )}
          </button>
        );

        return showTooltip ? (
          <Tooltip key={colorId}>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{color.colorName}</p>
            </TooltipContent>
          </Tooltip>
        ) : button;
      })}
    </div>
  );
});
ColorTextGrid.displayName = "ColorTextGrid";
const ColorGrid = React.memo(({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  loading = {},
 showTooltip = true,
}: {
  colors: ColorSwatches[];
  selectedColor: string;
  onColorSelect: (color: string, id?: string) => void;
  loading?: { [key: string]: boolean };
  showTooltip?: boolean;
}) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map((color) => {
        const colorValue = color.colorHexCode?.hex || "#000000";
 if (!colorValue) return null; // Skip if colorHexCode.hex is null/undefined
        const colorId = color._id;
        const isSelected = selectedColor === colorValue;
        const isLoading = loading[colorId || "#"];

        
        const button = (
          <button
            key={colorId}
            className={`w-full h-10 rounded-lg border-2 transition-all relative ${
              isSelected
                ? color.colorHexCode?.hex ? `ring-2 ${color.colorHexCode?.hex} border-current shadow-lg` : "ring-2 ring-primary/50 border-primary shadow-lg"
                : "border-border hover:border-primary/50"
            }`}
            style={{ backgroundColor: color.colorHexCode?.hex }}
            onClick={() => onColorSelect(color.colorHexCode?.hex || "#000000", colorId)}
            disabled={isLoading}
          >
            {isSelected && (
              <div className="w-full h-full rounded-lg flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full ${
                    colorValue === "#000000" ? "bg-gray-800" : "bg-white"
                  }`}
                />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary" />
              </div>
            )}
          </button>
        );

        return showTooltip ? (
          <Tooltip key={colorId}>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{color.colorName}</p>
            </TooltipContent>
          </Tooltip>
        ) : button;
      })}
    </div>
  );
});
ColorGrid.displayName = "ColorGrid";

const LogoGrid = React.memo(({
  logos,
  onLogoSelect,
  loading = {},
  onNextPage,
  onPrevPage,
  currentPage,
  totalPages,
  isLoading
}: {
  logos: TempleteLogos[];
  onLogoSelect: (logoUrl: string, logoId: string) => void;
  loading?: { [key: string]: boolean };
  onNextPage: () => void;
  onPrevPage: () => void;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}) => {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 min-h-[220px]">
        {isLoading && logos.length === 0 ? (
          <div className="col-span-4 flex items-center justify-center">
            <Loader2 className="animate-spin h-6 w-6 text-primary" />
          </div>
        ) : logos.map((logo) => (
          <Tooltip key={logo._id}>
            <TooltipTrigger asChild>
              <button
                className="w-full aspect-square border-2 border-border rounded-lg p-1 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm overflow-hidden relative"
                onClick={() => onLogoSelect(imageUrl(logo.image ||"/placeholder.svg" ).url(), logo._id)}
                disabled={loading[logo._id]}
              >
                <img
                  src={imageUrl(logo.image ||"/placeholder.svg" ).url() || "/placeholder.svg"}
                  alt={logo?.logoName}
                  className="rounded w-full h-full object-cover"
                />
                {loading[logo._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                    <Loader2 className="animate-spin h-3 w-3 text-primary" />
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{logo?.logoName}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <Button onClick={onPrevPage} disabled={currentPage <= 1 || isLoading}>
          Prev
        </Button>
        <span className="text-sm">{`Page ${currentPage} of ${totalPages}`}</span>
        <Button onClick={onNextPage} disabled={currentPage >= totalPages || isLoading}>
          Next
        </Button>
      </div>
    </div>
  );
});
LogoGrid.displayName = "LogoGrid";

export default function Toolbar() {
  const { user } = useUser();
  const { addItem } = useBasketStore();
  const {
    canvas,
    shirtStyle,
    toggleShirtStyle,
    undo,
    redo,
    canUndo,
    canRedo,
    totalCost,
    setShirtImageUrl,
    addHighQualityImage,
    shirtImageUrl,
  } = useEditorStore();

  // Memoize expensive operations
  
  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [selectedFontColor, setSelectedFontColor] = useState("#000000");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [isArabic, setIsArabic] = useState(false);
  const [text, setText] = useState("Your Text Here");
  const [logos, setLogos] = useState<TempleteLogos[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [logosLoading, setLogosLoading] = useState(false);
  const { toast } = useToast();
  const [colorSwatches, setColorSwatches] = useState<ColorSwatches[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<"slimFit" | "oversizedFit" | "boxFit">("slimFit");
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const [templateLogoLoading, setTemplateLogoLoading] = useState<{ [key: string]: boolean }>({});
  const [isUploadingCustomImage, setIsUploadingCustomImage] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);
  const [isLogoPanelOpen, setIsLogoPanelOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Memoize filtered color swatches
  const filteredColorSwatches = useMemo(
    () =>(Array.isArray(colorSwatches)?colorSwatches:[] ).filter((swatch) => swatch.fitStyle === selectedStyle),
    [colorSwatches, selectedStyle]
  );

  // Memoize font options
  const fontOptions = useMemo(
    () => isArabic ? FONTS.arabic : FONTS.english,
    [isArabic]
  );

  const fetchLogos = useCallback(async (page: number) => {
    setLogosLoading(true);
    try {
      const response = await fetch(`/api/admin/logos?page=${page}&limit=10`);
      const data = await response.json();
      setLogos(data.logos);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      toast({
        title: "Error fetching logos",
        description: "Could not fetch logos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLogosLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetchingInitialData(true);
      try {
        const swatchesRes = await fetch("/api/admin/color-swatches");
        const swatchesData = await swatchesRes.json();
        setColorSwatches(swatchesData);
        await fetchLogos(1);
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Unable to load initial design assets. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchInitialData();
  }, [fetchLogos, toast]);

  // Cost calculation effect - memoized
  useEffect(() => {
    if (canvas) {
      const { totalCost: calculatedTotalCost } = costEngine.calculate(
        canvas.getObjects()
      );
      useEditorStore.getState().setTotalCost(calculatedTotalCost);
    }
  }, [canvas]);

  // Memoized callback functions to prevent unnecessary re-renders
  const addText = useCallback(() => {
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
    if (isMobile) setIsLogoPanelOpen(false);
  }, [canvas, text, selectedFontColor, selectedFont, isMobile]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (PNG, JPG, SVG).",
        variant: "destructive",
      });
      return;
    }

    addHighQualityImage(file);
    setIsUploadingCustomImage(true);
    fabric.Image.fromURL(
      URL.createObjectURL(file),
      (img: any) => {
        img.scaleToWidth(150);
        img.set({
          left: 175,
          top: 175,
          // @ts-ignore
          cost: 5,
          type: "logo",
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setIsUploadingCustomImage(false);
      },
      { crossOrigin: "anonymous" }
    );
  }, [canvas, addHighQualityImage, toast]);

  const addTemplateLogo = useCallback(async (logoUrl: string, logoId: string) => {
    if (!canvas) return;
    setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: true }));
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const fileName = logoUrl.substring(logoUrl.lastIndexOf("/") + 1);
      const file = new File([blob], fileName, { type: blob.type });
      addHighQualityImage(file);

      fabric.Image.fromURL(
        logoUrl,
        (img: any) => {
          img.scaleToWidth(150);
          img.set({
            left: 175,
            top: 175,
            // @ts-ignore
            cost: 3,
            type: "logo",
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: false }));
          if (isMobile) setIsLogoPanelOpen(false);
        },
        { crossOrigin: "anonymous" }
      );
    } catch (error) {
      toast({
        title: "Logo Load Error",
        description: "Failed to load template logo. Please try again.",
        variant: "destructive",
      });
      setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: false }));
    }
  }, [canvas, addHighQualityImage, toast, isMobile]);

  const deleteActiveObject = useCallback(() => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  }, [canvas]);

  const changeFont = useCallback((font: string) => {
    setSelectedFont(font);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      // @ts-ignore
      activeObject.set({ fontFamily: font });
      canvas.renderAll();
    }
  }, [canvas]);

  const changeFontColor = useCallback((color: string) => {
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
  }, [canvas]);

  const updateShirtColor = useCallback((color: string) => {
    setSelectedColor(color);
    if (canvas) {
      canvas.renderAll();
    }
  }, [canvas]);

  const handleColorSwatchSelect = useCallback((color: string, swatchId?: string) => {
    if (!swatchId || imageLoading[swatchId]) return;
    
    setImageLoading((prev) => ({ ...prev, [swatchId]: true }));
    const swatch = colorSwatches.find(s => s._id === swatchId);
    
    if (swatch) {
      const img = new Image();
      img.onload = () => {
        updateShirtColor(color);
        setShirtImageUrl(imageUrl(swatch.image ||"/placeholder.svg" ).url() || "/placeholder.svg");
        setImageLoading((prev) => ({ ...prev, [swatchId]: false }));
      };
      img.onerror = () => {
        toast({
          title: "Image Load Error",
          description: `Failed to load ${swatch.colorName} color`,
          variant: "destructive",
        });
        setImageLoading((prev) => ({ ...prev, [swatchId]: false }));
      };
      img.src = imageUrl(swatch.image ||"/placeholder.svg" ).url() || "/placeholder.svg";
    }
  }, [imageLoading, colorSwatches, updateShirtColor, setShirtImageUrl, toast]);

  // Rest of your component logic (dataURLtoBlob, generateElementImages, etc.) remains the same...
  // [Keep all the existing helper functions as they are]



// Helper functions (add these at the end of the component, before the closing brace)
// These should be memoized or moved outside the component if they don't depend on state

const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const waitForCanvasRender = (canvas: fabric.Canvas): Promise<void> => {
  return new Promise((resolve) => {
    canvas.renderAll();
    requestAnimationFrame(() => {
      setTimeout(resolve, 100);
    });
  });
};

// Move handleAddToBasket function outside or memoize it
const handleAddToBasket = useCallback(async () => {
  if (!selectedSize) {
    toast({
      title: "Size Required",
      description: "Please select a size to continue with your masterpiece.",
      variant: "destructive",
    });
    return;
  }

  if (!canvas) {
    toast({
      title: "Canvas Not Ready",
      description: "Please wait for the design canvas to load completely.",
      variant: "destructive",
    });
    return;
  }

  if (!shirtImageUrl) {
    toast({
      title: "Color Required",
      description: "Please select a T-shirt color to complete your design.",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const canvasDataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    // Generate full design and element images
    const fullDesignBlob = await generateFullDesign(shirtImageUrl, canvas);
    const elementImages = await generateElementImages();

    const zip = new JSZip();
    zip.file("full_design.png", fullDesignBlob);
    zip.file("full_design_transparent.png", dataURLtoBlob(canvasDataUrl));

    if (elementImages.length > 0) {
      const elementsFolder = zip.folder("elements");
      elementImages.forEach((element) => {
        elementsFolder?.file(element.name, element.blob);
      });
    }

    const actualCanvasWidth = canvas.getWidth();
    const actualCanvasHeight = canvas.getHeight();

    const designInfo = {
      id: designId,
      name: `Custom T-Shirt - ${selectedSize} - ${SHIRT_COLORS.find((c) => c.value === selectedColor)?.name || "White"} - ${shirtStyle}`,
      size: selectedSize,
      color: SHIRT_COLORS.find((c) => c.value === selectedColor)?.name || "White",
      colorHex: selectedColor,
      style: shirtStyle,
      font: selectedFont,
      fontColor: selectedFontColor,
      language: isArabic ? "Arabic" : "English",
      elements: canvas.getObjects().length,
      createdAt: new Date().toISOString(),
      canvasData: canvas.toJSON(["cost", "type"]),
      canvasSize: {
        width: actualCanvasWidth,
        height: actualCanvasHeight,
      },
      baseShirtUrl: shirtImageUrl,
    };

    zip.file("design_info.json", JSON.stringify(designInfo, null, 2));
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const slug = `custom-tshirt-${Date.now()}`;
    const fileName = `${slug}.zip`;

    const formData = new FormData();
    formData.append("name", "Custom T-shirt");
    formData.append("price", totalCost.toString());
    formData.append("size", selectedSize);
    formData.append("slug", slug);
    formData.append("file", zipBlob, fileName);
    const fullDesignFile = new File([fullDesignBlob], "product-image.png", {
      type: "image/png",
    });
    formData.append("imageData", fullDesignFile);

    const response = await fetch("/api/custom-product", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to create custom product."
      );
    }

    const newProduct = await response.json();
    addItem(newProduct, selectedSize, 0);

    toast({
      title: "🎉 Masterpiece Created!",
      description: "Your custom T-shirt has been added to your basket.",
    });
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.";
    toast({
      title: "Creation Failed",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
}, [selectedSize, canvas, shirtImageUrl, totalCost, selectedColor, shirtStyle, selectedFont, selectedFontColor, isArabic, addItem, toast]);

const generateElementImages = useCallback(async (): Promise<
  { name: string; blob: Blob }[]
> => {
  if (!canvas) return [];

  const elements: { name: string; blob: Blob }[] = [];
  const objects = canvas.getObjects();

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    try {
      const bounds = obj.getBoundingRect();
      const padding = 20;

      const tempCanvasElement = document.createElement("canvas");
      tempCanvasElement.width = bounds.width + padding * 2;
      tempCanvasElement.height = bounds.height + padding * 2;

      const tempCanvas = new fabric.Canvas(tempCanvasElement, {
        width: bounds.width + padding,
        height: bounds.height + padding,
        backgroundColor: "transparent",
      });

      const clonedObj = await new Promise<fabric.Object>(
        (resolve, reject) => {
          obj.clone((cloned: fabric.Object) => {
            if (cloned) {
              resolve(cloned);
            } else {
              reject(new Error("Failed to clone object"));
            }
          });
        }
      );

      clonedObj.set({
        left: padding,
        top: padding,
      });

      tempCanvas.add(clonedObj);
      await waitForCanvasRender(tempCanvas);

      const dataURL = tempCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
        enableRetinaScaling: false,
      });

      const blob = dataURLtoBlob(dataURL);
      let elementName = `${obj.type || "element"}_${i + 1}`;

      if (obj.type === "i-text" || obj.type === "text") {
        // @ts-ignore
        const textContent = obj.text || "text";
        elementName = `text_${textContent.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}`;
      } else if (obj.type === "image") {
        elementName = `logo_${i + 1}`;
      }

      elements.push({
        name: `${elementName}.png`,
        blob,
      });

      tempCanvas.dispose();
    } catch (error) {
      console.error(`Error processing object ${i}:`, error);
    }
  }

  return elements;
}, [canvas]);

const generateFullDesign = useCallback(async (
  imageUrl: string,
  canvas: fabric.Canvas
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      const tempCanvas = new fabric.StaticCanvas(null, {
        width: canvasWidth,
        height: canvasHeight,
      });

      fabric.Image.fromURL(
        imageUrl,
        (bgImg) => {
          if (!bgImg) {
            reject(new Error("Failed to load background image."));
            return;
          }

          try {
            const imgWidth = bgImg.width || canvasWidth;
            const imgHeight = bgImg.height || canvasHeight;
            const scaleX = canvasWidth / imgWidth;
            const scaleY = canvasHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY);

            tempCanvas.setBackgroundImage(
              bgImg,
              tempCanvas.renderAll.bind(tempCanvas),
              {
                scaleX: scale,
                scaleY: scale,
                left: (canvasWidth - imgWidth * scale) / 2,
                top: (canvasHeight - imgHeight * scale) / 2,
              }
            );

            const objects = canvas.getObjects();
            const clonePromises = objects.map((obj) => {
              return new Promise<fabric.Object>(
                (resolveClone, rejectClone) => {
                  try {
                    obj.clone((cloned: fabric.Object) => {
                      if (cloned) {
                        resolveClone(cloned);
                      } else {
                        rejectClone(new Error("Failed to clone object"));
                      }
                    });
                  } catch (error) {
                    rejectClone(error);
                  }
                }
              );
            });

            Promise.all(clonePromises)
              .then((clonedObjects) => {
                try {
                  clonedObjects.forEach((clonedObj) => {
                    tempCanvas.add(clonedObj);
                  });

                  tempCanvas.renderAll();

                  const dataURL = tempCanvas.toDataURL({
                    format: "png",
                    quality: 1,
                    multiplier: 2,
                    enableRetinaScaling: true,
                  });

                  if (!dataURL || dataURL === "data:,") {
                    throw new Error("Failed to generate canvas image");
                  }

                  const blob = dataURLtoBlob(dataURL);
                  resolve(blob);
                } catch (error) {
                  reject(error);
                }
              })
              .catch(reject);
          } catch (error) {
            reject(error);
          }
        },
        { crossOrigin: "anonymous" }
      );
    } catch (error) {
      reject(error);
    }
  });
}, []);

if (isFetchingInitialData) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full lg:w-80 h-screen bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-r border-border/50 p-6 flex flex-col gap-6 items-center justify-center"
    >
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Preparing Your Canvas
        </p>
        <p className="text-sm text-muted-foreground">
          Loading creative tools...
        </p>
      </div>
    </motion.aside>
  );
}

// Use the memoized components in your JSX
return (
  <TooltipProvider>
 {isMobile ? (
        // MOBILE VERSION - Floating bottom bar + popups
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur border border-border/50 rounded-full px-4 py-2 flex gap-3 shadow-xl">
           <Dialog >
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Zap className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full rounded-xl p-4">
              {/* Style Selection UI */}
              <h2 className="text-lg font-semibold mb-4">Select Style</h2>
        {/* Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Style</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedStyle === "slimFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("slimFit")}
              className="h-10"
            >
              Slim Fit
            </Button>
            <Button
              variant={selectedStyle === "oversizedFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("oversizedFit")}
              className="h-10"
            >
              Oversized
            </Button>
            <Button
              variant={selectedStyle === "boxFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("boxFit")}
              className="h-10"
            >
              Box Fit
            </Button>
          </div>
        </motion.div>
        {/* Color Selection - using memoized ColorGrid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Colors</h2>
          </div>
          <ColorGrid
            colors={filteredColorSwatches}
            selectedColor={selectedColor}
            onColorSelect={handleColorSwatchSelect}
            loading={imageLoading}
          />
        </motion.div>
            </DialogContent>
          </Dialog>

          <Dialog open={isLogoPanelOpen} onOpenChange={setIsLogoPanelOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Palette className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-4">Select/Upload Logo</h2>
              <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-xl h-10">
                <TabsTrigger
                  value="text"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                >
                  <Type className="h-3 w-3 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="logo"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                >
                  <ImagePlus className="h-3 w-3 mr-1" />
                  Logo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="text-input" className="text-sm font-medium">
                      Text Content
                    </Label>
                    <TextInput
                      value={text}
                      onChange={setText}
                      placeholder="Enter your text..."
                      disabled={!shirtImageUrl}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                    <Label htmlFor="language-toggle" className="text-xs font-medium">
                      English
                    </Label>
                    <Switch
                      id="language-toggle"
                      checked={isArabic}
                      onCheckedChange={setIsArabic}
                      className="data-[state=checked]:bg-primary scale-75"
                    />
                    <Label htmlFor="language-toggle" className="text-xs font-medium">
                      العربية
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-select" className="text-sm font-medium">
                      Font Family
                    </Label>
                    <Select value={selectedFont} onValueChange={changeFont}>
                      <SelectTrigger
                        id="font-select"
                        className="rounded-xl border-border bg-background/50 backdrop-blur-sm h-9 text-sm"
                      >
                        <SelectValue placeholder="Choose Font" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-background/95 backdrop-blur-xl">
                        {fontOptions.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}
                            className="rounded-lg text-sm"
                          >
                            <span style={{ fontFamily: font }} className="font-medium">
                              {isArabic ? "عربي" : "Aa"}
                            </span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              {font}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font Color</Label>
                    <ColorTextGrid
                      colors={FONT_COLORS}
                      selectedColor={selectedFontColor}
                      onColorSelect={(color) => changeFontColor(color)}
                    />
                  </div>

                  <Button
                    onClick={addText}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9"
                  >
                    <Type className="mr-2 h-3 w-3" />
                    Add Text to Design
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logo" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={isUploadingCustomImage}
                    className="w-full py-2 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-sm h-9"
                  >
                    {isUploadingCustomImage ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-3 w-3 mr-2" />
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-3 w-3" />
                        Upload Custom Logo
                      </>
                    )}
                  </Button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={uploadInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-3 w-3 text-primary" />
                      Template Logos
                    </Label>
                    <LogoGrid
                      logos={logos}
                      onLogoSelect={addTemplateLogo}
                      loading={templateLogoLoading}
                      onNextPage={() => fetchLogos(currentPage + 1)}
                      onPrevPage={() => fetchLogos(currentPage - 1)}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      isLoading={logosLoading}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Sparkles className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-4">Customize Design</h2>
              <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 flex-shrink-0"
        >
          <Label className="text-sm font-medium">Select Size</Label>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-2 rounded-lg border-2 transition-all ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 p-6 pt-4 border-t border-border/50 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm">
        <SignedIn>
          <Button
            onClick={handleAddToBasket}
            size="lg"
            disabled={isLoading || !selectedSize}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating Masterpiece...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Add to Basket
              </div>
            )}
          </Button>
        </SignedIn>

        <SignedOut>
          <Button className="w-full">
            <SignInButton mode="modal">
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Sign In to Create
              </span>
            </SignInButton>
          </Button>
        </SignedOut>
      </div>
        </motion.div>
            </DialogContent>
          </Dialog>

          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={undo}
              disabled={!canUndo || !shirtImageUrl}
              className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              onClick={redo}
              disabled={!canRedo || !shirtImageUrl}
              className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
            >
              <Redo className="h-3 w-3" />
            </Button>
         
            </div>

        </motion.div>
        <Button
              variant="destructive"
              onClick={deleteActiveObject}
              className="py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50  h-9"
            >
              <Trash2 className="mx-auto h-3 w-3" />
              
            </Button>
        </div>
      ) : (
     <motion.aside
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex lg:w-80 min-w-0 max-w-80 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-r border-border/50 flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
        {/* Header - memoized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2 flex-shrink-0"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Design Studio
          </h1>
          <p className="text-sm text-muted-foreground">
            Unleash your creativity
          </p>
        </motion.div>

        {/* Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Style</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
          <Button
              variant={selectedStyle === "slimFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("slimFit")}
              className="h-10"
            >
              Slim Fit
            </Button>
            <Button
              variant={selectedStyle === "oversizedFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("oversizedFit")}
              className="h-10"
            >
              Oversized
            </Button>
            <Button
              variant={selectedStyle === "boxFit" ? "default" : "outline"}
              onClick={() => setSelectedStyle("boxFit")}
              className="h-10"
            >
              Box Fit
            </Button>
          </div>
        </motion.div>

        {/* Color Selection - using memoized ColorGrid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Colors</h2>
          </div>
          <ColorGrid
            colors={filteredColorSwatches}
            selectedColor={selectedColor}
            onColorSelect={handleColorSwatchSelect}
            loading={imageLoading}
          />
        </motion.div>

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent flex-shrink-0" />

        {/* Customize Section */}
        <fieldset disabled={!shirtImageUrl} className="space-y-6 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">
                Customize
              </h2>
            </div>

            {!shirtImageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-muted/50 border border-dashed border-muted-foreground/30"
              >
                <p className="text-sm text-muted-foreground text-center">
                  Select a color above to start designing
                </p>
              </motion.div>
            )}

            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-xl h-10">
                <TabsTrigger
                  value="text"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                >
                  <Type className="h-3 w-3 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="logo"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs"
                >
                  <ImagePlus className="h-3 w-3 mr-1" />
                  Logo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="text-input" className="text-sm font-medium">
                      Text Content
                    </Label>
                    <TextInput
                      value={text}
                      onChange={setText}
                      placeholder="Enter your text..."
                      disabled={!shirtImageUrl}
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                    <Label htmlFor="language-toggle" className="text-xs font-medium">
                      English
                    </Label>
                    <Switch
                      id="language-toggle"
                      checked={isArabic}
                      onCheckedChange={setIsArabic}
                      className="data-[state=checked]:bg-primary scale-75"
                    />
                    <Label htmlFor="language-toggle" className="text-xs font-medium">
                      العربية
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-select" className="text-sm font-medium">
                      Font Family
                    </Label>
                    <Select value={selectedFont} onValueChange={changeFont}>
                      <SelectTrigger
                        id="font-select"
                        className="rounded-xl border-border bg-background/50 backdrop-blur-sm h-9 text-sm"
                      >
                        <SelectValue placeholder="Choose Font" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-background/95 backdrop-blur-xl">
                        {fontOptions.map((font) => (
                          <SelectItem
                            key={font}
                            value={font}
                            className="rounded-lg text-sm"
                          >
                            <span style={{ fontFamily: font }} className="font-medium">
                              {isArabic ? "عربي" : "Aa"}
                            </span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              {font}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font Color</Label>
                    <ColorTextGrid
                      colors={FONT_COLORS}
                      selectedColor={selectedFontColor}
                      onColorSelect={(color) => changeFontColor(color)}
                    />
                  </div>

                  <Button
                    onClick={addText}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9"
                  >
                    <Type className="mr-2 h-3 w-3" />
                    Add Text to Design
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logo" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={isUploadingCustomImage}
                    className="w-full py-2 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-sm h-9"
                  >
                    {isUploadingCustomImage ? (
                      <div className="flex items-center">
                        <Loader2 className="animate-spin h-3 w-3 mr-2" />
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="mr-2 h-3 w-3" />
                        Upload Custom Logo
                      </>
                    )}
                  </Button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={uploadInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-3 w-3 text-primary" />
                      Template Logos
                    </Label>
                    <LogoGrid
                      logos={logos}
                      onLogoSelect={addTemplateLogo}
                      loading={templateLogoLoading}
                      onNextPage={() => fetchLogos(currentPage + 1)}
                      onPrevPage={() => fetchLogos(currentPage - 1)}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      isLoading={logosLoading}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              variant="destructive"
              onClick={deleteActiveObject}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9"
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Delete Selected
            </Button>
          </motion.div>
        </fieldset>

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent flex-shrink-0" />

        {/* History Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 flex-shrink-0"
        >
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">History</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={undo}
              disabled={!canUndo || !shirtImageUrl}
              className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              onClick={redo}
              disabled={!canRedo || !shirtImageUrl}
              className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent flex-shrink-0" />

        {/* Size Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 flex-shrink-0"
        >
          <Label className="text-sm font-medium">Select Size</Label>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-2 rounded-lg border-2 transition-all ${
                  selectedSize === size
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Action Button */}
      <div className="flex-shrink-0 p-6 pt-4 border-t border-border/50 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm">
        <SignedIn>
          <Button
            onClick={handleAddToBasket}
            size="lg"
            disabled={isLoading || !selectedSize}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating Masterpiece...
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Add to Basket
              </div>
            )}
          </Button>
        </SignedIn>

        <SignedOut>
          <Button className="w-full">
            <SignInButton mode="modal">
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Sign In to Create
              </span>
            </SignInButton>
          </Button>
        </SignedOut>
      </div>
    </motion.aside>
      )}
  </TooltipProvider>
);
}