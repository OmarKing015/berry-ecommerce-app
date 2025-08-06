"use client";

import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { motion } from "framer-motion";
import { ImagePlus, Star, Loader2, ImageIcon } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useToast } from "@/components/customizer/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LogoPopupProps {
  onClose: () => void;
}

interface TemplateLogo {
  _id: string;
  name: string;
  imageUrl: string;
}

const LogoPopup = ({ onClose }: LogoPopupProps) => {
  const { canvas, addHighQualityImage } = useEditorStore();
  const { toast } = useToast();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [logos, setLogos] = useState<TemplateLogo[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [templateLogoLoading, setTemplateLogoLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchLogos = async () => {
      setIsFetching(true);
      try {
        const res = await fetch("/api/admin/logos");
        const data = await res.json();
        setLogos(data);
      } catch (error) {
        toast({
          title: "Connection Error",
          description: "Unable to load template logos.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchLogos();
  }, [toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file.",
        variant: "destructive",
      });
      return;
    }

    addHighQualityImage(file);
    setIsUploading(true);
    fabric.Image.fromURL(URL.createObjectURL(file), (img: any) => {
      img.scaleToWidth(150);
      img.set({ left: 175, top: 175, cost: 5, type: "logo" });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      setIsUploading(false);
      onClose();
    }, { crossOrigin: "anonymous" });
  };

  const addTemplateLogo = async (logo: TemplateLogo) => {
    if (!canvas) return;
    setTemplateLogoLoading(prev => ({ ...prev, [logo._id]: true }));
    try {
      const response = await fetch(logo.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], logo.name, { type: blob.type });
      addHighQualityImage(file);

      fabric.Image.fromURL(logo.imageUrl, (img: any) => {
        img.scaleToWidth(150);
        img.set({ left: 175, top: 175, cost: 3, type: "logo" });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setTemplateLogoLoading(prev => ({ ...prev, [logo._id]: false }));
        onClose();
      }, { crossOrigin: "anonymous" });
    } catch (error) {
      toast({
        title: "Logo Load Error",
        description: "Failed to load template logo.",
        variant: "destructive",
      });
      setTemplateLogoLoading(prev => ({ ...prev, [logo._id]: false }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed top-0 left-0 h-full w-80 bg-background/90 backdrop-blur-lg border-r border-border/50 z-20 p-6 flex flex-col"
    >
      <div className="flex-grow overflow-y-auto space-y-4">
        <h2 className="text-xl font-bold mb-4">Add Logo</h2>

        <Button variant="outline" onClick={() => uploadInputRef.current?.click()} disabled={isUploading} className="w-full">
          {isUploading ? <Loader2 className="animate-spin mr-2" /> : <ImagePlus className="mr-2" />}
          Upload Custom Logo
        </Button>
        <input type="file" accept="image/*" ref={uploadInputRef} onChange={handleImageUpload} className="hidden" />

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Template Logos</Label>
          {isFetching ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <TooltipProvider>
            <div className="grid grid-cols-4 gap-3">
              {logos.map((logo) => (
                <Tooltip key={logo._id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square border-2 border-border rounded-lg p-1 hover:border-primary"
                      onClick={() => addTemplateLogo(logo)}
                      disabled={templateLogoLoading[logo._id]}
                    >
                      {templateLogoLoading[logo._id] ? <Loader2 className="animate-spin mx-auto" /> : <img src={logo.imageUrl} alt={logo.name} className="rounded" />}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent><p>{logo.name}</p></TooltipContent>
                </Tooltip>
              ))}
            </div>
            </TooltipProvider>
          )}
          {logos.length === 0 && !isFetching && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="mx-auto mb-2" />
              <p>No template logos</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={onClose} className="w-full mt-4 p-2 bg-secondary text-secondary-foreground rounded-md">
        Close
      </button>
    </motion.div>
  );
};

export default LogoPopup;
