"use strict";

/**
 * Compute the dimension of the crop area based on media size,
 * aspect ratio and optionally rotation.
 */
export function getCropSize(
  mediaWidth,
  mediaHeight,
  containerWidth,
  containerHeight,
  aspect,
  rotation = 0
) {
  const { width, height } = rotateSize(mediaWidth, mediaHeight, rotation);
  const fittingWidth = Math.min(width, containerWidth);
  const fittingHeight = Math.min(height, containerHeight);

  if (fittingWidth > fittingHeight * aspect) {
    return {
      width: fittingHeight * aspect,
      height: fittingHeight,
    };
  }

  return {
    width: fittingWidth,
    height: fittingWidth / aspect,
  };
}

/**
 * Ensure a new media position stays in the crop area.
 */
export function restrictPosition(position, mediaSize, cropSize, zoom, rotation = 0) {
  const { width, height } = rotateSize(mediaSize.width, mediaSize.height, rotation);

  return {
    x: restrictPositionCoord(position.x, width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, height, cropSize.height, zoom),
  };
}

function restrictPositionCoord(position, mediaSize, cropSize, zoom) {
  const maxPosition = (mediaSize * zoom) / 2 - cropSize / 2;

  return clamp(position, -maxPosition, maxPosition);
}

export function getDistanceBetweenPoints(pointA, pointB) {
  return Math.hypot(pointA.y - pointB.y, pointA.x - pointB.x);
}

export function getRotationBetweenPoints(pointA, pointB) {
  return (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI;
}

/**
 * Compute the output cropped area of the media in percentages and pixels.
 */
export function computeCroppedArea(
  crop,
  mediaSize,
  cropSize,
  aspect,
  zoom,
  rotation = 0,
  restrictPositionFlag = true
) {
  const limitAreaFn = restrictPositionFlag ? limitArea : noOp;

  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);
  const mediaNaturalBBoxSize = rotateSize(
    mediaSize.naturalWidth,
    mediaSize.naturalHeight,
    rotation
  );

  const croppedAreaPercentages = {
    x: limitAreaFn(
      100,
      (((mediaBBoxSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / mediaBBoxSize.width) *
        100
    ),
    y: limitAreaFn(
      100,
      (((mediaBBoxSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) /
        mediaBBoxSize.height) *
        100
    ),
    width: limitAreaFn(100, ((cropSize.width / mediaBBoxSize.width) * 100) / zoom),
    height: limitAreaFn(100, ((cropSize.height / mediaBBoxSize.height) * 100) / zoom),
  };

  const widthInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.width,
      (croppedAreaPercentages.width * mediaNaturalBBoxSize.width) / 100
    )
  );
  const heightInPixels = Math.round(
    limitAreaFn(
      mediaNaturalBBoxSize.height,
      (croppedAreaPercentages.height * mediaNaturalBBoxSize.height) / 100
    )
  );
  const isImgWiderThanHigh = mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;

  const sizePixels = isImgWiderThanHigh
    ? {
        width: Math.round(heightInPixels * aspect),
        height: heightInPixels,
      }
    : {
        width: widthInPixels,
        height: Math.round(widthInPixels / aspect),
      };

  const croppedAreaPixels = {
    ...sizePixels,
    x: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.width - sizePixels.width,
        (croppedAreaPercentages.x * mediaNaturalBBoxSize.width) / 100
      )
    ),
    y: Math.round(
      limitAreaFn(
        mediaNaturalBBoxSize.height - sizePixels.height,
        (croppedAreaPercentages.y * mediaNaturalBBoxSize.height) / 100
      )
    ),
  };

  return { croppedAreaPercentages, croppedAreaPixels };
}

function limitArea(max, value) {
  return Math.min(max, Math.max(0, value));
}

function noOp(_max, value) {
  return value;
}

/**
 * Compute crop and zoom from the croppedAreaPercentages.
 */
export function getInitialCropFromCroppedAreaPercentages(
  croppedAreaPercentages,
  mediaSize,
  rotation,
  cropSize,
  minZoom,
  maxZoom
) {
  const mediaBBoxSize = rotateSize(mediaSize.width, mediaSize.height, rotation);

  const zoom = clamp(
    (cropSize.width / mediaBBoxSize.width) * (100 / croppedAreaPercentages.width),
    minZoom,
    maxZoom
  );

  const crop = {
    x:
      (zoom * mediaBBoxSize.width) / 2 -
      cropSize.width / 2 -
      mediaBBoxSize.width * zoom * (croppedAreaPercentages.x / 100),
    y:
      (zoom * mediaBBoxSize.height) / 2 -
      cropSize.height / 2 -
      mediaBBoxSize.height * zoom * (croppedAreaPercentages.y / 100),
  };

  return { crop, zoom };
}

function getZoomFromCroppedAreaPixels(croppedAreaPixels, mediaSize, cropSize) {
  const mediaZoom =
    mediaSize.width > mediaSize.height
      ? mediaSize.width / mediaSize.naturalWidth
      : mediaSize.height / mediaSize.naturalHeight;

  return cropSize.height > cropSize.width
    ? cropSize.height / (croppedAreaPixels.height * mediaZoom)
    : cropSize.width / (croppedAreaPixels.width * mediaZoom);
}

export function getInitialCropFromCroppedAreaPixels(
  croppedAreaPixels,
  mediaSize,
  rotation = 0,
  cropSize,
  minZoom,
  maxZoom
) {
  const mediaNaturalBBoxSize = rotateSize(
    mediaSize.naturalWidth,
    mediaSize.naturalHeight,
    rotation
  );

  const zoom = clamp(
    getZoomFromCroppedAreaPixels(croppedAreaPixels, mediaSize, cropSize),
    minZoom,
    maxZoom
  );

  const cropZoom =
    cropSize.height > cropSize.width
      ? cropSize.height / croppedAreaPixels.height
      : cropSize.width / croppedAreaPixels.width;

  const crop = {
    x:
      ((mediaNaturalBBoxSize.width - croppedAreaPixels.width) / 2 - croppedAreaPixels.x) * cropZoom,
    y:
      ((mediaNaturalBBoxSize.height - croppedAreaPixels.height) / 2 - croppedAreaPixels.y) *
      cropZoom,
  };

  return { crop, zoom };
}

export function getCenter(a, b) {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
  };
}

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function classNames(...args) {
  return args
    .filter((value) => typeof value === "string" && value.length > 0)
    .join(" ")
    .trim();
}




