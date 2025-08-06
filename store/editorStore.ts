import { create } from "zustand"
import type { fabric } from "fabric"
import { costEngine } from "@/lib/costEngine"
import JSZip from "jszip"
import useBasketStore from "./store"
import { toast } from "@/components/customizer/use-toast"


interface ColorSwatch {
  _id: string
  name: string
  hexCode?: string
  imageUrl: string
  createdAt: string
}

export interface EditorState {
  canvas: fabric.Canvas | null
  setCanvas: (canvas: fabric.Canvas) => void
  shirtStyle: "slim" | "oversized"
  toggleShirtStyle: () => void
  shirtImageUrl: string | null
  setShirtImageUrl: (url: string) => void
  shirtColor: string
  updateShirtColor: (color: string) => void
  selectedColorSwatch: ColorSwatch | null
  setSelectedColorSwatch: (colorSwatch: ColorSwatch) => void
  totalCost: number
  setTotalCost: (cost: number) => void
  history: string[]
  setHistory: (history: string[]) => void
  historyIndex: number
  setHistoryIndex: (index: any) => void
  saveCanvasState: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: () => void
  highQualityImages: File[]
  addHighQualityImage: (image: File) => void
  addToBasket: (size: string) => Promise<void>
}

const initialState = {
  canvas: null,
  shirtStyle: "slim" as "slim" | "oversized",
  shirtImageUrl: null,
  shirtColor: "#FFFFFF",
  selectedColorSwatch: null,
  totalCost: 6.0,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  highQualityImages: [],
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setCanvas: (canvas) => {
    set({ canvas })

    // Enhanced canvas styling for modern look
    canvas.selectionColor = "rgba(59, 130, 246, 0.1)"
    canvas.selectionBorderColor = "rgb(59, 130, 246)"
    canvas.selectionLineWidth = 2
    canvas.selectionDashArray = [5, 5]
    canvas.selectionBorderColor = "rgb(59, 130, 246)"
 
    // Initialize history with the initial canvas state
    const initialStateJson = JSON.stringify(canvas.toJSON(["cost", "type"]))
    set({ history: [initialStateJson], historyIndex: 0, canUndo: false, canRedo: false })

    // Set initial cost
    const { totalCost } = costEngine.calculate(canvas.getObjects())
    set({ totalCost: totalCost })

    // Add event listeners for canvas modifications with debouncing
    let saveTimeout: NodeJS.Timeout
    const debouncedSave = () => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        get().saveCanvasState()
      }, 300)
    }

    canvas.on("object:added", debouncedSave)
    canvas.on("object:modified", debouncedSave)
    canvas.on("object:removed", debouncedSave)

    canvas.on("after:render", () => {
      const { totalCost } = costEngine.calculate(canvas.getObjects())
      if (totalCost !== get().totalCost) {
        set({ totalCost: totalCost })
      }
    })

    // Add smooth animations to object interactions
    canvas.on("selection:created", (e) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0]
        obj.animate("scaleX", obj.scaleX || 1 * 1.05, {
          duration: 150,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: () => {
            obj.animate("scaleX", obj.scaleX || 1 / 1.05, {
              duration: 150,
              onChange: canvas.renderAll.bind(canvas),
            })
          },
        })
      }
    })
  },

  toggleShirtStyle: () =>
    set((state) => ({
      shirtStyle: state.shirtStyle === "slim" ? "oversized" : "slim",
    })),

  setShirtImageUrl: (url: string) => set({ shirtImageUrl: url }),
  updateShirtColor: (color: string) => set({ shirtColor: color }),
  setSelectedColorSwatch: (colorSwatch: ColorSwatch) => set({ selectedColorSwatch: colorSwatch }),
  setTotalCost: (cost) => set({ totalCost: cost }),
  setHistory: (history) =>
    set({
      history,
      canUndo: get().historyIndex > 0,
      canRedo: get().historyIndex < history.length - 1,
    }),
  setHistoryIndex: (index) =>
    set({
      historyIndex: index,
      canUndo: index > 0,
      canRedo: index < get().history.length - 1,
    }),

  saveCanvasState: () => {
    const { canvas, history, historyIndex, setHistory, setHistoryIndex } = get()
    if (canvas) {
      const json = JSON.stringify(canvas.toJSON(["cost", "type"]))
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(json)

      // Limit history to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift()
      }

      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  },

  undo: () => {
    const { history, historyIndex, canvas, setHistoryIndex, setTotalCost } = get()
    if (historyIndex > 0 && canvas) {
      const newIndex = historyIndex - 1
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll()
        const objects = canvas.getObjects()
        const cost = costEngine.calculate(objects)
        setTotalCost(cost.totalCost)
        setHistoryIndex(newIndex)
      })
    }
  },

  redo: () => {
    const { history, historyIndex, canvas, setHistoryIndex, setTotalCost } = get()
    if (historyIndex < history.length - 1 && canvas) {
      const newIndex = historyIndex + 1
      canvas.loadFromJSON(JSON.parse(history[newIndex]), () => {
        canvas.renderAll()
        const objects = canvas.getObjects()
        const cost = costEngine.calculate(objects)
        setTotalCost(cost.totalCost)
        setHistoryIndex(newIndex)
      })
    }
  },

  canUndo: false,
  canRedo: false,
  reset: () => set(initialState),
  addHighQualityImage: (image) =>
    set((state) => ({
      highQualityImages: [...state.highQualityImages, image],
    })),
  addToBasket: async (selectedSize: string) => {
    const { canvas, shirtImageUrl, shirtStyle, totalCost, shirtColor } = get()
    const { addItem } = useBasketStore.getState()

    if (!selectedSize) {
      toast({ title: "Size Required", description: "Please select a size.", variant: "destructive" })
      return
    }
    if (!canvas) {
      toast({ title: "Canvas Not Ready", description: "The editor is not fully loaded.", variant: "destructive" })
      return
    }
    if (!shirtImageUrl) {
      toast({ title: "Color Required", description: "Please select a t-shirt color.", variant: "destructive" })
      return
    }

    try {
      const designId = `design_${Date.now()}`
      const canvasDataUrl = canvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })

      const fullDesignBlob = await generateFullDesign(shirtImageUrl, canvas)
      const elementImages = await generateElementImages(canvas)

      const zip = new JSZip()
      zip.file("full_design.png", fullDesignBlob)
      zip.file("full_design_transparent.png", dataURLtoBlob(canvasDataUrl))

      const elementsFolder = zip.folder("elements")
      elementImages.forEach((element) => {
        elementsFolder?.file(element.name, element.blob)
      })

      const designInfo = {
        id: designId,
        name: `Custom T-Shirt - ${selectedSize} - ${shirtColor} - ${shirtStyle}`,
        size: selectedSize,
        color: shirtColor,
        style: shirtStyle,
        elements: canvas.getObjects().length,
        createdAt: new Date().toISOString(),
        canvasData: canvas.toJSON(["cost", "type"]),
        canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
        baseShirtUrl: shirtImageUrl,
      }

      zip.file("design_info.json", JSON.stringify(designInfo, null, 2))
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const slug = `custom-tshirt-${Date.now()}`
      const fileName = `${slug}.zip`

      const formData = new FormData()
      formData.append("name", "Custom T-shirt")
      formData.append("price", totalCost.toString())
      formData.append("size", selectedSize)
      formData.append("slug", slug)
      formData.append("file", zipBlob, fileName)
      const fullDesignFile = new File([fullDesignBlob], "product-image.png", { type: "image/png" })
      formData.append("imageData", fullDesignFile)

      const response = await fetch("/api/custom-product", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create custom product.")
      }

      const newProduct = await response.json()
      addItem(newProduct, selectedSize, 0)

      toast({
        title: "🎉 Masterpiece Created!",
        description: "Your custom T-shirt has been added to your basket.",
      })
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  },
}))

