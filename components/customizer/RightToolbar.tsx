"use client";

import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StylePopup from "./popups/StylePopup";
import CreatePopup from "./popups/CreatePopup";

const RightToolbar = () => {
  const [activePopup, setActivePopup] = useState<"style" | "create" | null>(null);

  return (
    <TooltipProvider>
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
        <div className="flex flex-col gap-4 p-2 bg-background/80 backdrop-blur-md border border-border/50 rounded-lg shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePopup("style")}
                className="p-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                <Zap className="h-6 w-6 text-foreground" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>T-Shirt Style</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePopup("create")}
                className="p-3 rounded-md hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="h-6 w-6 text-foreground" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Generate with AI</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {activePopup === "style" && <StylePopup onClose={() => setActivePopup(null)} />}
      {activePopup === "create" && <CreatePopup onClose={() => setActivePopup(null)} />}
    </TooltipProvider>
  );
};

export default RightToolbar;
