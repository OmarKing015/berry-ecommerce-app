import { create } from "zustand"
import type { fabric } from "fabric"
import { costEngine } from "@/lib/costEngine"

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
}

const initialState = {
  canvas: null,
  shirtStyle: "slim" as "slim" | "oversized",
  shirtImageUrl: null,
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
    canvas.cornerColor = "rgb(59, 130, 246)"
    canvas.cornerSize = 8
    canvas.transparentCorners = false
    canvas.cornerStyle = "circle"

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
}))
