import React, { useEffect, forwardRef } from 'react';
import Canvas from 'react-native-canvas';
import { useEditorStore } from '../../store/editorStore';

const CanvasWrapper = forwardRef<Canvas>((props, ref) => {
  const { texts, images } = useEditorStore();

  useEffect(() => {
    const canvas = (ref as React.RefObject<Canvas>)?.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = 500;
      canvas.height = 500;

      const draw = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw texts
        texts.forEach(text => {
          ctx.fillStyle = text.color;
          ctx.font = `${text.fontSize}px Arial`;
          ctx.fillText(text.content, text.x, text.y);
        });

        // Draw images
        images.forEach(image => {
          const img = new (canvas as any).Image();
          img.src = image.uri;
          img.onload = () => {
            ctx.drawImage(img, image.x, image.y, image.width, image.height);
          };
        });
      };

      draw();
    }
  }, [texts, images, ref]);

  return <Canvas ref={ref} style={{ width: '100%', height: '100%' }} />;
});

export default CanvasWrapper;
