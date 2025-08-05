"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { fabric } from "fabric"
import { useEditorStore } from "../../store/editorStore"

const CanvasWrapper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setCanvas } = useEditorStore()

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        height: 500,
        width: 500,
      })
      setCanvas(canvas)

      // Add smooth transitions to canvas interactions
      const canvasElement = canvas.getElement()
      canvasElement.style.transition = "all 0.2s ease-out"

      return () => {
        canvas.dispose()
      }
    }
  }, [setCanvas])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full rounded-lg"
        style={{
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
        }}
      />
    </motion.div>
  )
}

export default CanvasWrapper
