"use client"

import { useState } from "react"
import { useEditorStore } from "../../../store/editorStore"
import { fabric } from "fabric"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Type } from "lucide-react"

const FONT_COLORS = [
  { name: "Midnight", value: "#000000" },
  { name: "Snow", value: "#FFFFFF" },
  { name: "Crimson", value: "#FF0000" },
  { name: "Ocean", value: "#0000FF" },
  { name: "Forest", value: "#008000" },
  { name: "Sunshine", value: "#FFFF00" },
]

const FONTS = {
  english: ["Inter", "Roboto", "Poppins", "Montserrat", "Playfair Display"],
  arabic: ["Noto Sans Arabic", "Amiri", "Cairo", "Almarai", "Lalezar"],
}

export function TextPanel() {
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
      // @ts-ignore
      cost: text.length * 0.1,
      type: "text",
    })
    canvas.add(textObject)
    canvas.setActiveObject(textObject)
    canvas.renderAll()
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
    if (activeObject && activeObject.type === "i-text") {
      // @ts-ignore
      activeObject.set({ fill: color })
      canvas.renderAll()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-input">Text Content</Label>
        <input
          id="text-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 rounded-md border"
          placeholder="Enter your text"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="language-toggle">English</Label>
        <Switch
          id="language-toggle"
          checked={isArabic}
          onCheckedChange={setIsArabic}
        />
        <Label htmlFor="language-toggle">العربية</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-select">Font Family</Label>
        <Select value={selectedFont} onValueChange={changeFont}>
          <SelectTrigger id="font-select">
            <SelectValue placeholder="Choose Font" />
          </SelectTrigger>
          <SelectContent>
            {(isArabic ? FONTS.arabic : FONTS.english).map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font Color</Label>
        <div className="grid grid-cols-6 gap-2">
          {FONT_COLORS.map((color) => (
            <button
              key={color.value}
              className={`w-8 h-8 rounded-full border ${
                selectedFontColor === color.value ? "ring-2 ring-primary" : ""
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => changeFontColor(color.value)}
            />
          ))}
        </div>
      </div>

      <Button onClick={addText} className="w-full">
        <Type className="mr-2 h-4 w-4" />
        Add Text to Design
      </Button>
    </div>
  )
}
