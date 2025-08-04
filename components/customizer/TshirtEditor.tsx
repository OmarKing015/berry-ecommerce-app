"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { fabric } from "fabric"
import { useEditorStore } from "../../store/editorStore"
import CanvasWrapper from "./CanvasWraper"
import Toolbar from "./Toolbar"
import CostSummary from "./CostSummay"
import { Card } from "../ui/card"
import { Sparkles, Zap } from "lucide-react"
import slim from "@/public/public/slimMock.png"
import oversize from "@/public/public/oversizeMock.png"

const TSHIRT_IMAGES = {
  slim: slim,
  oversized: oversize,
}

export default function TshirtEditor() {
  const { shirtStyle, setCanvas, setTotalCost, reset, shirtImageUrl } = useEditorStore()

  const isUpdating = useRef(false)

  useEffect(() => {
    const initCanvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 500,
      backgroundColor: "transparent",
    })

    // Add subtle canvas styling
    initCanvas.selectionColor = "rgba(59, 130, 246, 0.1)"
    initCanvas.selectionBorderColor = "rgb(59, 130, 246)"
    initCanvas.selectionLineWidth = 2

    setCanvas(initCanvas)

    return () => {
      initCanvas.dispose()
      reset()
    }
  }, [setCanvas, setTotalCost])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden">
      <Toolbar />

      <div className="flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-0">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />

        {/* Main Design Area */}
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <Card className="relative w-full max-w-[500px] aspect-square bg-gradient-to-br from-background/80 via-background/60 to-background/40 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl overflow-hidden">
              {/* Shirt Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${shirtStyle}-${shirtImageUrl}`}
                  initial={{ opacity: 0, scale: 0.95, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.95, rotateY: -90 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    type: "spring",
                    bounce: 0.2,
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={shirtImageUrl || TSHIRT_IMAGES[shirtStyle]}
                    data-ai-hint={`${shirtStyle} t-shirt`}
                    alt={`${shirtStyle} t-shirt`}
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Canvas Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute inset-0 z-10"
              >
                <CanvasWrapper />
              </motion.div>

              {/* Style Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 left-4 z-20"
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium capitalize">{shirtStyle}</span>
                </div>
              </motion.div>

              {/* Creative Sparkles */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
                className="absolute top-6 right-6 z-20 text-primary/30"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                  scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 },
                }}
                className="absolute bottom-6 left-6 z-20 text-primary/20"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            </Card>
          </motion.div>

          {/* Cost Summary - Positioned below the design area */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="z-10"
          >
            <CostSummary />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
