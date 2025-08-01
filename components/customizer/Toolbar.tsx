"use client"
import type React from "react"
import { useRef, useState, useEffect } from "react"
import { fabric } from "fabric"
import { Type, ImagePlus, Undo, Redo, Trash2, Palette, Ruler } from "lucide-react"
import { useEditorStore } from "../../store/editorStore"
import useBasketStore from "../../store/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "./use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import JSZip from "jszip"
import { getProductBySlug } from "@/sanity/lib/products/getProductBySlug"
import { useAppContext } from "@/context/context"
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { costEngine } from "@/lib/costEngine"

interface TEMPLATE_LOGOS_TYPE{
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

const TEMPLATE_LOGOS = [
  { name: "Logo 1", url: "/logos/logo1.png" },
  { name: "Logo 2", url: "/logos/logo2.png" },
  { name: "Logo 3", url: "/logos/logo3.png" },
  { name: "Logo 4", url: "/logos/logo4.png" },
  { name: "Logo 5", url: "/logos/logo5.png" },
  { name: "Logo 6", url: "/logos/logo6.png" },
]

const SHIRT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#000080" },
  { name: "Red", value: "#FF0000" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
]

const FONT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#008000" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
  { name: "Orange", value: "#FFA500" },
]

const SHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]

const FONTS = {
  english: ["Inter", "Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia"],
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
}

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  style: "slim" | "oversized";
}

