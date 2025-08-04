"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useEditorStore } from "../../store/editorStore"

const CanvasWrapper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvas } = useEditorStore()

  useEffect(() => {
    if (canvas && canvasRef.current) {
      const canvasEl = canvasRef.current
      const parent = canvasEl.parentNode
      parent?.replaceChild(canvas.getElement(), canvasEl)

      // Add smooth transitions to canvas interactions
      const canvasElement = canvas.getElement()
      canvasElement.style.transition = "all 0.2s ease-out"
    }
  }, [canvas])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex items-center justify-center"
    >
      <canvas
        id="canvas"
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
