
/**
 * Trims the transparent whitespace from a canvas element.
 * Returns a new canvas element containing only the drawn content.
 */
export const trimCanvas = (sourceCanvas: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  // Scan for non-transparent pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  // If canvas is empty, return standard small canvas or original
  if (!found) return sourceCanvas;

  // Add a small padding around the signature
  const padding = 10;
  const trimmedWidth = (maxX - minX) + (padding * 2);
  const trimmedHeight = (maxY - minY) + (padding * 2);

  // Ensure dimensions are positive
  if (trimmedWidth <= 0 || trimmedHeight <= 0) return sourceCanvas;

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return sourceCanvas;

  // Copy the cropped region
  trimmedCtx.drawImage(
    sourceCanvas,
    minX, minY, maxX - minX + 1, maxY - minY + 1, // Source rect
    padding, padding, maxX - minX + 1, maxY - minY + 1 // Dest rect
  );

  return trimmedCanvas;
};
