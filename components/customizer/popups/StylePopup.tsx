"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Palette } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/customizer/use-toast";

interface StylePopupProps {
  onClose: () => void;
}

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  style: "slim" | "oversized";
}

const StylePopup = ({ onClose }: StylePopupProps) => {
  const { toast } = useToast();
  const { setShirtImageUrl, updateShirtColor: setStoreShirtColor } = useEditorStore();

  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<"slim" | "oversized">("slim");
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/admin/color-swatches");
        const data = await res.json();
        setColorSwatches(data);
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Unable to load color swatches.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [toast]);

  const filteredColorSwatches = colorSwatches.filter(
    (swatch) => swatch.style === selectedStyle
  );

  const handleUpdateColor = (hexCode: string, imageUrl: string) => {
    setSelectedColor(hexCode);
    setStoreShirtColor(hexCode); // Assuming you have a store action for this
    setShirtImageUrl(imageUrl);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-80 bg-background/90 backdrop-blur-lg border-l border-border/50 z-20 p-6 flex flex-col"
    >
      <div className="flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Choose Style</h2>

        {isFetching ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary" />
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-6">
              {/* Style Selection */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm text-foreground">Style</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={selectedStyle === "slim" ? "default" : "outline"} onClick={() => setSelectedStyle("slim")}>Slim Fit</Button>
                  <Button variant={selectedStyle === "oversized" ? "default" : "outline"} onClick={() => setSelectedStyle("oversized")}>Oversized</Button>
                </div>
              </motion.div>

              {/* Color Selection */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-sm text-foreground">Colors</h2>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <AnimatePresence mode="wait">
                    {filteredColorSwatches.map((swatch, index) => (
                      <motion.div key={swatch._id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: index * 0.05 }} className="relative group">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-12 h-12 rounded-xl border-2 transition-all duration-300 ${selectedColor === swatch.hexCode ? "ring-4 ring-primary/50 border-primary" : "border-border"}`}
                              style={{ backgroundColor: swatch.hexCode }}
                              onClick={() => {
                                if (imageLoading[swatch._id]) return;
                                setImageLoading((prev) => ({ ...prev, [swatch._id]: true }));
                                const img = new Image();
                                img.onload = () => {
                                  handleUpdateColor(swatch.hexCode, swatch.imageUrl);
                                  setImageLoading((prev) => ({ ...prev, [swatch._id]: false }));
                                };
                                img.onerror = () => {
                                  toast({ title: "Image Load Error", description: `Failed to load ${swatch.name} color`, variant: "destructive" });
                                  setImageLoading((prev) => ({ ...prev, [swatch._id]: false }));
                                };
                                img.src = swatch.imageUrl;
                              }}
                              disabled={imageLoading[swatch._id]}
                            >
                              {imageLoading[swatch._id] && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary mx-auto" />}
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom"><p>{swatch.name}</p></TooltipContent>
                        </Tooltip>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </TooltipProvider>
        )}
      </div>
      <button onClick={onClose} className="w-full mt-4 p-2 bg-primary text-primary-foreground rounded-md">
        Apply Style & Close
      </button>
    </motion.div>
  );
};

export default StylePopup;
