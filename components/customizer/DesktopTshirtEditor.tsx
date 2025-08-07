"use client"

import { useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

import { useEditorStore } from "../../store/editorStore"

import CanvasWrapper from "./CanvasWraper"
import Toolbar from "./Toolbar"
import CostSummary from "./CostSummay"
import { Card } from "../ui/card"
import slim from "@/public/public/slimMock.png"

export default function DesktopTshirtEditor() {
  const { shirtStyle, reset, shirtImageUrl } = useEditorStore()

  useEffect(() => {
    return () => {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid grid-cols-[auto_1fr] h-screen overflow-hidden">
      <Toolbar />

      <main className="flex-1 flex flex-col relative">
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
          <div className="w-full max-w-[500px] aspect-square relative">
            <Card className="relative w-full h-full bg-transparent overflow-hidden rounded-3xl shadow-2xl border-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={shirtStyle}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={shirtImageUrl || slim}
                    data-ai-hint={`${shirtStyle} t-shirt`}
                    alt={`${shirtStyle} t-shirt`}
                    fill
                    priority
                    key={shirtImageUrl}
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0">
                <CanvasWrapper />
              </div>
            </Card>
          </div>

          <CostSummary />
        </div>
      </main>
    </div>
  )
}
