"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorStore } from "@/store/editorStore";
import { Undo, Redo } from "lucide-react";

export default function HistoryPanel() {
  const { undo, redo, canUndo, canRedo } = useEditorStore();

  return (
    <TooltipProvider>
      <div className="flex-grow flex flex-col gap-4">
        <h2 className="font-semibold text-sm text-muted-foreground">History</h2>
        <div className="grid grid-cols-2 gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={undo} disabled={!canUndo}>
                <Undo />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={redo} disabled={!canRedo}>
                <Redo />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
