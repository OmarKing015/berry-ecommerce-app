"use client"

import { useState } from "react"
import { useEditorStore } from "../../../store/editorStore"
import useBasketStore from "../../../store/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/customizer/use-toast"
import { Loader2, Sparkles } from "lucide-react"
import JSZip from "jszip"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

export function CreatePanel() {
  const { toast } = useToast()
  const { canvas, totalCost, shirtImageUrl, shirtStyle, selectedColorSwatch } =
    useEditorStore()
  const { addItem } = useBasketStore()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleAddToBasket = async () => {
    if (!selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size.",
        variant: "destructive",
      })
      return
    }
    if (!canvas || !shirtImageUrl) {
      toast({
        title: "Design not ready",
        description: "Please ensure you have selected a color and style.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const zip = new JSZip()
      const canvasDataUrl = canvas.toDataURL({ format: "png", quality: 1 })
      zip.file("design.png", dataURLtoBlob(canvasDataUrl))
      const zipBlob = await zip.generateAsync({ type: "blob" })

      const formData = new FormData()
      formData.append("name", "Custom T-shirt")
      formData.append("price", totalCost.toString())
      formData.append("size", selectedSize)
      formData.append("slug", `custom-tshirt-${Date.now()}`)
      formData.append(
        "file",
        zipBlob,
        `design-${Date.now()}.zip`
      )
      const fullDesignFile = new File([canvasDataUrl], "product-image.png", {
        type: "image/png",
      });
      formData.append("imageData", fullDesignFile);

      const response = await fetch("/api/custom-product", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create custom product.")
      }

      const newProduct = await response.json()
      addItem(newProduct, selectedSize,0)

      toast({
        title: "Success!",
        description: "Your custom T-shirt has been added to the basket.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to basket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Size</Label>
        <RadioGroup
          value={selectedSize ?? ""}
          onValueChange={setSelectedSize}
          className="grid grid-cols-3 gap-2"
        >
          {SIZES.map((size) => (
            <div key={size} className="contents">
              <RadioGroupItem
                value={size}
                id={`size-${size}`}
                className="sr-only"
              />
              <Label
                htmlFor={`size-${size}`}
                className={`cursor-pointer rounded-md border text-center py-2 ${
                  selectedSize === size ? "border-primary bg-primary text-primary-foreground" : ""
                }`}
              >
                {size}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <SignedIn>
        <Button
          onClick={handleAddToBasket}
          size="lg"
          disabled={isLoading || !selectedSize}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Add to Basket
        </Button>
      </SignedIn>

      <SignedOut>
        <Button className="w-full">
          <SignInButton mode="modal">
            <span>Sign In to Create</span>
          </SignInButton>
        </Button>
      </SignedOut>
    </div>
  )
}
