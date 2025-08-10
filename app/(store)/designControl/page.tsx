"use client";

import React from "react";

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
import { Upload, Palette, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/customizer/use-toast";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorSwatch {
  _id: string;
  name: string;
  hexCode: string;
  imageUrl: string;
  createdAt: string;
  style: "slim" | "oversized";
}

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

interface LogoResponse {
  logos: Logo[];
  totalLogos: number;
  totalPages: number;
  currentPage: number;
}

export default function DesignControlPage() {
  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [logosPagination, setLogosPagination] = useState({
    totalLogos: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [loadingLogos, setLoadingLogos] = useState(false);
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
    fetchLogos(1);
    fetchColorSwatches();
  }, []);

  const fetchLogos = async (page: number = 1) => {
    setLoadingLogos(true);
    try {
      const response = await fetch(`/api/admin/logos?page=${page}&limit=10`);
      if (!response.ok) throw new Error("Failed to fetch logos");
      
      const data: LogoResponse = await response.json();
      setLogos(data.logos);
      setLogosPagination({
        totalLogos: data.totalLogos,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch logos: " + error,
        variant: "destructive",
      });
    } finally {
      setLoadingLogos(false);
    }
  };

  const fetchColorSwatches = async () => {
    try {
      const response = await fetch("/api/admin/color-swatches");
      if (!response.ok) throw new Error("Failed to fetch color swatches");
      
      const swatches = await response.json();
      setColorSwatches(swatches);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch color swatches: " + error,
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= logosPagination.totalPages) {
      fetchLogos(newPage);
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
      // Refresh logos - go to first page to see the newly uploaded logo
      fetchLogos(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo: " + error,
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
      fetchColorSwatches();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload color swatch: " + error,
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

      if (type === "logo") {
        // After deletion, check if current page is empty and adjust if needed
        const remainingLogos = logos.length - 1;
        if (remainingLogos === 0 && logosPagination.currentPage > 1) {
          // If this was the last logo on this page and we're not on page 1, go back one page
          fetchLogos(logosPagination.currentPage - 1);
        } else {
          // Otherwise, refresh current page
          fetchLogos(logosPagination.currentPage);
        }
      } else {
        fetchColorSwatches();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}: ` + error,
        variant: "destructive",
      });
    }
  };

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
                      <Popover>
                        <PopoverTrigger >
                          <Button variant="outline">Choose the Color</Button>
                        </PopoverTrigger>
                        <PopoverContent >
                          <SketchPicker
                          className="w-full mx-auto"
                            color={swatchForm.hexCode}
                            onChangeComplete={(color) =>
                              setSwatchForm({
                                ...swatchForm,
                                hexCode: color.hex,
                              })
                            }
                          />
                        </PopoverContent>
                      </Popover>
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
                      {uploadingSwatch ? "Uploading..." : "Upload Color Swatch"}
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
                  <CardTitle className="text-blue-500 flex justify-between items-center">
                    <span>Uploaded Logos</span>
                    <span className="text-sm font-normal text-gray-500">
                      {logosPagination.totalLogos} total
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingLogos ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="text-blue-500">Loading logos...</div>
                    </div>
                  ) : (
                    <>
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
                                width={580}
                                height={580}
                                className="object-contain aspect-square rounded"
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

                      {/* Pagination Controls */}
                      {logosPagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(logosPagination.currentPage - 1)}
                            disabled={logosPagination.currentPage === 1 || loadingLogos}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {/* Show page numbers */}
                            {Array.from({ length: logosPagination.totalPages }, (_, i) => i + 1)
                              .filter((page) => {
                                // Show current page, first page, last page, and pages around current
                                const current = logosPagination.currentPage;
                                return (
                                  page === 1 ||
                                  page === logosPagination.totalPages ||
                                  Math.abs(page - current) <= 1
                                );
                              })
                              .map((page, index, array) => (
                                <React.Fragment key={page}>
                                  {/* Show ellipsis if there's a gap */}
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                  )}
                                  <Button
                                    variant={logosPagination.currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    disabled={loadingLogos}
                                    className={`w-8 h-8 p-0 ${
                                      logosPagination.currentPage === page 
                                        ? "bg-blue-500 hover:bg-blue-600" 
                                        : "border-blue-200 hover:bg-blue-50"
                                    }`}
                                  >
                                    {page}
                                  </Button>
                                </React.Fragment>
                              ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(logosPagination.currentPage + 1)}
                            disabled={logosPagination.currentPage === logosPagination.totalPages || loadingLogos}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Page info */}
                      {logosPagination.totalLogos > 0 && (
                        <div className="text-center text-sm text-gray-500 mt-3">
                          Page {logosPagination.currentPage} of {logosPagination.totalPages}
                        </div>
                      )}
                    </>
                  )}
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
                            width={580}
                            height={580}
                            className="object-contain aspect-square rounded"
                          />
                        </div>
                        <h4 className="font-medium text-sm">{swatch.name} <strong>{swatch.style}</strong> </h4>
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