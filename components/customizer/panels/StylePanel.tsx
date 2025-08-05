"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../../store/editorStore"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from "@/components/customizer/use-toast"
import { Zap, Palette } from "lucide-react"

interface ColorSwatch {
  _id: string
  name: string
  hexCode: string
  imageUrl: string
  createdAt: string
  style: "slim" | "oversized"
}

export function StylePanel() {
  const { toast } = useToast()
  const { shirtStyle, setShirtStyle, setShirtImageUrl } = useEditorStore()
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([])
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  )

  useEffect(() => {
    const fetchColorSwatches = async () => {
      try {
        const res = await fetch("/api/admin/color-swatches")
        const data = await res.json()
        setColorSwatches(data)
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Unable to load color swatches. Please try again.",
          variant: "destructive",
        })
      }
    }
    fetchColorSwatches()
  }, [toast])

  const filteredColorSwatches = colorSwatches.filter(
    (swatch) => swatch.style === shirtStyle
  )

  const updateShirtColor = (color: string) => {
    setSelectedColor(color)
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Style Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Style</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={shirtStyle === "slim" ? "default" : "outline"}
              onClick={() => setShirtStyle("slim")}
            >
              Slim Fit
            </Button>
            <Button
              variant={shirtStyle === "oversized" ? "default" : "outline"}
              onClick={() => setShirtStyle("oversized")}
            >
              Oversized
            </Button>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Colors</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {filteredColorSwatches.map((swatch, index) => (
              <motion.div key={swatch._id} className="relative group">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 ${
                        selectedColor === swatch.hexCode
                          ? "ring-4 ring-primary/50 border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: swatch.hexCode }}
                      onClick={() => {
                        if (imageLoading[swatch._id]) return
                        setImageLoading((prev) => ({
                          ...prev,
                          [swatch._id]: true,
                        }))
                        const img = new Image()
                        img.onload = () => {
                          updateShirtColor(swatch.hexCode)
                          setShirtImageUrl(swatch.imageUrl)
                          setImageLoading((prev) => ({
                            ...prev,
                            [swatch._id]: false,
                          }))
                        }
                        img.onerror = () => {
                          toast({
                            title: "Image Load Error",
                            description: `Failed to load ${swatch.name} color`,
                            variant: "destructive",
                          })
                          setImageLoading((prev) => ({
                            ...prev,
                            [swatch._id]: false,
                          }))
                        }
                        img.src = swatch.imageUrl
                      }}
                      disabled={imageLoading[swatch._id]}
                    >
                      {selectedColor === swatch.hexCode && (
                        <div className="w-full h-full rounded-xl flex items-center justify-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              swatch.hexCode === "#FFFFFF"
                                ? "bg-gray-800"
                                : "bg-white"
                            }`}
                          />
                        </div>
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{swatch.name}</p>
                  </TooltipContent>
                </Tooltip>
                {imageLoading[swatch._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
