"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../../store/editorStore"
import useBasketStore from "../../../store/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/customizer/use-toast"
import { Loader2, Sparkles, ShoppingBag, Star } from "lucide-react"
import JSZip from "jszip"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

interface CreatePanelProps {
  onClose?: () => void
}

export function CreatePanel({ onClose }: CreatePanelProps) {
  const { toast } = useToast()
  const { canvas, totalCost, shirtImageUrl, shirtStyle, selectedColorSwatch } = useEditorStore()
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
        description: "Please select a size to create your masterpiece.",
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
      formData.append("file", zipBlob, `design-${Date.now()}.zip`)
      const fullDesignFile = new File([canvasDataUrl], "product-image.png", {
        type: "image/png",
      })
      formData.append("imageData", fullDesignFile)

      const response = await fetch("/api/custom-product", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create custom product.")
      }

      const newProduct = await response.json()
      addItem(newProduct, selectedSize, 0)

      toast({
        title: "🎉 Masterpiece Created!",
        description: "Your custom T-shirt has been added to your basket.",
      })

      // Auto-close panel
      if (onClose) {
        setTimeout(onClose, 1000)
      }
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
    <div className="space-y-6">
      {/* Size Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-bold text-gray-900">Choose Your Size</h3>
        </div>

        <RadioGroup value={selectedSize ?? ""} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-3">
          {SIZES.map((size, index) => (
            <motion.div
              key={size}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="contents"
            >
              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
              <Label
                htmlFor={`size-${size}`}
                className={`cursor-pointer rounded-2xl border-2 text-center py-4 font-bold text-lg transition-all duration-300 hover:scale-105 ${
                  selectedSize === size
                    ? "border-pink-500 bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700 shadow-lg"
                    : "border-gray-200 bg-white text-gray-700 hover:border-pink-300"
                }`}
              >
                {size}
              </Label>
            </motion.div>
          ))}
        </RadioGroup>
      </motion.div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
      >
        <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Style:</span>
            <span className="font-medium capitalize">{shirtStyle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{selectedSize || "Not selected"}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold text-gray-900">Total:</span>
            <span className="font-bold text-xl text-pink-600">{totalCost.toFixed(2)} EGP</span>
          </div>
        </div>
      </motion.div>

      {/* Create Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SignedIn>
          <Button
            onClick={handleAddToBasket}
            size="lg"
            disabled={isLoading || !selectedSize}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Creating Magic...
              </div>
            ) : (
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Basket
              </div>
            )}
          </Button>
        </SignedIn>

        <SignedOut>
          <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-lg font-bold shadow-lg">
            <SignInButton mode="modal">
              <span className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Sign In to Create
              </span>
            </SignInButton>
          </Button>
        </SignedOut>
      </motion.div>
    </div>
  )
}
