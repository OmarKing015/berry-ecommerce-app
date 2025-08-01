
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { fabric } from "fabric";

import { shallow } from "zustand/shallow";
import { useEditorStore } from "../../store/editorStore";

import Toolbar from "./Toolbar";
import CostSummary from "./CostSummay";
import { Card } from "../ui/card";
import slim from "@/public/public/slimMock.png";
import oversize from "@/public/public/oversizeMock.png"

const TSHIRT_IMAGES = {
  slim: slim,
  oversized: oversize,
};


export default function TshirtEditor() {
  const { setCanvas, reset } = useEditorStore(
    (state) => ({
      setCanvas: state.setCanvas,
      reset: state.reset,
    }),
    shallow
  );
  const { shirtStyle, shirtImageUrl } = useEditorStore(
    (state) => ({
      shirtStyle: state.shirtStyle,
      shirtImageUrl: state.shirtImageUrl,
    }),
    shallow
  );

  useEffect(() => {
    const initCanvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 500,
    });
    setCanvas(initCanvas);

    // The event listeners and history management are now handled within setCanvas in the store

    return () => {
      initCanvas.dispose();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCanvas, reset]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] min-h-screen">
      <Toolbar />
      <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20 relative">
        <Card className="relative w-full max-w-[500px]    aspect-square bg-transparent overflow-hidden  rounded-2xl">
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
                src={shirtImageUrl || TSHIRT_IMAGES[shirtStyle]}
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
            <canvas id="canvas" />
          </div>
        </Card>
        <CostSummary />
      </div>
    </div>
  );
}
