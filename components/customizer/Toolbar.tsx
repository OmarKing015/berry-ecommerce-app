"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
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
import { ChevronDown, ImageIcon } from "lucide-react";

interface TEMPLATE_LOGOS_TYPE {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

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

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  style: "slim" | "oversized";
}

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

  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedFontColor, setSelectedFontColor] = useState("#000000");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [isArabic, setIsArabic] = useState(false);
  const [text, setText] = useState("Your Text Here");
  const [logos, setLogos] = useState<TEMPLATE_LOGOS_TYPE[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<"slim" | "oversized">(
    "slim"
  );
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [templateLogoLoading, setTemplateLogoLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [isUploadingCustomImage, setIsUploadingCustomImage] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);

  // Add this state for popover controls
  const [logoPopoverOpen, setLogoPopoverOpen] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [customColorValue, setCustomColorValue] = useState("#000000");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [swatchesRes, logosRes] = await Promise.all([
          fetch("/api/admin/color-swatches"),
          fetch("/api/admin/logos"),
        ]);
        const swatchesData = await swatchesRes.json();
        const logoData = await logosRes.json();
        setColorSwatches(swatchesData);
        setLogos(logoData);
      } catch (error) {
        toast({
          title: "Connection Error",
          description:
            "Unable to load design assets. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredColorSwatches = colorSwatches.filter(
    (swatch) => swatch.style === selectedStyle
  );

  useEffect(() => {
    if (canvas) {
      const { totalCost: calculatedTotalCost } = costEngine.calculate(
        canvas.getObjects()
      );
      useEditorStore.getState().setTotalCost(calculatedTotalCost);
    }
  }, [canvas]);

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
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const addTemplateLogo = async (logoUrl: string, logoId: string) => {
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
  };

  const deleteActiveObject = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
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

  const updateShirtColor = (color: string) => {
    setSelectedColor(color);
    if (canvas) {
      canvas.renderAll();
    }
  };

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
  // Helper function to generate individual element images
  const generateElementImages = async (): Promise<
    { name: string; blob: Blob }[]
  > => {
    if (!canvas) return [];

    const elements: { name: string; blob: Blob }[] = [];
    const objects = canvas.getObjects();
    console.log(`Found ${objects.length} objects on canvas`);

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      console.log(`Processing object ${i}:`, obj.type, obj);

      try {
        // Get object bounds
        const bounds = obj.getBoundingRect();
        const padding = 20; // Add some padding around the object

        // Create a temporary canvas with proper dimensions
        const tempCanvasElement = document.createElement("canvas");
        tempCanvasElement.width = bounds.width + padding * 2;
        tempCanvasElement.height = bounds.height + padding * 2;

        const tempCanvas = new fabric.Canvas(tempCanvasElement, {
          width: bounds.width + padding,
          height: bounds.height + padding,
          backgroundColor: "transparent",
        });

        // Clone the object
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

        // Position the cloned object in the center of the temp canvas
        clonedObj.set({
          left: padding,
          top: padding,
        });

        // Add the object to temp canvas
        tempCanvas.add(clonedObj);

        // Wait for rendering to complete
        await waitForCanvasRender(tempCanvas);

        // Generate image with white background for better visibility
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2, // Higher resolution
          enableRetinaScaling: false,
        });

        console.log(
          `Generated dataURL for object ${i}:`,
          dataURL.substring(0, 100) + "..."
        );

        const blob = dataURLtoBlob(dataURL);

        // @ts-ignore
        const elementType = obj.type || "element";
        let elementName = `${elementType}_${i + 1}`;

        // For text objects, use the actual text as name
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

        // Clean up temp canvas
        tempCanvas.dispose();
      } catch (error) {
        console.error(`Error processing object ${i}:`, error);
      }
    }

    console.log(`Generated ${elements.length} element images`);
    return elements;
  };
  const generateFullDesign = async (
    imageUrl: string,
    canvas: fabric.Canvas
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Get the actual canvas dimensions from the user's canvas
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // Use the same dimensions as the user's canvas for consistency
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
              // Get the actual image dimensions
              const imgWidth = bgImg.width || canvasWidth;
              const imgHeight = bgImg.height || canvasHeight;

              // Calculate scale to fit the canvas while maintaining aspect ratio
              const scaleX = canvasWidth / imgWidth;
              const scaleY = canvasHeight / imgHeight;

              // Use the smaller scale to ensure the entire image fits
              const scale = Math.min(scaleX, scaleY);

              tempCanvas.setBackgroundImage(
                bgImg,
                tempCanvas.renderAll.bind(tempCanvas),
                {
                  scaleX: scale,
                  scaleY: scale,
                  // Center the image if it doesn't fill the entire canvas
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

                    // Generate image with higher quality but maintain actual canvas proportions
                    const dataURL = tempCanvas.toDataURL({
                      format: "png",
                      quality: 1,
                      multiplier: 2, // This creates a 2x resolution image for better quality
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
  };

  // Also update the design info to reflect actual canvas dimensions
  const handleAddToBasket = async () => {
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

      // Get actual canvas dimensions for the design info
      const actualCanvasWidth = canvas.getWidth();
      const actualCanvasHeight = canvas.getHeight();

      const designInfo = {
        id: designId,
        name: `Custom T-Shirt - ${selectedSize} - ${SHIRT_COLORS.find((c) => c.value === selectedColor)?.name || "White"} - ${shirtStyle}`,
        size: selectedSize,
        color:
          SHIRT_COLORS.find((c) => c.value === selectedColor)?.name || "White",
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
  };
  if (isFetchingInitialData) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 h-full bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-r border-border/50 p-6 flex flex-col gap-6 items-center justify-center"
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

  return (
    <TooltipProvider>
      <motion.aside
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full lg:w-80 min-w-0 max-w-80 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-r border-border/50 flex flex-col overflow-hidden"
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
          {/* Header */}
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
                variant={selectedStyle === "slim" ? "default" : "outline"}
                onClick={() => setSelectedStyle("slim")}
                className="relative overflow-hidden group transition-all duration-300 h-10"
              >
                <span className="relative z-10">Slim Fit</span>
                {selectedStyle === "slim" && (
                  <motion.div
                    layoutId="style-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
              <Button
                variant={selectedStyle === "oversized" ? "default" : "outline"}
                onClick={() => setSelectedStyle("oversized")}
                className="relative overflow-hidden group transition-all duration-300 h-10"
              >
                <span className="relative z-10">Oversized</span>
                {selectedStyle === "oversized" && (
                  <motion.div
                    layoutId="style-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            </div>
          </motion.div>

          {/* Color Selection */}
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
            <div className="flex grid-cols-4 gap-3">
              <AnimatePresence mode="wait">
                {filteredColorSwatches.map((swatch, index) => (
                  <motion.div
                    key={swatch._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                            selectedColor === swatch.hexCode
                              ? "ring-4 ring-primary/50 border-primary shadow-lg shadow-primary/25"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                          style={{ backgroundColor: swatch.hexCode }}
                          onClick={() => {
                            if (imageLoading[swatch._id]) return;
                            setImageLoading((prev) => ({
                              ...prev,
                              [swatch._id]: true,
                            }));
                            const img = new Image();
                            img.onload = () => {
                              updateShirtColor(swatch.hexCode);
                              setShirtImageUrl(swatch.imageUrl);
                              setImageLoading((prev) => ({
                                ...prev,
                                [swatch._id]: false,
                              }));
                            };
                            img.onerror = () => {
                              toast({
                                title: "Image Load Error",
                                description: `Failed to load ${swatch.name} color`,
                                variant: "destructive",
                              });
                              setImageLoading((prev) => ({
                                ...prev,
                                [swatch._id]: false,
                              }));
                            };
                            img.src = swatch.imageUrl;
                          }}
                          disabled={imageLoading[swatch._id]}
                        >
                          {selectedColor === swatch.hexCode && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full rounded-xl flex items-center justify-center"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  swatch.hexCode === "#FFFFFF"
                                    ? "bg-gray-800"
                                    : "bg-white"
                                }`}
                              />
                            </motion.div>
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="font-medium">{swatch.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    {imageLoading[swatch._id] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent flex-shrink-0" />

          {/* Customize Section */}
          <fieldset
            disabled={!shirtImageUrl}
            className="space-y-6 flex-shrink-0"
          >
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
                    Select a color above to start designing your masterpiece
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
                      <Label
                        htmlFor="text-input"
                        className="text-sm font-medium"
                      >
                        Text Content
                      </Label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        id="text-input"
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-sm"
                        placeholder="Enter your creative text..."
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30">
                      <Label
                        htmlFor="language-toggle"
                        className="text-xs font-medium"
                      >
                        English
                      </Label>
                      <Switch
                        id="language-toggle"
                        checked={isArabic}
                        onCheckedChange={setIsArabic}
                        className="data-[state=checked]:bg-primary scale-75"
                      />
                      <Label
                        htmlFor="language-toggle"
                        className="text-xs font-medium"
                      >
                        العربية
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="font-select"
                        className="text-sm font-medium"
                      >
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
                          {(isArabic ? FONTS.arabic : FONTS.english).map(
                            (font) => (
                              <SelectItem
                                key={font}
                                value={font}
                                className="rounded-lg text-sm"
                              >
                                <span
                                  style={{ fontFamily: font }}
                                  className="font-medium"
                                >
                                  {isArabic ? "عربي" : "Aa"}
                                </span>
                                <span className="ml-2 text-muted-foreground text-xs">
                                  {font}
                                </span>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Enhanced Font Color Picker with Popover */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Font Color</Label>
                      <Popover
                        open={colorPopoverOpen}
                        onOpenChange={setColorPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between rounded-xl border-border bg-background/50 backdrop-blur-sm h-10 px-3"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded border border-border"
                                style={{ backgroundColor: selectedFontColor }}
                              />
                              <span className="text-sm">
                                {FONT_COLORS.find(
                                  (c) => c.value === selectedFontColor
                                )?.name || "Custom"}
                              </span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-4 rounded-xl border-border bg-background/95 backdrop-blur-xl">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Preset Colors
                              </Label>
                              <div className="grid grid-cols-4 gap-2">
                                {FONT_COLORS.map((color, index) => (
                                  <Tooltip key={color.value}>
                                    <TooltipTrigger asChild>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all duration-300 ${
                                          selectedFontColor === color.value
                                            ? `ring-2 ${color.ring} border-current shadow-lg`
                                            : "border-border hover:border-primary/50"
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => {
                                          changeFontColor(color.value);
                                          setCustomColorValue(color.value);
                                          setColorPopoverOpen(false);
                                        }}
                                      >
                                        {selectedFontColor === color.value && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-full h-full rounded-lg flex items-center justify-center"
                                          >
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                color.value === "#FFFFFF"
                                                  ? "bg-gray-800"
                                                  : "bg-white"
                                              }`}
                                            />
                                          </motion.div>
                                        )}
                                      </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">
                                        {color.name}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Custom Color
                              </Label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={customColorValue}
                                  onChange={(e) => {
                                    setCustomColorValue(e.target.value);
                                    changeFontColor(e.target.value);
                                  }}
                                  className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                                />
                                <input
                                  type="text"
                                  value={customColorValue}
                                  onChange={(e) => {
                                    if (
                                      /^#[0-9A-F]{6}$/i.test(e.target.value) ||
                                      e.target.value === ""
                                    ) {
                                      setCustomColorValue(e.target.value);
                                      if (
                                        /^#[0-9A-F]{6}$/i.test(e.target.value)
                                      ) {
                                        changeFontColor(e.target.value);
                                      }
                                    }
                                  }}
                                  placeholder="#000000"
                                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background/50 text-sm font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={addText}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9"
                      >
                        <Type className="mr-2 h-3 w-3" />
                        Add Text to Design
                      </Button>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
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
                    </motion.div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={uploadInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Enhanced Template Logos with Popover */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Star className="h-3 w-3 text-primary" />
                        Template Logos
                      </Label>

                      <Popover
                        open={logoPopoverOpen}
                        onOpenChange={setLogoPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between rounded-xl border-border bg-background/50 backdrop-blur-sm h-10 px-3"
                          >
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4" />
                              <span className="text-sm">
                                Choose Template Logo
                              </span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 rounded-xl border-border bg-background/95 backdrop-blur-xl">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                              <Star className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold text-sm">
                                Select a Logo Template
                              </h3>
                            </div>

                            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                              {logos?.map((logo, index) => (
                                <motion.div
                                  key={logo._id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="relative group"
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full aspect-square border-2 border-border rounded-lg p-1 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-background/50 backdrop-blur-sm overflow-hidden"
                                        onClick={() => {
                                          addTemplateLogo(
                                            logo.imageUrl,
                                            logo._id
                                          );
                                          setLogoPopoverOpen(false);
                                        }}
                                        disabled={templateLogoLoading[logo._id]}
                                      >
                                        <img
                                          src={
                                            logo.imageUrl || "/placeholder.svg"
                                          }
                                          alt={logo.name}
                                          className=" rounded"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.src = "/placeholder.svg";
                                          }}
                                        />
                                      </motion.button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">{logo.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  {templateLogoLoading[logo._id] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                                      <Loader2 className="animate-spin h-3 w-3 text-primary" />
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>

                            {logos?.length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  No template logos available
                                </p>
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </TabsContent>
                {/* <TabsContent value="logo" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                    </motion.div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={uploadInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />


                  </div>
                </TabsContent> */}
              </Tabs>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="destructive"
                  onClick={deleteActiveObject}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-9"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete Selected
                </Button>
              </motion.div>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={undo}
                      disabled={!canUndo || !shirtImageUrl}
                      className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
                    >
                      <Undo className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo Last Action</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={redo}
                      disabled={!canRedo || !shirtImageUrl}
                      className="w-full py-2 rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50 bg-transparent h-9"
                    >
                      <Redo className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo Last Action</p>
                </TooltipContent>
              </Tooltip>
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
            <div className="flex-col grid-cols-3 gap-2 min-h-[2.5rem]">
              <RadioGroup
                value={selectedSize ?? ""}
                onValueChange={setSelectedSize}
                className="contents"
              >
                {SIZES.map((size, index) => (
                  <motion.div
                    key={size}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="contents"
                  >
                    <RadioGroupItem
                      value={size}
                      id={`size-${size}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className={`cursor-pointer rounded-lg border-2 transition-all duration-300 flex items-center justify-center py-2 text-sm font-semibold hover:scale-105 min-h-[2.5rem] ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {size}
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>
          </motion.div>
        </div>

        {/* Fixed Bottom Action Button */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-border/50 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm">
          <SignedIn>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleAddToBasket}
                size="lg"
                disabled={isLoading || !selectedSize}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-500 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-12"
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
            </motion.div>
          </SignedIn>

          <SignedOut>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-semibold h-12">
                <SignInButton mode="modal">
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Sign In to Create
                  </span>
                </SignInButton>
              </Button>
            </motion.div>
          </SignedOut>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
