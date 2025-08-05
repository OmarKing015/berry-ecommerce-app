"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { useEditorStore } from "../../store/editorStore";

import CanvasWrapper from "./CanvasWraper";
import Toolbar from "./Toolbar";
import CostSummary from "./CostSummay";
import { Card } from "../ui/card";
import slim from "@/public/public/slimMock.png";
import oversize from "@/public/public/oversizeMock.png";
import MobileToolbar from "./MobileToolbar";

export default function TshirtEditor() {
  const { shirtStyle, reset, shirtImageUrl } = useEditorStore();

  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // The main container is now a flex column on mobile and a grid on large screens.
    <div className="flex flex-col lg:grid lg:grid-cols-[auto_1fr] min-h-screen">
      {/* The desktop toolbar is hidden on mobile screens. */}
      <div className="hidden lg:block">
        <Toolbar />
      </div>

      {/* The main content area is a flex column that takes up the remaining space. */}
      <main className="flex-1 flex flex-col">
        {/* The canvas and cost summary are centered in a flex container. */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-muted/20 relative">
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
              <CanvasWrapper />
            </div>
          </Card>
          <CostSummary />
        </div>

        {/* The mobile toolbar is visible only on mobile screens. */}
        <div className="lg:hidden">
          <MobileToolbar />
        </div>
      </main>
    </div>
  );
}