export default function Toolbar() {
  const { user } = useUser()
  const { addItem } = useBasketStore()
  const { canvas, shirtStyle, toggleShirtStyle, undo, redo, canUndo, canRedo, totalCost, setShirtImageUrl } = useEditorStore()
  const { setAssetId, setExtraCost, extraCost,setZipedFile } = useAppContext()
  const [selectedFont, setSelectedFont] = useState("Inter")
  const [selectedFontColor, setSelectedFontColor] = useState("#000000")
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [isArabic, setIsArabic] = useState(false)
  const [text, setText] = useState("English")
  const [logos, setLogos] = useState<TEMPLATE_LOGOS_TYPE[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<"slim" | "oversized">("slim");

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
      }
    };
    fetchData();
  }, [toast]);

  const filteredColorSwatches = colorSwatches.filter(
    (swatch) => swatch.style === selectedStyle
  );
  
  useEffect(() => {
    if (canvas) {
      const { totalCost: calculatedTotalCost, extraCost: calculatedExtraCost } = costEngine.calculate(
        canvas.getObjects(),
      )
      useEditorStore.getState().setTotalCost(calculatedTotalCost)
      setExtraCost(calculatedExtraCost)
    }
  }, [canvas, setExtraCost])

  const addText = () => {
    if (!canvas) return

    const textObject = new fabric.IText(text || "Type here", {
      left: 150,
      top: 200,
      fill: selectedFontColor,
      fontFamily: selectedFont,
      // @ts-ignore
      cost: text.length * 0.1,
      type: "text",
    })

    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return

    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    fabric.Image.fromURL(URL.createObjectURL(file), (img: any) => {
      img.scaleToWidth(150)
      img.set({
        left: 175,
        top: 175,
        // @ts-ignore
        cost: 5,
        type: "logo",
      })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    }, { crossOrigin: "anonymous" })
  }

  const addTemplateLogo = (logoUrl: string) => {
    if (!canvas) return

    fabric.Image.fromURL(logoUrl, (img: any) => {
      img.scaleToWidth(150)
      img.set({
        left: 175,
        top: 175,
        // @ts-ignore
        cost: 3,
        type: "logo",
      })
      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    })
  }

  const deleteActiveObject = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }

  const changeFont = (font: string) => {
    setSelectedFont(font)
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && activeObject.type === "i-text") {
      // @ts-ignore
      activeObject.set({ fontFamily: font })
      canvas.renderAll()
    }
  }

  const changeFontColor = (color: string) => {
    setSelectedFontColor(color)
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject && (activeObject.type === "i-text" || activeObject.type === "text")) {
      // @ts-ignore
      activeObject.set({ fill: color })
      canvas.renderAll()
    }
  }

  //update shirt color
  const updateShirtColor = (color: string) => {
    setSelectedColor(color)
    if (canvas) {
      canvas.renderAll()
    }
  }

  // Helper function to convert data URL to blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",")
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }

  // Helper function to wait for canvas rendering
  const waitForCanvasRender = (canvas: fabric.Canvas): Promise<void> => {
    return new Promise((resolve) => {
      canvas.renderAll()
      // Use requestAnimationFrame to ensure rendering is complete
      requestAnimationFrame(() => {
        setTimeout(resolve, 100) // Additional small delay to ensure complete rendering
      })
    })
  }

  // Helper function to generate individual element images
  const generateElementImages = async (): Promise<{ name: string; blob: Blob }[]> => {
    if (!canvas) return []

    const elements: { name: string; blob: Blob }[] = []
    const objects = canvas.getObjects()
    console.log(`Found ${objects.length} objects on canvas`)

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i]
      console.log(`Processing object ${i}:`, obj.type, obj)

      try {
        // Get object bounds
        const bounds = obj.getBoundingRect()
        const padding = 20 // Add some padding around the object

        // Create a temporary canvas with proper dimensions
        const tempCanvasElement = document.createElement("canvas")
        tempCanvasElement.width = bounds.width + padding * 2
        tempCanvasElement.height = bounds.height + padding * 2

        const tempCanvas = new fabric.Canvas(tempCanvasElement, {
          width: bounds.width + padding,
          height: bounds.height + padding,
          backgroundColor: "transparent",
        })

        // Clone the object
        const clonedObj = await new Promise<fabric.Object>((resolve, reject) => {
          obj.clone((cloned: fabric.Object) => {
            if (cloned) {
              resolve(cloned)
            } else {
              reject(new Error("Failed to clone object"))
            }
          })
        })

        // Position the cloned object in the center of the temp canvas
        clonedObj.set({
          left: padding,
          top: padding,
        })

        // Add the object to temp canvas
        tempCanvas.add(clonedObj)

        // Wait for rendering to complete
        await waitForCanvasRender(tempCanvas)

        // Generate image with white background for better visibility
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2, // Higher resolution
          enableRetinaScaling: false,
        })

        console.log(`Generated dataURL for object ${i}:`, dataURL.substring(0, 100) + "...")

        const blob = dataURLtoBlob(dataURL)

        // @ts-ignore
        const elementType = obj.type || "element"
        let elementName = `${elementType}_${i + 1}`

        // For text objects, use the actual text as name
        if (obj.type === "i-text" || obj.type === "text") {
          // @ts-ignore
          const textContent = obj.text || "text"
          elementName = `text_${textContent.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}`
        } else if (obj.type === "image") {
          elementName = `logo_${i + 1}`
        }

        elements.push({
          name: `${elementName}.png`,
          blob,
        })

        // Clean up temp canvas
        tempCanvas.dispose()
      } catch (error) {
        console.error(`Error processing object ${i}:`, error)
      }
    }

    console.log(`Generated ${elements.length} element images`)
    return elements
  }

  async function uploadZipFile(file: Blob) {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    console.log("Here are the results", response.json)

    if (!response.ok) {
      throw new Error("File upload failed")
    }

    const result = await response.json()
    return result
  }

  const orderNow = async () => {
    if (!canvas) {
      toast({
        title: "Error",
        description: "Canvas not found. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Generate unique ID for the basket item
      const designId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      console.log("Starting design export process...")

      // Ensure canvas is fully rendered
      await waitForCanvasRender(canvas)

      // Set canvas background color to match selected shirt color
      const originalBackground = canvas.backgroundColor as string | fabric.Pattern | fabric.Gradient // Explicitly type originalBackground

      canvas.setBackgroundColor(selectedColor, () => {
        canvas.renderAll()
      })

      // Wait for background to be applied
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Generate the complete t-shirt design PNG
      const fullDesignDataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // Higher resolution
        enableRetinaScaling: false,
      })

      console.log("Full design generated:", fullDesignDataURL.substring(0, 100) + "...")

      // Restore original background
      canvas.setBackgroundColor(originalBackground, () => {
        canvas.renderAll()
      })

      const fullDesignBlob = dataURLtoBlob(fullDesignDataURL)

      // Generate individual element images
      console.log("Generating individual element images...")
      const elementImages = await generateElementImages()

      // Create ZIP file
      const zip = new JSZip()

      // Add the full design
      zip.file("full_design.png", fullDesignBlob)

      // Add individual elements if any exist
      if (elementImages.length > 0) {
        const elementsFolder = zip.folder("elements")
        elementImages.forEach((element) => {
          elementsFolder?.file(element.name, element.blob)
        })
      }

      // Add design information as JSON
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
      }

      zip.file("design_info.json", JSON.stringify(designInfo, null, 2))

      // Add a readme file with instructions
      const readmeContent = `T-Shirt Design Package
======================

This package contains:
1. full_design.png - Complete t-shirt design with background color
2. elements/ folder - Individual design elements (logos, text)
3. design_info.json - Design specifications and metadata

Design Details:
- Size: ${selectedSize}
- Color: ${designInfo.color}
- Style: ${shirtStyle}
- Elements: ${elementImages.length}
- Created: ${new Date().toLocaleString()}

Design ID: ${designId}`

      zip.file("README.txt", readmeContent)

      // Generate and download ZIP file
      console.log("Generating ZIP file...")
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      // link.href = url;
      // link.download = `${designInfo.name.replace(/[^a-zA-Z0-9]/g, "_")}_${designId}.zip`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

      // Add item to basket with the design ID
      const product = await getProductBySlug("custom-tshirt")
      addItem(product, selectedSize, extraCost)

      // uploadZipFile(zipBlob)
      setZipedFile(zipBlob)

      
      toast({
        title: "Design Downloaded & Added to Basket!",
        description: `Your custom t-shirt design has been downloaded and added to your basket. Design ID: ${designId}`,
      })

      redirect("/basket")
    } catch (error) {
      console.error("Failed to process design:", error)
      toast({
        title: "Error",
        description: "Failed to process your design. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // useEffect(() => {
  //   if(isArabic){
  //     setText("عربي")
  //   }else if(
  //     !isArabic
  //   ){
  //     setText("English")
  //   }
  // }, [isArabic])

  return (
    <TooltipProvider>
      <aside className="w-full lg:w-72 bg-card border-r p-4 flex flex-col gap-6">
        {/* T-Shirt Style */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
            <Ruler /> T-Shirt Style
          </h2>
          <div className="flex items-center space-x-2">
            <Label htmlFor="shirt-style-toggle">Slim Fit</Label>
            <Switch id="shirt-style-toggle" checked={shirtStyle === "oversized"} onCheckedChange={toggleShirtStyle} />
            <Label htmlFor="shirt-style-toggle">Oversized</Label>
          </div>
        </div>

        <Separator />

        {/* Size Selection */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-sm text-muted-foreground">Size</h2>
          <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
            {SHIRT_SIZES.map((size) => (
              <div key={size} className="flex items-center space-x-1">
                <RadioGroupItem value={size} id={`size-${size}`} />
                <Label htmlFor={`size-${size}`}>{size}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

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
              <Tooltip key={swatch._id}>
                <TooltipTrigger asChild>
                  <button
                    className={`w-8 h-8 rounded-full border ${
                      selectedColor === swatch.hexCode ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: swatch.hexCode }}
                    onClick={() => {
                      updateShirtColor(swatch.hexCode);
                      setShirtImageUrl(swatch.imageUrl);
                    }}
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
            ))}
          </div>
        </div>

        <Separator />

        {/* Customize */}
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
                  <Switch id="language-toggle" checked={isArabic} onCheckedChange={setIsArabic} />
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
                        <span style={{ fontFamily: font }}>{isArabic ? "عربي" : "English"}</span>
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
                            selectedFontColor === color.value ? "ring-2 ring-primary border-primary" : "border-gray-300"
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

                <Button variant="outline" onClick={addText} className="mt-2 bg-transparent">
                  <Type className="mr-2" /> Add Text
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="logo" className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => uploadInputRef.current?.click()}>
                  <ImagePlus className="mr-2" /> Upload Custom Logo
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
                    <button
                      key={logo._id}
                      className="border rounded p-2 hover:bg-accent"
                      onClick={() => addTemplateLogo(logo.imageUrl)}
                    >
                      <img src={logo.imageUrl || "/placeholder.svg"} alt={logo.name} className="w-full h-auto" />
                    </button>
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
          <h2 className="font-semibold text-sm text-muted-foreground">History</h2>
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={undo} disabled={!canUndo}>
                  <Undo />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={redo} disabled={!canRedo}>
                  <Redo />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <Separator />
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-sm text-muted-foreground">Actions</h2>
          <SignedIn >   <Button onClick={orderNow} size="lg" disabled={isProcessing}>
            {isProcessing ? "Processing..." : " Add to Basket"}
          </Button></SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </aside>
    </TooltipProvider>
  )
}
