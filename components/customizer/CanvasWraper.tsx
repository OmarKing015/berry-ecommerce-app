"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "../../store/editorStore";

const CanvasWrapper = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvas } = useEditorStore();

  useEffect(() => {
    if (canvas && canvasRef.current) {
        // This is a bit of a hack to make fabricjs work with react's lifecycle.
        // FabricJS attaches a lot of properties to the canvas element itself,
        // so we need to make sure the canvas element is replaced when the component re-mounts.
        const canvasEl = canvasRef.current;
        const parent = canvasEl.parentNode;
        parent?.replaceChild(canvas.getElement(), canvasEl);
    }
  }, [canvas]);

  return <canvas id="canvas" ref={canvasRef} />;
};

export default CanvasWrapper;
