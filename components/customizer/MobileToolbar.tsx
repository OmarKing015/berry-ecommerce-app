"use client"

import {
  Type,
  Shirt,
  ImagePlus,
  ShoppingBag,
  Trash2,
  Undo,
  Redo,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StylePanel } from "./panels/StylePanel"
import { TextPanel } from "./panels/TextPanel"
import { LogoPanel } from "./panels/LogoPanel"
import { CreatePanel } from "./panels/CreatePanel"
import { useEditorStore } from "@/store/editorStore"

export default function MobileToolbar() {
  const { canvas, undo, redo, canUndo, canRedo } = useEditorStore()

  const deleteActiveObject = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around items-center h-16">
      {/* Text Tool Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto">
            <Type />
            <span className="text-xs">Text</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Text Tool</DialogTitle>
          </DialogHeader>
          <TextPanel />
        </DialogContent>
      </Dialog>

      {/* T-shirt Style Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto">
            <Shirt />
            <span className="text-xs">Style</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>T-shirt Style</DialogTitle>
          </DialogHeader>
          <StylePanel />
        </DialogContent>
      </Dialog>

      {/* Logo/Icon Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto">
            <ImagePlus />
            <span className="text-xs">Logo</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logo/Icon</DialogTitle>
          </DialogHeader>
          <LogoPanel />
        </DialogContent>
      </Dialog>

      {/* Undo/Redo/Delete controls */}
      <Button variant="ghost" onClick={undo} disabled={!canUndo}>
        <Undo />
      </Button>
      <Button variant="ghost" onClick={redo} disabled={!canRedo}>
        <Redo />
      </Button>
      <Button variant="ghost" onClick={deleteActiveObject}>
        <Trash2 />
      </Button>

      {/* Create Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto">
            <ShoppingBag />
            <span className="text-xs">Create</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create T-shirt</DialogTitle>
          </DialogHeader>
          <CreatePanel />
        </DialogContent>
      </Dialog>
    </div>
  )
}
