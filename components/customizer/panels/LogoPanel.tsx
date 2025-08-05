"use client"

import { useState, useEffect, useRef } from "react"
import { useEditorStore } from "../../../store/editorStore"
import { fabric } from "fabric"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/customizer/use-toast"
import { ImagePlus, Star, Loader2 } from "lucide-react"

interface TEMPLATE_LOGOS_TYPE {
  _id: string
  name: string
  imageUrl: string
}

export function LogoPanel() {
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
      },
      { crossOrigin: "anonymous" }
    )
  }

  const addTemplateLogo = (logoUrl: string, logoId: string) => {
    if (!canvas) return
    setTemplateLogoLoading((prev) => ({ ...prev, [logoId]: true }))
    try {
      const file = new File([logoUrl], "logo.png", { type: "image/png" })
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
        },
        { crossOrigin: "anonymous" }
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
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => uploadInputRef.current?.click()}
        disabled={isUploadingCustomImage}
        className="w-full"
      >
        {isUploadingCustomImage ? (
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        Upload Custom Logo
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={uploadInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="space-y-2">
        <h3 className="font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Template Logos
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {logos?.map((logo) => (
            <div key={logo._id} className="relative">
              <button
                className="w-full aspect-square border rounded-md p-1 hover:border-primary"
                onClick={() => addTemplateLogo(logo.imageUrl, logo._id)}
                disabled={templateLogoLoading[logo._id]}
              >
                <img
                  src={logo.imageUrl}
                  alt={logo.name}
                  className="w-full h-full object-contain"
                />
              </button>
              {templateLogoLoading[logo._id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                  <Loader2 className="animate-spin h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
