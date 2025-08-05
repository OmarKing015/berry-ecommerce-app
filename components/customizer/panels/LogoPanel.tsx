"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../../store/editorStore"
import { fabric } from "fabric"
import { useToast } from "@/components/customizer/use-toast"
import { ImagePlus, Star, Loader2, Upload, Sparkles } from "lucide-react"

interface TEMPLATE_LOGOS_TYPE {
  _id: string
  name: string
  imageUrl: string
}

interface LogoPanelProps {
  onClose?: () => void
}

export function LogoPanel({ onClose }: LogoPanelProps) {
  const { canvas, addHighQualityImage } = useEditorStore()
  const { toast } = useToast()
  const [logos, setLogos] = useState<TEMPLATE_LOGOS_TYPE[]>([])
  const [templateLogoLoading, setTemplateLogoLoading] = useState<{
    [key: string]: boolean
  }>({})
  const [isUploadingCustomImage, setIsUploadingCustomImage] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch("/api/admin/logos")
        const data = await res.json()
        setLogos(data)
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Unable to load logos. Please try again.",
          variant: "destructive",
        })
      }
    }
    fetchLogos()
  }, [toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file.",
        variant: "destructive",
      })
      return
    }

    addHighQualityImage(file)
    setIsUploadingCustomImage(true)
    fabric.Image.fromURL(
      URL.createObjectURL(file),
      (img: any) => {
        img.scaleToWidth(150)
        img.set({
          left: 175,
          top: 175,
          cost: 5,
          type: "logo",
        })
        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        setIsUploadingCustomImage(false)

        // Auto-close panel
        if (onClose) {
          setTimeout(onClose, 500)
        }
      },
      { crossOrigin: "anonymous" },
    )
  }

  const addTemplateLogo = async (logoUrl: string, logoId: string) => {
    if (!canvas) return
    setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: true }))
    try {
      const response = await fetch(logoUrl)
      const blob = await response.blob()
      const fileName = logoUrl.substring(logoUrl.lastIndexOf("/") + 1)
      const file = new File([blob], fileName, { type: blob.type })
      addHighQualityImage(file)

      fabric.Image.fromURL(
        logoUrl,
        (img: any) => {
          img.scaleToWidth(150)
          img.set({
            left: 175,
            top: 175,
            cost: 3,
            type: "logo",
          })
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: false }))

          // Auto-close panel
          if (onClose) {
            setTimeout(onClose, 500)
          }
        },
        { crossOrigin: "anonymous" },
      )
    } catch (error) {
      toast({
        title: "Logo Load Error",
        description: "Failed to load template logo. Please try again.",
        variant: "destructive",
      })
      setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Custom Logo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-bold text-gray-900">Upload Your Logo</h3>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => uploadInputRef.current?.click()}
          disabled={isUploadingCustomImage}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 disabled:opacity-50"
        >
          {isUploadingCustomImage ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin h-8 w-8 text-green-500" />
              <div className="text-green-700 font-semibold">Uploading...</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-green-500 text-white">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div className="text-green-700 font-semibold">Tap to Upload</div>
              <div className="text-sm text-green-600">PNG, JPG, SVG supported</div>
            </div>
          )}
        </motion.button>

        <input type="file" accept="image/*" ref={uploadInputRef} onChange={handleImageUpload} className="hidden" />
      </motion.div>

      {/* Template Logos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Template Logos</h3>
        </div>

        {logos?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Loading awesome logos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {logos?.map((logo, index) => (
              <motion.div
                key={logo._id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full aspect-square border-2 border-gray-200 rounded-2xl p-2 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 bg-white overflow-hidden"
                  onClick={() => addTemplateLogo(logo.imageUrl, logo._id)}
                  disabled={templateLogoLoading[logo._id]}
                >
                  <img
                    src={logo.imageUrl || "/placeholder.svg"}
                    alt={logo.name}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                </motion.button>

                {templateLogoLoading[logo._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                    <Loader2 className="animate-spin h-6 w-6 text-yellow-500" />
                  </div>
                )}

                <div className="text-center mt-2">
                  <div className="text-xs font-medium text-gray-700 truncate">{logo.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
