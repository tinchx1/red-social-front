"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Cropper as BaseCropper, Spinner } from "@/components/ui";
import styles from "./Cropper.module.scss";

const CROPPER_MAX_WIDTH = 720;
const CROPPER_MAX_HEIGHT = 475;
const CROPPER_MIN_HEIGHT = 300;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

export default function ImageCropper({
  file,
  imageSrc,
  format,
  onCancel,
  onConfirm,
}) {
  const [cropPixels, setCropPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCropPixels(null);
    setZoom(1);
  }, [imageSrc, format?.id]);

  if (!imageSrc || !format) {
    return null;
  }

  const expectedDimensions = useMemo(
    () => ({ width: format.width, height: format.height }),
    [format.width, format.height]
  );

  const handleCropComplete = (payload) => {
    if (payload?.pixels) {
      setCropPixels(payload.pixels);
    }
  };

  const handleConfirm = async () => {
    if (!cropPixels) {
      return;
    }

    try {
      setIsSaving(true);
      const result = await cropImage({
        imageSrc,
        cropPixels,
        originalFile: file,
        format,
      });
      onConfirm(result);
    } catch (error) {
      console.error("No se pudo recortar la imagen", error);
      setIsSaving(false);
    }
  };

  const cropperBounds = useMemo(() => {
    if (!format) {
      return null;
    }
    const aspect = format.aspect ?? format.width / format.height;
    let width = CROPPER_MAX_WIDTH;
    let height = width / aspect;

    if (height > CROPPER_MAX_HEIGHT) {
      height = CROPPER_MAX_HEIGHT;
      width = height * aspect;
    }

    if (height < CROPPER_MIN_HEIGHT) {
      height = CROPPER_MIN_HEIGHT;
      width = height * aspect;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }, [format]);

  const handleZoomChange = useCallback((event) => {
    const nextZoom = clampValue(Number(event.target.value), MIN_ZOOM, MAX_ZOOM);
    setZoom(nextZoom);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((current) => {
      const next = clampValue(current + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
      return Number(next.toFixed(2));
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((current) => {
      const next = clampValue(current - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
      return Number(next.toFixed(2));
    });
  }, []);

  const zoomDisplay = useMemo(() => `${Math.round(zoom * 100)}%`, [zoom]);

  return (
    <div className={styles.inlineContainer}>
      <div
        className={styles.cropper}
        style={
          cropperBounds
            ? {
                aspectRatio: format.aspect ?? format.width / format.height,
                maxWidth: `100%`,
                maxHeight: `${cropperBounds.height}px`,
                minHeight: `${CROPPER_MIN_HEIGHT}px`,
              }
            : undefined
        }
      >
        <BaseCropper
          image={imageSrc}
          expectedDimensions={expectedDimensions}
          showGrid
          zoomWithScroll
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onZoomChange={setZoom}
          cropSize={cropperBounds ?? undefined}
          onCropComplete={handleCropComplete}
        />
        <button
          className={styles.closeButton}
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Cancelar"
        >
          ✕
        </button>
        <div className={styles.actionsOverlay}>
          <div className={styles.actions}>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!cropPixels || isSaving}
              className={styles.applyButton}
            >
              {isSaving ? (
                <>
                  Guardando <Spinner color="white" size="small" />
                </>
              ) : (
                "Aplicar recorte"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <span className={styles.zoomLabel}>Zoom</span>
        <div className={styles.zoomActions}>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Alejar"
          >
            -
          </button>
          <span className={styles.zoomValue}>{zoomDisplay}</span>
          <button
            type="button"
            className={styles.zoomButton}
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Acercar"
          >
            +
          </button>
        </div>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={ZOOM_STEP}
          value={zoom}
          onChange={handleZoomChange}
          className={styles.zoomSlider}
          aria-label="Controlar zoom"
        />
      </div>
    </div>
  );
}

async function cropImage({ imageSrc, cropPixels, originalFile, format }) {
  // Always use the original file to ensure maximum resolution
  // Create object URL from file if we have it, otherwise use imageSrc
  let imageSourceUrl = imageSrc;
  let shouldRevokeUrl = false;

  if (originalFile) {
    imageSourceUrl = URL.createObjectURL(originalFile);
    shouldRevokeUrl = true;
  }

  const image = await loadImage(imageSourceUrl);

  // Verify we're using natural dimensions (full resolution)
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;

  // Clean up object URL after loading
  if (shouldRevokeUrl) {
    URL.revokeObjectURL(imageSourceUrl);
  }

  const { x, y, width, height } = cropPixels;

  // Ensure crop coordinates are within natural image bounds
  // cropPixels from BaseCropper are already in natural pixel coordinates

  // Calculate the aspect ratio of the cropped area and target format
  const cropAspect = width / height;
  const targetAspect = format.aspect ?? format.width / format.height;

  // Ensure the cropped area maintains the exact target aspect ratio
  // Adjust source dimensions if needed to match target aspect
  let sourceX = x;
  let sourceY = y;
  let sourceWidth = width;
  let sourceHeight = height;

  // If aspect ratios don't match, adjust the source area to match target aspect
  if (Math.abs(cropAspect - targetAspect) > 0.001) {
    if (cropAspect > targetAspect) {
      // Crop area is wider - adjust width to match target aspect
      sourceWidth = height * targetAspect;
      sourceX = x + (width - sourceWidth) / 2;
    } else {
      // Crop area is taller - adjust height to match target aspect
      sourceHeight = width / targetAspect;
      sourceY = y + (height - sourceHeight) / 2;
    }
  }

  // Calculate dynamic scale factor based on target size and crop area
  // For small output sizes (like 167x167), we need much higher resolution
  const minCropDimension = Math.min(sourceWidth, sourceHeight);
  const minTargetDimension = Math.min(format.width, format.height);
  const maxTargetDimension = Math.max(format.width, format.height);

  // For small output formats, use much higher scale factor to preserve quality
  // The key is to render at a resolution that's at least as high as the natural image
  // to avoid any quality loss from downscaling
  let scaleFactor;

  // Calculate optimal scale based on natural image size vs crop area
  const cropAreaPixels = sourceWidth * sourceHeight;
  const targetAreaPixels = format.width * format.height;
  const naturalAreaPixels = naturalWidth * naturalHeight;

  // If crop area is small relative to natural image, we need high upscaling
  const cropToNaturalRatio = cropAreaPixels / naturalAreaPixels;

  if (minTargetDimension <= 200) {
    // Very small output (like 167x167) - use aggressive upscaling
    if (cropToNaturalRatio < 0.1 || minCropDimension < 150) {
      // Very small crop relative to image - use maximum upscaling
      scaleFactor = 10;
    } else if (cropToNaturalRatio < 0.2 || minCropDimension < 300) {
      scaleFactor = 8;
    } else {
      scaleFactor = 6;
    }
  } else if (minTargetDimension <= 400) {
    scaleFactor = cropToNaturalRatio < 0.15 ? 6 : 4;
  } else {
    const scaleRatio = minTargetDimension / minCropDimension;
    scaleFactor = scaleRatio > 1.5 || minCropDimension < 200 ? 3 : 2;
  }

  // Use high resolution canvas for rendering to improve quality
  const canvas = document.createElement("canvas");
  canvas.width = format.width * scaleFactor;
  canvas.height = format.height * scaleFactor;
  const ctx = canvas.getContext("2d");

  // Enable high-quality image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the cropped area at high resolution
  ctx.drawImage(
    image,
    Math.round(sourceX),
    Math.round(sourceY),
    Math.round(sourceWidth),
    Math.round(sourceHeight),
    0,
    0,
    format.width * scaleFactor,
    format.height * scaleFactor
  );

  // For very high scale factors, use progressive downscaling for better quality
  let workingCanvas = canvas;
  let currentScale = scaleFactor;

  // Progressive downscaling: scale down in steps if scale factor is very high
  while (currentScale > 2) {
    const nextScale = Math.max(2, currentScale / 2);
    const intermediateCanvas = document.createElement("canvas");
    intermediateCanvas.width = format.width * nextScale;
    intermediateCanvas.height = format.height * nextScale;
    const intermediateCtx = intermediateCanvas.getContext("2d");
    intermediateCtx.imageSmoothingEnabled = true;
    intermediateCtx.imageSmoothingQuality = "high";

    intermediateCtx.drawImage(
      workingCanvas,
      0,
      0,
      intermediateCanvas.width,
      intermediateCanvas.height
    );

    // Clean up previous canvas if it's not the original
    if (workingCanvas !== canvas) {
      // Canvas cleanup is automatic, but we update the reference
    }

    workingCanvas = intermediateCanvas;
    currentScale = nextScale;
  }

  // Create a final canvas at target size and scale down with high quality
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = format.width;
  finalCanvas.height = format.height;
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = "high";

  // Final scale down to target size with high quality smoothing
  finalCtx.drawImage(workingCanvas, 0, 0, format.width, format.height);

  // Generate the file blob for upload
  // For small formats (<= 200px), generate at 2x resolution to preserve quality
  // The image will be stored at higher resolution and scaled down with CSS for display
  const shouldUpscaleForUpload = minTargetDimension <= 200;
  const uploadScale = shouldUpscaleForUpload ? 2 : 1;

  let uploadCanvas = finalCanvas;
  if (shouldUpscaleForUpload) {
    // Create a 2x canvas for better quality on small formats
    uploadCanvas = document.createElement("canvas");
    uploadCanvas.width = format.width * uploadScale;
    uploadCanvas.height = format.height * uploadScale;
    const uploadCtx = uploadCanvas.getContext("2d");
    uploadCtx.imageSmoothingEnabled = true;
    uploadCtx.imageSmoothingQuality = "high";
    // Draw from the high-res working canvas to upload canvas at 2x
    uploadCtx.drawImage(
      workingCanvas,
      0,
      0,
      uploadCanvas.width,
      uploadCanvas.height
    );
  }

  // Determine the output format based on original file type
  const isPng = originalFile?.type === "image/png";
  const isGif = originalFile?.type === "image/gif";
  
  // Try to export as GIF first if original is GIF, fallback to PNG if not supported
  const blob = await new Promise((resolve, reject) => {
    if (isGif) {
      // Try GIF first (may not be supported by all browsers)
      uploadCanvas.toBlob(
        (generatedBlob) => {
          if (generatedBlob) {
            resolve(generatedBlob);
          } else {
            // Fallback to PNG if GIF is not supported
            uploadCanvas.toBlob(
              (pngBlob) => {
                if (!pngBlob) {
                  reject(new Error("No se pudo generar la imagen recortada."));
                  return;
                }
                resolve(pngBlob);
              },
              "image/png"
            );
          }
        },
        "image/gif"
      );
    } else {
      const outputMimeType = isPng ? "image/png" : "image/jpeg";
      const outputQuality = isPng ? undefined : 1.0; // Maximum quality - no compression
      uploadCanvas.toBlob(
        (generatedBlob) => {
          if (!generatedBlob) {
            reject(new Error("No se pudo generar la imagen recortada."));
            return;
          }
          resolve(generatedBlob);
        },
        outputMimeType,
        outputQuality
      );
    }
  });

  // Generate a high-quality preview at 2x resolution for better display quality
  // This ensures the preview matches what the user saw during cropping
  const previewScale = 2;
  const previewCanvas = document.createElement("canvas");
  previewCanvas.width = format.width * previewScale;
  previewCanvas.height = format.height * previewScale;
  const previewCtx = previewCanvas.getContext("2d");
  previewCtx.imageSmoothingEnabled = true;
  previewCtx.imageSmoothingQuality = "high";

  // Draw from the high-res working canvas to preview canvas at 2x
  previewCtx.drawImage(
    workingCanvas,
    0,
    0,
    previewCanvas.width,
    previewCanvas.height
  );

  // Generate preview blob with maximum quality
  // Use same format as main blob (GIF, PNG, or JPEG)
  const previewBlob = await new Promise((resolve, reject) => {
    const previewMimeType = blob.type;
    const previewQuality = previewMimeType === "image/png" ? undefined : 1.0;
    
    if (previewMimeType === "image/gif") {
      // Try GIF first for preview
      previewCanvas.toBlob(
        (generatedBlob) => {
          if (generatedBlob) {
            resolve(generatedBlob);
          } else {
            // Fallback to PNG if GIF not supported
            previewCanvas.toBlob(
              (pngBlob) => {
                if (!pngBlob) {
                  reject(new Error("No se pudo generar el preview."));
                  return;
                }
                resolve(pngBlob);
              },
              "image/png"
            );
          }
        },
        "image/gif"
      );
    } else {
      previewCanvas.toBlob(
        (generatedBlob) => {
          if (!generatedBlob) {
            reject(new Error("No se pudo generar el preview."));
            return;
          }
          resolve(generatedBlob);
        },
        previewMimeType,
        previewQuality
      );
    }
  });

  // Determine extension and file type based on actual blob type (may differ from original if fallback was used)
  const extension = blob.type === "image/png" ? "png" : blob.type === "image/gif" ? "gif" : "jpg";
  const fileName = createFileName(originalFile?.name, format, extension);
  // Use actual blob type (may be PNG even if original was GIF if browser doesn't support GIF export)
  const croppedFile = new File([blob], fileName, { type: blob.type });
  const previewUrl = URL.createObjectURL(previewBlob);

  return { file: croppedFile, previewUrl };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function createFileName(originalName = "anuncio", format, extension) {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}-${format.width}x${format.height}.${extension}`;
}
