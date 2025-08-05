"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../../store/editorStore"
import { useToast } from "@/components/customizer/use-toast"
import { Zap, Palette, Sparkles } from "lucide-react"

interface ColorSwatch {
  _id: string
  name: string
  hexCode: string
  imageUrl: string
  createdAt: string
  style: "slim" | "oversized"
}

interface StylePanelProps {
  onClose?: () => void
}

export function StylePanel({ onClose }: StylePanelProps) {
  const { toast } = useToast()
  const { shirtStyle, setShirtStyle, setShirtImageUrl } = useEditorStore()
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([])
  const [selectedColor, setSelectedColor] = useState("#FFFFFF")
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})

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

  const filteredColorSwatches = colorSwatches.filter((swatch) => swatch.style === shirtStyle)

  const updateShirtColor = (color: string, imageUrl: string, swatchId: string) => {
    setSelectedColor(color)
    setImageLoading((prev) => ({ ...prev, [swatchId]: true }))

    const img = new Image()
    img.onload = () => {
      setShirtImageUrl(imageUrl)
      setImageLoading((prev) => ({ ...prev, [swatchId]: false }))

      // Auto-close panel after selection
      if (onClose) {
        setTimeout(onClose, 800)
      }
    }
    img.onerror = () => {
      toast({
        title: "Image Load Error",
        description: "Failed to load color. Please try again.",
        variant: "destructive",
      })
      setImageLoading((prev) => ({ ...prev, [swatchId]: false }))
    }
    img.src = imageUrl
  }

  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-900">Choose Your Style</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShirtStyle("slim")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              shirtStyle === "slim"
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg"
                : "border-gray-200 bg-white hover:border-purple-300"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👔</div>
              <div className="font-bold text-gray-900">Slim Fit</div>
              <div className="text-sm text-gray-600">Classic & fitted</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShirtStyle("oversized")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
              shirtStyle === "oversized"
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg"
                : "border-gray-200 bg-white hover:border-purple-300"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-bold text-gray-900">Oversized</div>
              <div className="text-sm text-gray-600">Relaxed & comfy</div>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Color Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-bold text-gray-900">Pick Your Color</h3>
        </div>

        {filteredColorSwatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Loading colors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredColorSwatches.map((swatch, index) => (
              <motion.div
                key={swatch._id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full aspect-square rounded-2xl border-3 transition-all duration-300 ${
                    selectedColor === swatch.hexCode
                      ? "border-pink-500 ring-4 ring-pink-200 shadow-xl"
                      : "border-gray-200 hover:border-pink-300 hover:shadow-lg"
                  }`}
                  style={{ backgroundColor: swatch.hexCode }}
                  onClick={() => updateShirtColor(swatch.hexCode, swatch.imageUrl, swatch._id)}
                  disabled={imageLoading[swatch._id]}
                >
                  {selectedColor === swatch.hexCode && (
                    <div className="w-full h-full rounded-2xl flex items-center justify-center">
                      <div
                        className={`w-6 h-6 rounded-full ${swatch.hexCode === "#FFFFFF" ? "bg-gray-800" : "bg-white"}`}
                      />
                    </div>
                  )}
                </motion.button>

                {imageLoading[swatch._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent" />
                  </div>
                )}

                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-gray-900">{swatch.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
