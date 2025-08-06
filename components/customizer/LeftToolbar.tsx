"use client";

import { useState } from "react";
import { Type, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TextPopup from "./popups/TextPopup";
import LogoPopup from "./popups/LogoPopup";

const LeftToolbar = () => {
  const [activePopup, setActivePopup] = useState<"text" | "logo" | null>(null);

  return (
    <TooltipProvider>
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
        <div className="flex flex-col gap-4 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePopup("text")}
                className="p-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                <Type className="h-6 w-6 text-foreground" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Text</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePopup("logo")}
                className="p-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                <ImagePlus className="h-6 w-6 text-foreground" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Add Logo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {activePopup === "text" && <TextPopup onClose={() => setActivePopup(null)} />}
      {activePopup === "logo" && <LogoPopup onClose={() => setActivePopup(null)} />}
    </TooltipProvider>
  );
};

export default LeftToolbar;
