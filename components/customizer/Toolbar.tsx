"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { fabric } from "fabric";
import { Type, ImagePlus, Undo, Redo, Trash2, Palette } from "lucide-react";
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
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug";
import { useAppContext } from "@/context/context";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { costEngine } from "@/lib/costEngine";
import { Loader2 } from "lucide-react";

interface TEMPLATE_LOGOS_TYPE {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

const SHIRT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#000080" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
];

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

const SIZES = ["S", "M", "L", "XL", "XXL"];
const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const FONTS = {
  english: [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Oswald",
    "Playfair Display",
    "Merriweather",
    "Source Sans Pro",
    "Nunito",
    "Poppins",
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
  const {} = useAppContext();
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [selectedFontColor, setSelectedFontColor] = useState("#000000");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [isArabic, setIsArabic] = useState(false);
  const [text, setText] = useState("English");
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
          title: "Error",
          description: "Failed to fetch data",
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
      const { totalCost: calculatedTotalCost } =
        costEngine.calculate(canvas.getObjects());
      useEditorStore.getState().setTotalCost(calculatedTotalCost);
    }
  }, [canvas]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Preserve the high-quality image
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
        // Fetch the image and convert it to a File object to preserve it
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const fileName = logoUrl.substring(logoUrl.lastIndexOf('/') + 1);
        const file = new File([blob], fileName, { type: blob.type });
        addHighQualityImage(file);

        // Now, add the image to the canvas
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
            title: "Error",
            description: "Failed to load template logo.",
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

  //update shirt color
  const updateShirtColor = (color: string) => {
    setSelectedColor(color);
    if (canvas) {
      canvas.renderAll();
    }
  };

  // Helper function to convert data URL to blob
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

  // Helper function to wait for canvas rendering
  const waitForCanvasRender = (canvas: fabric.Canvas): Promise<void> => {
    return new Promise((resolve) => {
      canvas.renderAll();
      // Use requestAnimationFrame to ensure rendering is complete
      requestAnimationFrame(() => {
        setTimeout(resolve, 100); // Additional small delay to ensure complete rendering
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

  // Helper function to generate the full design with background
  const generateFullDesign = async (
    imageUrl: string,
    canvas: fabric.Canvas
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const tempCanvas = new fabric.StaticCanvas(null, {
        width: canvas.width,
        height: canvas.height,
      });

      fabric.Image.fromURL(
        imageUrl,
        (bgImg) => {
          if (!bgImg) {
            reject(new Error("Failed to load background image."));
            return;
          }
          tempCanvas.setBackgroundImage(
            bgImg,
            tempCanvas.renderAll.bind(tempCanvas),
            {
              scaleX: tempCanvas._objects[0].width! / bgImg.width!,
              scaleY: tempCanvas._objects[0].height! / bgImg.height!,
            }
          );

          const objects = canvas.getObjects();
          const clonePromises = objects.map((obj) => {
            return new Promise<fabric.Object>((resolveClone) => {
              obj.clone(resolveClone);
            });
          });

          Promise.all(clonePromises).then((clonedObjects) => {
            clonedObjects.forEach((clonedObj) => {
              tempCanvas.add(clonedObj);
            });
            tempCanvas.renderAll();

            const dataURL = tempCanvas.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 2,
            });
            const blob = dataURLtoBlob(dataURL);
            resolve(blob);
          });
        },
        { crossOrigin: "anonymous" }
      );
    });
  };

  const handleAddToBasket = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "You must select a size before adding to the basket.",
        variant: "destructive",
      });
      return;
    }
    if (!canvas) {
      toast({
        title: "Editor not ready",
        description: "The design canvas is not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }
    if (!shirtImageUrl) {
      toast({
        title: "Please select a T-shirt color",
        description: "You must select a T-shirt color before adding to the basket.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate a transparent background data URL of the canvas content
      const canvasDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // for higher resolution
      });

      // Generate the full design with background
      const fullDesignBlob = await generateFullDesign(shirtImageUrl, canvas);

      // Generate individual element images
      const elementImages = await generateElementImages();

      // Create ZIP file
      const zip = new JSZip();
      zip.file("full_design.png", fullDesignBlob);
      zip.file("full_design_transparent.png", dataURLtoBlob(canvasDataUrl));

      if (elementImages.length > 0) {
        const elementsFolder = zip.folder("elements");
        elementImages.forEach((element) => {
          elementsFolder?.file(element.name, element.blob);
        });
      }

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
          width: canvas.width,
          height: canvas.height,
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
      // Also send the canvas image for the product preview
      formData.append("imageData", canvasDataUrl);

      const response = await fetch('/api/custom-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create custom product.");
      }

      const newProduct = await response.json();
      addItem(newProduct, selectedSize, 0); // Assuming extraCost is 0

      toast({
        title: "Success!",
        description: "Custom T-shirt added to your basket.",
      });

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Failed to add to basket",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (isFetchingInitialData) {
    return (
      <aside className="w-full lg:w-72 bg-card border-r p-4 flex flex-col gap-6 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading design options...</p>
      </aside>
    );
  }

  return (
    <TooltipProvider>
      <aside className="w-full lg:w-72 bg-card border-r p-4 flex flex-col gap-6">
        {/* Color Selection */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-muted-foreground">Color</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedStyle === "slim" ? "default" : "outline"}
              onClick={() => setSelectedStyle("slim")}
            >
              Slim
            </Button>
            <Button
              variant={selectedStyle === "oversized" ? "default" : "outline"}
              onClick={() => setSelectedStyle("oversized")}
            >
              Oversized
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredColorSwatches.map((swatch) => (
              <div key={swatch._id} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === swatch.hexCode
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      style={{ backgroundColor: swatch.hexCode }}
                      onClick={() => {
                        if (imageLoading[swatch._id]) return; // Prevent click if image is loading
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
                            title: "Error",
                            description: `Failed to load image for color ${swatch.name}`,
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
                        <div className="w-full h-full rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{swatch.name}</p>
                  </TooltipContent>
                </Tooltip>
                {imageLoading[swatch._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-full">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <Separator />
        {/* Customize */}
        <fieldset disabled={!shirtImageUrl} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Palette /> Customize
            </h2>
            {!shirtImageUrl && (
              <p className="text-sm text-muted-foreground">
                Please select a color to start designing.
              </p>
            )}
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-4">
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
                  {/* Font Color Selection */}
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
                                    color.value === "#FFFFFF"
                                      ? "bg-black"
                                      : "bg-white"
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
              </TabsContent>
              <TabsContent value="logo" className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => uploadInputRef.current?.click()}
                    disabled={isUploadingCustomImage}
                  >
                    {isUploadingCustomImage ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />{" "}
                        Uploading...
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="mr-2" /> Upload Custom Logo
                      </>
                    )}
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={uploadInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <Label className="mt-4">Template Logos</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {logos?.map((logo) => (
                      <div key={logo._id} className="relative">
                        <button
                          className="border rounded p-2 hover:bg-accent flex items-center justify-center"
                          onClick={() =>
                            addTemplateLogo(logo.imageUrl, logo._id)
                          }
                          disabled={templateLogoLoading[logo._id]}
                        >
                          <img
                            src={logo.imageUrl || "/placeholder.svg"}
                            alt={logo.name}
                            className="w-full h-auto"
                          />
                        </button>
                        {templateLogoLoading[logo._id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <Button variant="destructive" onClick={deleteActiveObject}>
              <Trash2 className="mr-2" /> Delete Selected
            </Button>
          </div>
          <Separator />
          {/* History */}
          <div className="flex-grow flex flex-col gap-4">
            <h2 className="font-semibold text-sm text-muted-foreground">
              History
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={undo}
                    disabled={!canUndo || !shirtImageUrl}
                  >
                    <Undo />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={redo}
                    disabled={!canRedo || !shirtImageUrl}
                  >
                    <Redo />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </fieldset>
        <Separator />
        {/* Actions */}
        <div className="flex flex-col gap-4">
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
          <SignedIn>
            <Button onClick={handleAddToBasket} size="lg" disabled={isLoading || !selectedSize}>
              {isLoading ? "Adding..." : "Add to Basket"}
            </Button>
          </SignedIn>
          <SignedOut>
            <Button>
              {" "}
              <SignInButton mode="modal" />
            </Button>
          </SignedOut>
        </div>
      </aside>
    </TooltipProvider>
  );
}
