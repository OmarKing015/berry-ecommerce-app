"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Type, Shirt, ImagePlus, ShoppingBag, Trash2, Undo, Redo, X, Sparkles } from "lucide-react"
import { StylePanel } from "./panels/StylePanel"
import { TextPanel } from "./panels/TextPanel"
import { LogoPanel } from "./panels/LogoPanel"
import { CreatePanel } from "./panels/CreatePanel"
import { useEditorStore } from "@/store/editorStore"

type PanelType = "text" | "style" | "logo" | "create" | null

export default function MobileToolbar() {
  const { canvas, undo, redo, canUndo, canRedo, totalCost, shirtImageUrl } = useEditorStore()
  const [activePanel, setActivePanel] = useState<PanelType>(null)

  const deleteActiveObject = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }

  const closePanel = () => setActivePanel(null)

  const toolbarItems = [
    {
      id: "text" as PanelType,
      icon: Type,
      label: "Text",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "style" as PanelType,
      icon: Shirt,
      label: "Style",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "logo" as PanelType,
      icon: ImagePlus,
      label: "Logo",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "create" as PanelType,
      icon: ShoppingBag,
      label: "Create",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
    },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Cost Display Bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white px-4 py-3 flex justify-between items-center shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Total Cost</span>
          </div>
          <div className="text-xl font-bold">{totalCost.toFixed(2)} EGP</div>
        </motion.div>

        {/* Main Toolbar */}
        <div className="bg-white border-t border-gray-200 px-2 py-2">
          <div className="flex justify-between items-center">
            {/* Main Tools */}
            <div className="flex gap-1 flex-1">
              {toolbarItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                  disabled={item.id !== "style" && !shirtImageUrl}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-300 ${
                    activePanel === item.id
                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                      : `${item.bgColor} text-gray-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1 ml-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={undo}
                disabled={!canUndo || !shirtImageUrl}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={redo}
                disabled={!canRedo || !shirtImageUrl}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={deleteActiveObject}
                disabled={!shirtImageUrl}
                className="p-2 rounded-lg bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Panels */}
      <AnimatePresence>
        {activePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {(() => {
                    const item = toolbarItems.find((t) => t.id === activePanel)
                    if (!item) return null
                    return (
                      <>
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color}`}>
                          <item.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-500">
                            {activePanel === "text" && "Add custom text to your design"}
                            {activePanel === "style" && "Choose your T-shirt style & color"}
                            {activePanel === "logo" && "Upload or select a logo"}
                            {activePanel === "create" && "Finalize and add to basket"}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closePanel}
                  className="p-2 rounded-full bg-gray-100 text-gray-600"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Panel Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
                {activePanel === "text" && <TextPanel onClose={closePanel} />}
                {activePanel === "style" && <StylePanel onClose={closePanel} />}
                {activePanel === "logo" && <LogoPanel onClose={closePanel} />}
                {activePanel === "create" && <CreatePanel onClose={closePanel} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
