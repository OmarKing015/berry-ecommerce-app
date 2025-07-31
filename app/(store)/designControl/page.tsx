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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Upload, FileText, Palette, Trash2 } from "lucide-react";
import { toast } from "@/components/customizer/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";

interface ZippedFile {
  _id: string;
  orderNumber: string;
  userName: string;
  fileName: string;
  createdAt: string;
  fileSize: number;
  status: string;
}

interface ColorSwatch {
  _id: string;
  name: string;
  // hexCode: string;
  imageUrl: string;
  createdAt: string;
}

interface Logo {
  _id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [zippedFiles, setZippedFiles] = useState<ZippedFile[]>([]);
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
  });

  useEffect(() => {
    console.log(zippedFiles);
  }, [zippedFiles]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesRes, swatchesRes, logosRes] = await Promise.all([
        fetch("/api/admin/files"),
        fetch("/api/admin/color-swatches"),
        fetch("/api/admin/logos"),
      ]);

      const files: [] = await filesRes.json();
      const swatches = await swatchesRes.json();
      const logoData = await logosRes.json();

      setZippedFiles(files);
      setColorSwatches(swatches);
      setLogos(logoData);
      console.log(files);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data" + error,
        variant: "destructive",
      });
    } finally {
      console.log(zippedFiles);
      setLoading(false);
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/admin/files/${fileId}/download`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file"+ error,
        variant: "destructive",
      });
    }
  };

  const uploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoForm.file || !logoForm.name ) return;

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
        description: "Failed to upload logo"+ error,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadColorSwatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swatchForm.file || !swatchForm.name ) return;

    setUploadingSwatch(true);
    const formData = new FormData();
    formData.append("file", swatchForm.file);
    formData.append("name", swatchForm.name);

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

      setSwatchForm({ name: "", file: null });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload color swatch"+ error,
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
        description: `${type === "logo" ? "Logo" : "Color swatch"} deleted successfully`,
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
    <Protect role="admin">
      <div className="min-h-screen bg-white">
        <div className="bg-blue-500 text-white p-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-blue-100 mt-2">
            Manage files, logos, and color swatches
          </p>
        </div>

        <div className="container mx-auto p-6">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-blue-50">
              <TabsTrigger
                value="files"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Zipped Files
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">
                    Zipped Material Files
                  </CardTitle>
                  <CardDescription>
                    Manage and download zipped files uploaded by users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="text-blue-700">
                            Order Number
                          </TableHead>
                          <TableHead className="text-blue-700">
                            User Name
                          </TableHead>
                          <TableHead className="text-blue-700">
                            Upload Date
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zippedFiles?.map((file) => (
                          <TableRow key={file._id}>
                            <TableCell className="font-medium">
                              {file.orderNumber}
                            </TableCell>
                            <TableCell>{file.userName}</TableCell>
                            <TableCell>
                              {new Date(file.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() =>
                                  downloadFile(file._id, file.fileName)
                                }
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                      {/* <div>
                        <Label htmlFor="swatch-hex">Hex Code</Label>
                        <Input
                          id="swatch-hex"
                          value={swatchForm.hexCode}
                          onChange={(e) =>
                            setSwatchForm({
                              ...swatchForm,
                              hexCode: e.target.value,
                            })
                          }
                          placeholder="#000000"
                          className="border-blue-200 focus:border-blue-500"
                        />
                      </div> */}
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
                              fill
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
                              fill
                              className="object-contain rounded"
                            />
                          </div>
                          <h4 className="font-medium text-sm">{swatch.name}</h4>
                          {/* <p className="text-xs text-gray-500">
                            {swatch.hexCode}
                          </p> */}
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
    </Protect>
  );
}
