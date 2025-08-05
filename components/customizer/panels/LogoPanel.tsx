"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/customizer/use-toast";
import { useEditorStore } from "@/store/editorStore";
import { ImagePlus } from "lucide-react";
import { fabric } from "fabric";
import { useRef, useState, useEffect } from "react";

interface LogoPanelProps {
  uploadInputRef: React.RefObject<HTMLInputElement>;
}

export default function LogoPanel({ uploadInputRef }: LogoPanelProps) {
  const { canvas } = useEditorStore();
  const { toast } = useToast();
  const [logos, setLogos] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch("/api/admin/logos");
        const data = await res.json();
        setLogos(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch logos",
          variant: "destructive",
        });
      }
    };
    fetchLogos();
  }, [toast]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    fabric.Image.fromURL(URL.createObjectURL(file), (img: any) => {
      img.scaleToWidth(150);
      img.set({
        left: 175,
        top: 175,
        cost: 5,
        type: "logo",
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const addTemplateLogo = (logoUrl: string) => {
    if (!canvas) return;

    fabric.Image.fromURL(logoUrl, (img: any) => {
      img.scaleToWidth(150);
      img.set({
        left: 175,
        top: 175,
        cost: 3,
        type: "logo",
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={() => uploadInputRef.current?.click()}
        >
          <ImagePlus className="mr-2" /> Upload Custom Logo
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={uploadInputRef}
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <Label className="mt-4">Template Logos</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {logos?.map((logo: any, index) => (
            <button
              key={index}
              className="border rounded p-2 hover:bg-accent"
              onClick={() => addTemplateLogo(logo.imageUrl)}
            >
              <img
                src={logo.imageUrl || "/placeholder.svg"}
                alt={logo.name}
                className="w-full h-auto"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
