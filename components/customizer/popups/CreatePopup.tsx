"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CreatePopupProps {
  onClose: () => void;
}

const CreatePopup = ({ onClose }: CreatePopupProps) => {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    // Placeholder for AI generation logic
    console.log("AI Prompt:", prompt);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="absolute top-0 right-16 h-full w-80 bg-background/90 backdrop-blur-lg border-l border-border/50 z-20 p-6 flex flex-col"
    >
      <div className="flex-grow overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold mb-4">Generate with AI</h2>

        <div className="space-y-2">
          <Label htmlFor="ai-prompt">Design Prompt</Label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 px-3 py-2 rounded-md border border-border bg-background/50"
            placeholder="e.g., a synthwave sunset with a retro car"
          />
        </div>
      </div>
      <Button onClick={handleGenerate} className="w-full mt-4">
        <Sparkles className="mr-2 h-4 w-4" />
        Create Design & Close
      </Button>
    </motion.div>
  );
};

export default CreatePopup;
