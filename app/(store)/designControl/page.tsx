"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Upload, Palette, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { SketchPicker } from "react-color"
import type { ColorResult } from "react-color"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/customizer/use-toast"

interface ColorSwatch {
  _id: string
  name: string
  hexCode: string
  imageUrl: string
  createdAt: string
  style: "slim" | "oversized"
}

interface Logo {
  _id: string
  name: string
  imageUrl: string
  createdAt: string
}

const PAGE_SIZE = 10

export default function DesignControlPage() {
  const { toast } = useToast()

  const [colorSwatches, setColorSwatches] = useState<ColorSwatch[]>([])
  const [logos, setLogos] = useState<Logo[]>([])

  // pagination
  const [logosPage, setLogosPage] = useState(1)
  const [swatchesPage, setSwatchesPage] = useState(1)

  // upload state
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSwatch, setUploadingSwatch] = useState(false)

  // form states
  const [logoForm, setLogoForm] = useState<{ name: string; file: File | null }>({
    name: "",
    file: null,
  })
  const [swatchForm, setSwatchForm] = useState<{
    name: string
    file: File | null
    style: "slim" | "oversized"
    hexCode: string
  }>({
    name: "",
    file: null,
    style: "slim",
    hexCode: "",
  })

  useEffect(() => {
    void fetchData()
  }, [])

  // Clamp current pages when data changes (e.g., after delete)
  useEffect(() => {
    setLogosPage((p) => clampPage(p, logos.length, PAGE_SIZE))
  }, [logos.length])
  useEffect(() => {
    setSwatchesPage((p) => clampPage(p, colorSwatches.length, PAGE_SIZE))
  }, [colorSwatches.length])

  const totalLogoPages = Math.max(1, Math.ceil(logos.length / PAGE_SIZE))
  const totalSwatchPages = Math.max(1, Math.ceil(colorSwatches.length / PAGE_SIZE))

  const pagedLogos = useMemo(() => {
    const start = (logosPage - 1) * PAGE_SIZE
    return logos.slice(start, start + PAGE_SIZE)
  }, [logos, logosPage])

  const pagedSwatches = useMemo(() => {
    const start = (swatchesPage - 1) * PAGE_SIZE
    return colorSwatches.slice(start, start + PAGE_SIZE)
  }, [colorSwatches, swatchesPage])

  async function fetchData() {
    try {
      const [swatchesRes, logosRes] = await Promise.all([fetch("/api/admin/color-swatches"), fetch("/api/admin/logos")])

      const swatchesJson = (await safeJson(swatchesRes)) as unknown
      const logosJson = (await safeJson(logosRes)) as unknown

      if (isColorSwatchArray(swatchesJson)) {
        setColorSwatches(swatchesJson)
      } else {
        setColorSwatches([])
        console.warn("Expected array<ColorSwatch> for color swatches, got:", swatchesJson)
      }

      if (isLogoArray(logosJson)) {
        setLogos(logosJson)
      } else {
        setLogos([])
        console.warn("Expected array<Logo> for logos, got:", logosJson)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data: " + String(error),
        variant: "destructive",
      })
    }
  }

  async function uploadLogo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!logoForm.file || !logoForm.name.trim()) return

    setUploadingLogo(true)
    const formData = new FormData()
    formData.append("file", logoForm.file)
    formData.append("name", logoForm.name.trim())

    try {
      const response = await fetch("/api/admin/logos", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      })
      setLogoForm({ name: "", file: null })
      await fetchData()
      setLogosPage(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo: " + String(error),
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  async function uploadColorSwatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!swatchForm.file || !swatchForm.name.trim() || !swatchForm.hexCode || !swatchForm.style) return

    setUploadingSwatch(true)
    const formData = new FormData()
    formData.append("file", swatchForm.file)
    formData.append("name", swatchForm.name.trim())
    formData.append("hexCode", swatchForm.hexCode)
    formData.append("style", swatchForm.style)

    try {
      const response = await fetch("/api/admin/color-swatches", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Upload failed")
      toast({
        title: "Success",
        description: "Color swatch uploaded successfully",
      })
      setSwatchForm({ name: "", file: null, style: "slim", hexCode: "" })
      await fetchData()
      setSwatchesPage(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload color swatch: " + String(error),
        variant: "destructive",
      })
    } finally {
      setUploadingSwatch(false)
    }
  }

  async function deleteItem(type: "logo" | "swatch", id: string) {
    try {
      const response = await fetch(`/api/admin/${type === "logo" ? "logos" : "color-swatches"}/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Delete failed")
      toast({
        title: "Success",
        description: `${type === "logo" ? "Logo" : "Color swatch"} deleted successfully`,
      })
      await fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${type}: ` + String(error),
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="bg-blue-500 text-white p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Design Control</h1>
        <p className="text-blue-100 mt-2">Manage logos and color swatches</p>
      </header>

      <section className="container mx-auto max-w-7xl p-4 md:p-6">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="w-full bg-blue-50 grid grid-cols-1 sm:inline-flex sm:gap-2 sm:w-auto">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white w-full sm:w-auto"
            >
              <Palette className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">Upload Logo</CardTitle>
                  <CardDescription>Add new template logos for t-shirts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={uploadLogo} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="logo-name">Logo Name</Label>
                      <Input
                        id="logo-name"
                        value={logoForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setLogoForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter logo name"
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="logo-file">Logo File</Label>
                      <Input
                        id="logo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setLogoForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))
                        }
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>
                    <Button type="submit" disabled={uploadingLogo} className="w-full bg-blue-500 hover:bg-blue-600">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Color Swatch Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">Upload Color Swatch</CardTitle>
                  <CardDescription>Add new color options for t-shirts</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={uploadColorSwatch} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="swatch-name">Color Name</Label>
                      <Input
                        id="swatch-name"
                        value={swatchForm.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSwatchForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter color name"
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label id="color-picker-label">Color</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" aria-labelledby="color-picker-label">
                            Choose the Color
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-2">
                          <SketchPicker
                            color={swatchForm.hexCode || "#000000"}
                            onChangeComplete={(color: ColorResult) =>
                              setSwatchForm((prev) => ({ ...prev, hexCode: color.hex }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      {swatchForm.hexCode ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div
                            className="h-4 w-4 rounded border"
                            style={{ backgroundColor: swatchForm.hexCode }}
                            aria-label="Selected color preview"
                          />
                          <span>{swatchForm.hexCode}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <Label>Style</Label>
                      <RadioGroup
                        value={swatchForm.style}
                        onValueChange={(value: string) =>
                          setSwatchForm((prev) => ({
                            ...prev,
                            style: (value as "slim" | "oversized") ?? "slim",
                          }))
                        }
                        className="flex flex-wrap gap-4"
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

                    <div className="grid gap-2">
                      <Label htmlFor="swatch-file">Color Image</Label>
                      <Input
                        id="swatch-file"
                        type="file"
                        accept="image/*"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSwatchForm((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }))
                        }
                        className="border-blue-200 focus-visible:ring-blue-500"
                      />
                    </div>

                    <Button type="submit" disabled={uploadingSwatch} className="w-full bg-blue-500 hover:bg-blue-600">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingSwatch ? "Uploading..." : "Upload Color Swatch"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Logos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">Uploaded Logos</CardTitle>
                  <CardDescription>
                    Showing {pagedLogos.length} of {logos.length} logos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {logos.length === 0 ? (
                    <EmptyState title="No logos yet" subtitle="Upload a logo to get started." />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {pagedLogos.map((logo) => (
                          <div key={logo._id} className="border border-blue-200 rounded-lg p-3 flex flex-col">
                            <div className="relative mb-2 rounded overflow-hidden aspect-square bg-blue-50">
                              <Image
                                src={
                                  (logo.imageUrl && logo.imageUrl.length > 0
                                    ? logo.imageUrl
                                    : "/placeholder.svg?height=580&width=580&query=logo%20placeholder") as string
                                }
                                alt={logo.name}
                                width={580}
                                height={580}
                                className="object-contain w-full h-full"
                                unoptimized
                              />
                            </div>
                            <h4 className="font-medium text-sm truncate" title={logo.name}>
                              {logo.name}
                            </h4>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void deleteItem("logo", logo._id)}
                              className="w-full mt-2"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                      <PaginationControls
                        currentPage={logosPage}
                        totalItems={logos.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setLogosPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Color Swatches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-500">Color Swatches</CardTitle>
                  <CardDescription>
                    Showing {pagedSwatches.length} of {colorSwatches.length} swatches
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {colorSwatches.length === 0 ? (
                    <EmptyState title="No color swatches yet" subtitle="Upload a color swatch to get started." />
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {pagedSwatches.map((swatch) => (
                          <div key={swatch._id} className="border border-blue-200 rounded-lg p-3 flex flex-col">
                            <div className="relative mb-2 rounded overflow-hidden aspect-square bg-blue-50">
                              <Image
                                src={
                                  (swatch.imageUrl && swatch.imageUrl.length > 0
                                    ? swatch.imageUrl
                                    : "/placeholder.svg?height=580&width=580&query=color%20swatch%20placeholder") as string
                                }
                                alt={swatch.name}
                                width={580}
                                height={580}
                                className="object-contain w-full h-full"
                                unoptimized
                              />
                            </div>
                            <h4 className="font-medium text-sm">
                              <span className="truncate block" title={swatch.name}>
                                {swatch.name}
                              </span>
                              <span className="text-xs text-muted-foreground"> {swatch.style}</span>
                            </h4>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void deleteItem("swatch", swatch._id)}
                              className="w-full mt-2"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        ))}
                      </div>
                      <PaginationControls
                        currentPage={swatchesPage}
                        totalItems={colorSwatches.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setSwatchesPage}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}

function clampPage(page: number, totalItems: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  return Math.min(Math.max(1, page), totalPages)
}

async function safeJson(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isLogoArray(data: unknown): data is Logo[] {
  return Array.isArray(data) && data.every(isLogo)
}

function isLogo(item: unknown): item is Logo {
  if (!item || typeof item !== "object") return false
  const o = item as Record<string, unknown>
  return (
    typeof o._id === "string" &&
    typeof o.name === "string" &&
    typeof o.imageUrl === "string" &&
    typeof o.createdAt === "string"
  )
}

function isColorSwatchArray(data: unknown): data is ColorSwatch[] {
  return Array.isArray(data) && data.every(isColorSwatch)
}

function isColorSwatch(item: unknown): item is ColorSwatch {
  if (!item || typeof item !== "object") return false
  const o = item as Record<string, unknown>
  return (
    typeof o._id === "string" &&
    typeof o.name === "string" &&
    typeof o.hexCode === "string" &&
    typeof o.imageUrl === "string" &&
    typeof o.createdAt === "string" &&
    (o.style === "slim" || o.style === "oversized")
  )
}

function PaginationControls(props: {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const { currentPage, totalItems, pageSize, onPageChange } = props
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (totalPages <= 1) return null

  // Build a compact page list: 1 ... prev current next ... last
  const pages = getCompactPages(currentPage, totalPages)

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </Button>
          ) : (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground select-none">
              …
            </span>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function getCompactPages(current: number, total: number): Array<number | "..."> {
  const pages: Array<number | "..."> = []
  const add = (p: number | "...") => pages.push(p)

  const neighbors = 1 // how many pages to show on each side

  add(1)
  if (current - neighbors > 2) add("...")
  for (let p = Math.max(2, current - neighbors); p <= Math.min(total - 1, current + neighbors); p++) {
    add(p)
  }
  if (current + neighbors < total - 1) add("...")
  if (total > 1) add(total)

  // Deduplicate in case of overlaps
  return pages.filter((p, i, arr) => (typeof p === "number" ? arr.indexOf(p) === i : true))
}

function EmptyState(props: { title: string; subtitle?: string }) {
  return (
    <div className="border rounded-md p-6 text-center text-muted-foreground">
      <div className="text-base font-medium text-foreground">{props.title}</div>
      {props.subtitle ? <div className="text-sm mt-1">{props.subtitle}</div> : null}
    </div>
  )
}
