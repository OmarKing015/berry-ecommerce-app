"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Palette, Trash2 } from "lucide-react";
import { toast } from "@/components/customizer/use-toast";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SketchPicker } from "react-color";

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  style: "slim" | "oversized";
}

interface Logo {
  _id:string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export default function DesignControlPage() {
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSwatch, setUploadingSwatch] = useState(false);

  // Form states
  const [logoForm, setLogoForm] = useState({
    name: "",
    file: null as File | null,
  });
  const [swatchForm, setSwatchForm] = useState({
    name: "",
    file: null as File | null,
    style: "slim" as "slim" | "oversized",
    hexCode: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [swatchesRes, logosRes] = await Promise.all([
        fetch("/api/admin/color-swatches"),
        fetch("/api/admin/logos"),
      ]);

      const swatches = await swatchesRes.json();
      const logoData = await logosRes.json();

      setColorSwatches(swatches);
      setLogos(logoData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data" + error,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoForm.file || !logoForm.name) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", logoForm.file);
    formData.append("name", logoForm.name);

    try {
      const response = await fetch("/api/admin/logos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });

      setLogoForm({ name: "", file: null });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo" + error,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadColorSwatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !swatchForm.file ||
      !swatchForm.name ||
      !swatchForm.hexCode ||
      !swatchForm.style
    )
      return;

    setUploadingSwatch(true);
    const formData = new FormData();
    formData.append("file", swatchForm.file);
    formData.append("name", swatchForm.name);
    formData.append("hexCode", swatchForm.hexCode);
    formData.append("style", swatchForm.style);

    try {
      const response = await fetch("/api/admin/color-swatches", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      toast({
        title: "Success",
        description: "Color swatch uploaded successfully",
      });

      setSwatchForm({ name: "", file: null, style: "slim", hexCode: "" });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload color swatch" + error,
        variant: "destructive",
      });
    } finally {
      setUploadingSwatch(false);
    }
  };

  const deleteItem = async (type: "logo" | "swatch", id: string) => {
    try {
      const response = await fetch(
        `/api/admin/${type === "logo" ? "logos" : "color-swatches"}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      toast({
        title: "Success",
        description: `${
          type === "logo" ? "Logo" : "Color swatch"
        } deleted successfully`,
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}` + error,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-blue-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-500 text-white p-6">
        <h1 className="text-3xl font-bold">Design Control</h1>
        <p className="text-blue-100 mt-2">Manage logos, and color swatches</p>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-blue-50">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Palette className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">Upload Logo</CardTitle>
                  <CardDescription>
                    Add new template logos for t-shirts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={uploadLogo} className="space-y-4">
                    <div>
                      <Label htmlFor="logo-name">Logo Name</Label>
                      <Input
                        id="logo-name"
                        value={logoForm.name}
                        onChange={(e) =>
                          setLogoForm({ ...logoForm, name: e.target.value })
                        }
                        placeholder="Enter logo name"
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="logo-file">Logo File</Label>
                      <Input
                        id="logo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setLogoForm({
                            ...logoForm,
                            file: e.target.files?.[0] || null,
                          })
                        }
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={uploadingLogo}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Color Swatch Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">
                    Upload Color Swatch
                  </CardTitle>
                  <CardDescription>
                    Add new color options for t-shirts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={uploadColorSwatch} className="space-y-4">
                    <div>
                      <Label htmlFor="swatch-name">Color Name</Label>
                      <Input
                        id="swatch-name"
                        value={swatchForm.name}
                        onChange={(e) =>
                          setSwatchForm({
                            ...swatchForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter color name"
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label>Color</Label>
                      <SketchPicker
                        color={swatchForm.hexCode}
                        onChangeComplete={(color) =>
                          setSwatchForm({ ...swatchForm, hexCode: color.hex })
                        }
                      />
                    </div>
                    <div>
                      <Label>Style</Label>
                      <RadioGroup
                        value={swatchForm.style}
                        onValueChange={(value: "slim" | "oversized") =>
                          setSwatchForm({ ...swatchForm, style: value })
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="slim" id="slim" />
                          <Label htmlFor="slim">Slim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="oversized" id="oversized" />
                          <Label htmlFor="oversized">Oversized</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="swatch-file">Color Image</Label>
                      <Input
                        id="swatch-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setSwatchForm({
                            ...swatchForm,
                            file: e.target.files?.[0] || null,
                          })
                        }
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={uploadingSwatch}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingSwatch
                        ? "Uploading..."
                        : "Upload Color Swatch"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Display Uploaded Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Logos Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">
                    Uploaded Logos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {logos.map((logo) => (
                      <div
                        key={logo._id}
                        className="border border-blue-200 rounded-lg p-3"
                      >
                        <div className="aspect-square relative mb-2">
                          <Image
                            src={logo.imageUrl || "/placeholder.svg"}
                            alt={logo.name}
                            width={100}
                            height={100}
                            className="object-contain rounded"
                          />
                        </div>
                        <h4 className="font-medium text-sm">{logo.name}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteItem("logo", logo._id)}
                          className="w-full mt-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Swatches Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">
                    Color Swatches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {colorSwatches.map((swatch) => (
                      <div
                        key={swatch._id}
                        className="border border-blue-200 rounded-lg p-3"
                      >
                        <div className="aspect-square relative mb-2">
                          <Image
                            src={swatch.imageUrl || "/placeholder.svg"}
                            alt={swatch.name}
                            width={100}
                            height={100}
                            className="object-contain rounded"
                          />
                        </div>
                        <h4 className="font-medium text-sm">{swatch.name}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteItem("swatch", swatch._id)}
                          className="w-full mt-2"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
