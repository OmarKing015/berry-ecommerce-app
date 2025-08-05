"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../../store/editorStore"
import { fabric } from "fabric"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Sparkles } from "lucide-react"

const FONT_COLORS = [
  { name: "Midnight", value: "#000000" },
  { name: "Snow", value: "#FFFFFF" },
  { name: "Crimson", value: "#FF0000" },
  { name: "Ocean", value: "#0000FF" },
  { name: "Forest", value: "#008000" },
  { name: "Sunshine", value: "#FFFF00" },
  { name: "Royal", value: "#800080" },
  { name: "Sunset", value: "#FFA500" },
]

const FONTS = {
  english: ["Inter", "Roboto", "Poppins", "Montserrat", "Playfair Display"],
  arabic: ["Noto Sans Arabic", "Amiri", "Cairo", "Almarai", "Lalezar"],
}

interface TextPanelProps {
  onClose?: () => void
}

export function TextPanel({ onClose }: TextPanelProps) {
  const { canvas } = useEditorStore()
  const [text, setText] = useState("Your Text Here")
  const [isArabic, setIsArabic] = useState(false)
  const [selectedFont, setSelectedFont] = useState("Inter")
  const [selectedFontColor, setSelectedFontColor] = useState("#000000")

  const addText = () => {
    if (!canvas) return
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
    })
    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()

    // Auto-close panel on mobile
    if (onClose) {
      setTimeout(onClose, 500)
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

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <Label htmlFor="text-input" className="text-base font-semibold text-gray-900">
          What do you want to say?
        </Label>
        <input
          id="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-lg font-medium placeholder-gray-400 transition-all duration-300"
          placeholder="Enter your awesome text..."
        />
      </motion.div>

      {/* Language Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
      >
        <Label htmlFor="language-toggle" className="font-semibold text-gray-700">
          English
        </Label>
        <Switch
          id="language-toggle"
          checked={isArabic}
          onCheckedChange={setIsArabic}
          className="data-[state=checked]:bg-purple-500"
        />
        <Label htmlFor="language-toggle" className="font-semibold text-gray-700">
          العربية
        </Label>
      </motion.div>

      {/* Font Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label htmlFor="font-select" className="text-base font-semibold text-gray-900">
          Choose Your Font
        </Label>
        <Select value={selectedFont} onValueChange={changeFont}>
          <SelectTrigger className="h-12 rounded-2xl border-2 border-gray-200 text-base">
            <SelectValue placeholder="Pick a font style" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {(isArabic ? FONTS.arabic : FONTS.english).map((font) => (
              <SelectItem key={font} value={font} className="text-base py-3">
                <span style={{ fontFamily: font }} className="font-medium">
                  {font}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Color Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <Label className="text-base font-semibold text-gray-900">Pick Your Color</Label>
        <div className="grid grid-cols-4 gap-3">
          {FONT_COLORS.map((color, index) => (
            <motion.button
              key={color.value}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`aspect-square rounded-2xl border-3 transition-all duration-300 ${
                selectedFontColor === color.value
                  ? "border-blue-500 ring-4 ring-blue-200 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => changeFontColor(color.value)}
            >
              {selectedFontColor === color.value && (
                <div className="w-full h-full rounded-2xl flex items-center justify-center">
                  <div className={`w-4 h-4 rounded-full ${color.value === "#FFFFFF" ? "bg-gray-800" : "bg-white"}`} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Add Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          onClick={addText}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Add Text to Design
        </Button>
      </motion.div>
    </div>
  )
}