// Helper functions for addToBasket
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const waitForCanvasRender = (canvas: fabric.Canvas): Promise<void> => {
  return new Promise((resolve) => {
    canvas.renderAll()
    requestAnimationFrame(() => {
      setTimeout(resolve, 100)
    })
  })
}

const generateElementImages = async (canvas: fabric.Canvas): Promise<{ name: string; blob: Blob }[]> => {
  const elements: { name: string; blob: Blob }[] = []
  const objects = canvas.getObjects()

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i]
    try {
      const bounds = obj.getBoundingRect()
      const padding = 20
      const tempCanvasElement = document.createElement("canvas")
      tempCanvasElement.width = bounds.width + padding * 2
      tempCanvasElement.height = bounds.height + padding * 2
      const tempCanvas = new fabric.Canvas(tempCanvasElement, {
        width: bounds.width + padding,
        height: bounds.height + padding,
        backgroundColor: "transparent",
      })

      const clonedObj = await new Promise<fabric.Object>((resolve, reject) => {
        obj.clone((cloned: fabric.Object) => {
          if (cloned) resolve(cloned)
          else reject(new Error("Failed to clone object"))
        })
      })

      clonedObj.set({ left: padding, top: padding })
      tempCanvas.add(clonedObj)
      await waitForCanvasRender(tempCanvas)

      const dataURL = tempCanvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })
      const blob = dataURLtoBlob(dataURL)
      // @ts-ignore
      const elementType = obj.type || "element"
      let elementName = `${elementType}_${i + 1}`
      if (obj.type === "i-text") { // @ts-ignore
        elementName = `text_${obj.text?.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "_")}_${i + 1}`
      } else if (obj.type === "image") {
        elementName = `logo_${i + 1}`
      }
      elements.push({ name: `${elementName}.png`, blob })
      tempCanvas.dispose()
    } catch (error) {
      console.error(`Error processing object ${i}:`, error)
    }
  }
  return elements
}

const generateFullDesign = async (imageUrl: string, canvas: fabric.Canvas): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvasWidth = canvas.getWidth()
    const canvasHeight = canvas.getHeight()
    const tempCanvas = new fabric.StaticCanvas(null, { width: canvasWidth, height: canvasHeight })

    fabric.Image.fromURL(imageUrl, (bgImg) => {
      if (!bgImg) return reject(new Error("Failed to load background image."))
      const imgWidth = bgImg.width || canvasWidth
      const imgHeight = bgImg.height || canvasHeight
      const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)
      tempCanvas.setBackgroundImage(bgImg, tempCanvas.renderAll.bind(tempCanvas), {
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
      })

      const objects = canvas.getObjects()
      const clonePromises = objects.map((obj) => new Promise<fabric.Object>((resolveClone, rejectClone) => {
        obj.clone((cloned: fabric.Object) => {
          if (cloned) resolveClone(cloned)
          else rejectClone(new Error("Failed to clone object"))
        })
      }))

      Promise.all(clonePromises).then((clonedObjects) => {
        clonedObjects.forEach((clonedObj) => tempCanvas.add(clonedObj))
        tempCanvas.renderAll()
        const dataURL = tempCanvas.toDataURL({ format: "png", quality: 1, multiplier: 2 })
        if (!dataURL || dataURL === "data:,") return reject(new Error("Failed to generate canvas image"))
        resolve(dataURLtoBlob(dataURL))
      }).catch(reject)
    }, { crossOrigin: "anonymous" })
  })
}
