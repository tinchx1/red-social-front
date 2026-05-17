export default function normalizeWheel(event) {
  if (!event) {
    return { spinX: 0, spinY: 0, pixelX: 0, pixelY: 0 };
  }

  const pixelX = typeof event.deltaX === "number" ? event.deltaX : 0;
  const pixelY = typeof event.deltaY === "number" ? event.deltaY : 0;

  return {
    spinX: 0,
    spinY: 0,
    pixelX,
    pixelY,
  };
}














