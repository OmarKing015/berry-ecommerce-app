"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { fabric } from "fabric";

import { useEditorStore } from "../../store/editorStore";

import CanvasWrapper from "./CanvasWraper";
import Toolbar from "./Toolbar";
import CostSummary from "./CostSummay";
import { Card } from "../ui/card";
import slim from "@/public/public/slimMock.png";
import oversize from "@/public/public/oversizeMock.png";
import MobileToolbar from "./MobileToolbar";

const TSHIRT_IMAGES = {
  slim: slim,
  oversized: oversize,
};

export default function TshirtEditor() {
  const { shirtStyle, setCanvas, setTotalCost } = useEditorStore();
  const isUpdating = useRef(false);

  useEffect(() => {
    const initCanvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 500,
    });
    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCanvas, setTotalCost]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <div className="hidden lg:block">
        <Toolbar />
      </div>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20 relative">
        <Card className="relative w-full max-w-[500px] aspect-square bg-transparent overflow-hidden rounded-2xl">
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
                src={TSHIRT_IMAGES[shirtStyle]}
                data-ai-hint={`${shirtStyle} t-shirt`}
                alt={`${shirtStyle} t-shirt`}
                fill
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0">
            <CanvasWrapper />
          </div>
        </Card>
        <div className="hidden lg:block">
          <CostSummary />
        </div>
      </main>

      <MobileToolbar />
    </div>
  );
}
