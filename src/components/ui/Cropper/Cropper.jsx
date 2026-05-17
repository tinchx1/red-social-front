"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import normalizeWheel from "./normalizeWheel";
import {
  getCropSize,
  restrictPosition,
  getDistanceBetweenPoints,
  getRotationBetweenPoints,
  computeCroppedArea,
  getCenter,
  getInitialCropFromCroppedAreaPixels,
  getInitialCropFromCroppedAreaPercentages,
  classNames,
  clamp,
} from "./helpers";
import styles from "./Cropper.module.scss";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const KEYBOARD_STEP = 1;

class InternalCropper extends React.Component {
  static defaultProps = {
    zoom: 1,
    rotation: 0,
    aspect: 4 / 3,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
    cropShape: "rect",
    objectFit: "contain",
    showGrid: true,
    style: {},
    classes: {},
    mediaProps: {},
    cropperProps: {},
    zoomSpeed: 1,
    restrictPosition: true,
    zoomWithScroll: true,
    keyboardStep: KEYBOARD_STEP,
  };

  cropperRef = React.createRef();
  imageRef = React.createRef();
  videoRef = React.createRef();
  containerPosition = { x: 0, y: 0 };
  containerRef = null;
  containerRect = null;
  mediaSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 };
  dragStartPosition = { x: 0, y: 0 };
  dragStartCrop = { x: 0, y: 0 };
  gestureZoomStart = 0;
  gestureRotationStart = 0;
  isTouching = false;
  lastPinchDistance = 0;
  lastPinchRotation = 0;
  rafDragTimeout = null;
  rafPinchTimeout = null;
  wheelTimer = null;
  currentDoc = typeof document !== "undefined" ? document : null;
  currentWindow = typeof window !== "undefined" ? window : null;
  resizeObserver = null;
  previousCropSize = null;
  isInitialized = false;

  state = {
    cropSize: null,
    hasWheelJustStarted: false,
    mediaObjectFit: undefined,
  };

  componentDidMount() {
    if (!this.currentDoc || !this.currentWindow) {
      return;
    }

    if (this.containerRef) {
      if (this.containerRef.ownerDocument) {
        this.currentDoc = this.containerRef.ownerDocument;
      }
      if (this.currentDoc.defaultView) {
        this.currentWindow = this.currentDoc.defaultView;
      }

      this.initResizeObserver();
      if (typeof window.ResizeObserver === "undefined") {
        this.currentWindow.addEventListener("resize", this.computeSizes);
      }
      if (this.props.zoomWithScroll) {
        this.containerRef.addEventListener("wheel", this.onWheel, {
          passive: false,
        });
      }
      this.containerRef.addEventListener("gesturestart", this.onGestureStart);
    }

    this.currentDoc.addEventListener("scroll", this.onScroll);

    if (this.imageRef.current && this.imageRef.current.complete) {
      this.onMediaLoad();
    }

    if (this.props.setImageRef) {
      this.props.setImageRef(this.imageRef);
    }

    if (this.props.setVideoRef) {
      this.props.setVideoRef(this.videoRef);
    }

    if (this.props.setCropperRef) {
      this.props.setCropperRef(this.cropperRef);
    }
  }

  componentWillUnmount() {
    if (!this.currentDoc || !this.currentWindow) {
      return;
    }
    if (typeof window.ResizeObserver === "undefined") {
      this.currentWindow.removeEventListener("resize", this.computeSizes);
    }
    this.resizeObserver?.disconnect();
    if (this.containerRef) {
      this.containerRef.removeEventListener(
        "gesturestart",
        this.onGestureStart
      );
    }

    this.cleanEvents();
    if (this.props.zoomWithScroll) {
      this.clearScrollEvent();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rotation !== this.props.rotation) {
      this.computeSizes();
      this.recomputeCropPosition();
    } else if (prevProps.aspect !== this.props.aspect) {
      this.computeSizes();
    } else if (prevProps.objectFit !== this.props.objectFit) {
      this.computeSizes();
    } else if (prevProps.zoom !== this.props.zoom) {
      this.recomputeCropPosition();
    } else if (
      prevProps.cropSize?.height !== this.props.cropSize?.height ||
      prevProps.cropSize?.width !== this.props.cropSize?.width
    ) {
      this.computeSizes();
    } else if (
      prevProps.crop?.x !== this.props.crop?.x ||
      prevProps.crop?.y !== this.props.crop?.y
    ) {
      this.emitCropAreaChange();
    }

    if (
      prevProps.zoomWithScroll !== this.props.zoomWithScroll &&
      this.containerRef
    ) {
      if (this.props.zoomWithScroll) {
        this.containerRef.addEventListener("wheel", this.onWheel, {
          passive: false,
        });
      } else {
        this.clearScrollEvent();
      }
    }
    if (prevProps.video !== this.props.video) {
      this.videoRef.current?.load();
    }

    const objectFit = this.getObjectFit();
    if (objectFit !== this.state.mediaObjectFit) {
      this.setState({ mediaObjectFit: objectFit }, this.computeSizes);
    }
  }

  initResizeObserver = () => {
    if (typeof window.ResizeObserver === "undefined" || !this.containerRef) {
      return;
    }
    let isFirstResize = true;
    this.resizeObserver = new window.ResizeObserver((entries) => {
      if (isFirstResize) {
        isFirstResize = false;
        return;
      }
      this.computeSizes();
    });
    this.resizeObserver.observe(this.containerRef);
  };

  cleanEvents = () => {
    if (!this.currentDoc) {
      return;
    }
    this.currentDoc.removeEventListener("mousemove", this.onMouseMove);
    this.currentDoc.removeEventListener("mouseup", this.onDragStopped);
    this.currentDoc.removeEventListener("touchmove", this.onTouchMove);
    this.currentDoc.removeEventListener("touchend", this.onDragStopped);
    this.currentDoc.removeEventListener("gesturechange", this.onGestureChange);
    this.currentDoc.removeEventListener("gestureend", this.onGestureEnd);
    this.currentDoc.removeEventListener("scroll", this.onScroll);
  };

  clearScrollEvent = () => {
    if (this.containerRef) {
      this.containerRef.removeEventListener("wheel", this.onWheel);
    }
    if (this.wheelTimer) {
      clearTimeout(this.wheelTimer);
    }
  };

  onMediaLoad = () => {
    const cropSize = this.computeSizes();

    if (cropSize) {
      this.previousCropSize = cropSize;
      this.emitCropData();
      this.setInitialCrop(cropSize);
      this.isInitialized = true;
    }

    if (this.props.onMediaLoaded) {
      this.props.onMediaLoaded(this.mediaSize);
    }
  };

  setInitialCrop = (cropSize) => {
    if (this.props.initialCroppedAreaPercentages) {
      const { crop, zoom } = getInitialCropFromCroppedAreaPercentages(
        this.props.initialCroppedAreaPercentages,
        this.mediaSize,
        this.props.rotation,
        cropSize,
        this.props.minZoom,
        this.props.maxZoom
      );

      this.props.onCropChange(crop);
      if (this.props.onZoomChange) {
        this.props.onZoomChange(zoom);
      }
    } else if (this.props.initialCroppedAreaPixels) {
      const { crop, zoom } = getInitialCropFromCroppedAreaPixels(
        this.props.initialCroppedAreaPixels,
        this.mediaSize,
        this.props.rotation,
        cropSize,
        this.props.minZoom,
        this.props.maxZoom
      );

      this.props.onCropChange(crop);
      if (this.props.onZoomChange) {
        this.props.onZoomChange(zoom);
      }
    }
  };

  getAspect() {
    const { cropSize, aspect } = this.props;
    if (cropSize) {
      return cropSize.width / cropSize.height;
    }
    return aspect;
  }

  getObjectFit() {
    if (this.props.objectFit === "cover") {
      const mediaRef = this.imageRef.current || this.videoRef.current;

      if (mediaRef && this.containerRef) {
        this.containerRect = this.containerRef.getBoundingClientRect();
        const containerAspect =
          this.containerRect.width / this.containerRect.height;
        const naturalWidth =
          this.imageRef.current?.naturalWidth ||
          this.videoRef.current?.videoWidth ||
          0;
        const naturalHeight =
          this.imageRef.current?.naturalHeight ||
          this.videoRef.current?.videoHeight ||
          0;
        const mediaAspect = naturalWidth / naturalHeight;

        return mediaAspect < containerAspect
          ? "horizontal-cover"
          : "vertical-cover";
      }
      return "horizontal-cover";
    }

    return this.props.objectFit;
  }

  computeSizes = () => {
    const mediaRef = this.imageRef.current || this.videoRef.current;

    if (mediaRef && this.containerRef) {
      this.containerRect = this.containerRef.getBoundingClientRect();
      this.saveContainerPosition();
      const containerAspect =
        this.containerRect.width / this.containerRect.height;
      const naturalWidth =
        this.imageRef.current?.naturalWidth ||
        this.videoRef.current?.videoWidth ||
        0;
      const naturalHeight =
        this.imageRef.current?.naturalHeight ||
        this.videoRef.current?.videoHeight ||
        0;
      const isMediaScaledDown =
        mediaRef.offsetWidth < naturalWidth ||
        mediaRef.offsetHeight < naturalHeight;
      const mediaAspect = naturalWidth / naturalHeight;

      let renderedMediaSize;

      if (isMediaScaledDown) {
        switch (this.state.mediaObjectFit) {
          default:
          case "contain":
            renderedMediaSize =
              containerAspect > mediaAspect
                ? {
                    width: this.containerRect.height * mediaAspect,
                    height: this.containerRect.height,
                  }
                : {
                    width: this.containerRect.width,
                    height: this.containerRect.width / mediaAspect,
                  };
            break;
          case "horizontal-cover":
            renderedMediaSize = {
              width: this.containerRect.width,
              height: this.containerRect.width / mediaAspect,
            };
            break;
          case "vertical-cover":
            renderedMediaSize = {
              width: this.containerRect.height * mediaAspect,
              height: this.containerRect.height,
            };
            break;
        }
      } else {
        renderedMediaSize = {
          width: mediaRef.offsetWidth,
          height: mediaRef.offsetHeight,
        };
      }

      this.mediaSize = {
        ...renderedMediaSize,
        naturalWidth,
        naturalHeight,
      };

      if (this.props.setMediaSize) {
        this.props.setMediaSize(this.mediaSize);
      }

      const cropSize = this.props.cropSize
        ? this.props.cropSize
        : getCropSize(
            this.mediaSize.width,
            this.mediaSize.height,
            this.containerRect.width,
            this.containerRect.height,
            this.props.aspect,
            this.props.rotation
          );

      if (
        this.state.cropSize?.height !== cropSize.height ||
        this.state.cropSize?.width !== cropSize.width
      ) {
        if (this.props.onCropSizeChange) {
          this.props.onCropSizeChange(cropSize);
        }
      }

      this.setState({ cropSize }, this.recomputeCropPosition);

      if (this.props.setCropSize) {
        this.props.setCropSize(cropSize);
      }

      return cropSize;
    }
    return null;
  };

  saveContainerPosition = () => {
    if (this.containerRef) {
      const bounds = this.containerRef.getBoundingClientRect();
      this.containerPosition = { x: bounds.left, y: bounds.top };
    }
  };

  static getMousePoint = (e) => ({
    x: Number(e.clientX),
    y: Number(e.clientY),
  });

  static getTouchPoint = (touch) => ({
    x: Number(touch.clientX),
    y: Number(touch.clientY),
  });

  onMouseDown = (e) => {
    if (!this.currentDoc) {
      return;
    }
    e.preventDefault();
    this.currentDoc.addEventListener("mousemove", this.onMouseMove);
    this.currentDoc.addEventListener("mouseup", this.onDragStopped);
    this.saveContainerPosition();
    this.onDragStart(InternalCropper.getMousePoint(e));
  };

  onMouseMove = (e) => this.onDrag(InternalCropper.getMousePoint(e));

  onScroll = (e) => {
    if (!this.currentDoc) {
      return;
    }
    e.preventDefault();
    this.saveContainerPosition();
  };

  onTouchStart = (e) => {
    if (!this.currentDoc) {
      return;
    }
    this.isTouching = true;
    if (this.props.onTouchRequest && !this.props.onTouchRequest(e)) {
      return;
    }

    this.currentDoc.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    this.currentDoc.addEventListener("touchend", this.onDragStopped);

    this.saveContainerPosition();

    if (e.touches.length === 2) {
      this.onPinchStart(e);
    } else if (e.touches.length === 1) {
      this.onDragStart(InternalCropper.getTouchPoint(e.touches[0]));
    }
  };

  onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      this.onPinchMove(e);
    } else if (e.touches.length === 1) {
      this.onDrag(InternalCropper.getTouchPoint(e.touches[0]));
    }
  };

  onGestureStart = (e) => {
    if (!this.currentDoc) {
      return;
    }
    e.preventDefault();
    this.currentDoc.addEventListener("gesturechange", this.onGestureChange);
    this.currentDoc.addEventListener("gestureend", this.onGestureEnd);
    this.gestureZoomStart = this.props.zoom;
    this.gestureRotationStart = this.props.rotation;
  };

  onGestureChange = (e) => {
    e.preventDefault();
    if (this.isTouching) {
      return;
    }

    const point = InternalCropper.getMousePoint(e);
    const newZoom = this.gestureZoomStart - 1 + e.scale;
    this.setNewZoom(newZoom, point, { shouldUpdatePosition: true });
    if (this.props.onRotationChange) {
      const newRotation = this.gestureRotationStart + e.rotation;
      this.props.onRotationChange(newRotation);
    }
  };

  onGestureEnd = () => {
    this.cleanEvents();
  };

  onDragStart = ({ x, y }) => {
    this.dragStartPosition = { x, y };
    this.dragStartCrop = { ...this.props.crop };
    if (this.props.onInteractionStart) {
      this.props.onInteractionStart();
    }
  };

  onDrag = ({ x, y }) => {
    if (!this.currentWindow) {
      return;
    }
    if (this.rafDragTimeout) {
      this.currentWindow.cancelAnimationFrame(this.rafDragTimeout);
    }

    this.rafDragTimeout = this.currentWindow.requestAnimationFrame(() => {
      if (!this.state.cropSize) {
        return;
      }
      if (typeof x === "undefined" || typeof y === "undefined") {
        return;
      }
      const offsetX = x - this.dragStartPosition.x;
      const offsetY = y - this.dragStartPosition.y;
      const requestedPosition = {
        x: this.dragStartCrop.x + offsetX,
        y: this.dragStartCrop.y + offsetY,
      };

      const newPosition = this.props.restrictPosition
        ? restrictPosition(
            requestedPosition,
            this.mediaSize,
            this.state.cropSize,
            this.props.zoom,
            this.props.rotation
          )
        : requestedPosition;
      this.props.onCropChange(newPosition);
    });
  };

  onDragStopped = () => {
    this.isTouching = false;
    this.cleanEvents();
    this.emitCropData();
    if (this.props.onInteractionEnd) {
      this.props.onInteractionEnd();
    }
  };

  onPinchStart(e) {
    const pointA = InternalCropper.getTouchPoint(e.touches[0]);
    const pointB = InternalCropper.getTouchPoint(e.touches[1]);
    this.lastPinchDistance = getDistanceBetweenPoints(pointA, pointB);
    this.lastPinchRotation = getRotationBetweenPoints(pointA, pointB);
    this.onDragStart(getCenter(pointA, pointB));
  }

  onPinchMove(e) {
    if (!this.currentDoc || !this.currentWindow) {
      return;
    }
    const pointA = InternalCropper.getTouchPoint(e.touches[0]);
    const pointB = InternalCropper.getTouchPoint(e.touches[1]);
    const center = getCenter(pointA, pointB);
    this.onDrag(center);

    if (this.rafPinchTimeout) {
      this.currentWindow.cancelAnimationFrame(this.rafPinchTimeout);
    }
    this.rafPinchTimeout = this.currentWindow.requestAnimationFrame(() => {
      const distance = getDistanceBetweenPoints(pointA, pointB);
      const newZoom = this.props.zoom * (distance / this.lastPinchDistance);
      this.setNewZoom(newZoom, center, { shouldUpdatePosition: false });
      this.lastPinchDistance = distance;

      const rotation = getRotationBetweenPoints(pointA, pointB);
      const newRotation =
        this.props.rotation + (rotation - this.lastPinchRotation);
      if (this.props.onRotationChange) {
        this.props.onRotationChange(newRotation);
      }
      this.lastPinchRotation = rotation;
    });
  }

  onWheel = (e) => {
    if (!this.currentWindow) {
      return;
    }
    if (this.props.onWheelRequest && !this.props.onWheelRequest(e)) {
      return;
    }

    e.preventDefault();
    const point = InternalCropper.getMousePoint(e);
    const { pixelY } = normalizeWheel(e);
    const newZoom = this.props.zoom - (pixelY * this.props.zoomSpeed) / 200;
    this.setNewZoom(newZoom, point, { shouldUpdatePosition: true });

    if (!this.state.hasWheelJustStarted) {
      this.setState({ hasWheelJustStarted: true }, () => {
        if (this.props.onInteractionStart) {
          this.props.onInteractionStart();
        }
      });
    }

    if (this.wheelTimer) {
      clearTimeout(this.wheelTimer);
    }
    this.wheelTimer = this.currentWindow.setTimeout(() => {
      this.setState({ hasWheelJustStarted: false }, () => {
        if (this.props.onInteractionEnd) {
          this.props.onInteractionEnd();
        }
      });
    }, 250);
  };

  getPointOnContainer = ({ x, y }, containerTopLeft) => {
    if (!this.containerRect) {
      throw new Error("The Cropper is not mounted");
    }
    return {
      x: this.containerRect.width / 2 - (x - containerTopLeft.x),
      y: this.containerRect.height / 2 - (y - containerTopLeft.y),
    };
  };

  getPointOnMedia = ({ x, y }) => {
    const { crop, zoom } = this.props;
    return {
      x: (x + crop.x) / zoom,
      y: (y + crop.y) / zoom,
    };
  };

  setNewZoom = (zoom, point, { shouldUpdatePosition = true } = {}) => {
    if (!this.state.cropSize || !this.props.onZoomChange) {
      return;
    }

    const newZoom = clamp(zoom, this.props.minZoom, this.props.maxZoom);

    if (shouldUpdatePosition) {
      const zoomPoint = this.getPointOnContainer(point, this.containerPosition);
      const zoomTarget = this.getPointOnMedia(zoomPoint);
      const requestedPosition = {
        x: zoomTarget.x * newZoom - zoomPoint.x,
        y: zoomTarget.y * newZoom - zoomPoint.y,
      };

      const newPosition = this.props.restrictPosition
        ? restrictPosition(
            requestedPosition,
            this.mediaSize,
            this.state.cropSize,
            newZoom,
            this.props.rotation
          )
        : requestedPosition;

      this.props.onCropChange(newPosition);
    }
    this.props.onZoomChange(newZoom);
  };

  getCropData = () => {
    if (!this.state.cropSize) {
      return null;
    }

    const restrictedPosition = this.props.restrictPosition
      ? restrictPosition(
          this.props.crop,
          this.mediaSize,
          this.state.cropSize,
          this.props.zoom,
          this.props.rotation
        )
      : this.props.crop;
    return computeCroppedArea(
      restrictedPosition,
      this.mediaSize,
      this.state.cropSize,
      this.getAspect(),
      this.props.zoom,
      this.props.rotation,
      this.props.restrictPosition
    );
  };

  emitCropData = () => {
    const cropData = this.getCropData();
    if (!cropData) {
      return;
    }

    const { croppedAreaPercentages, croppedAreaPixels } = cropData;
    if (this.props.onCropComplete) {
      this.props.onCropComplete(croppedAreaPercentages, croppedAreaPixels);
    }

    if (this.props.onCropAreaChange) {
      this.props.onCropAreaChange(croppedAreaPercentages, croppedAreaPixels);
    }
  };

  emitCropAreaChange = () => {
    const cropData = this.getCropData();
    if (!cropData) {
      return;
    }

    const { croppedAreaPercentages, croppedAreaPixels } = cropData;
    if (this.props.onCropAreaChange) {
      this.props.onCropAreaChange(croppedAreaPercentages, croppedAreaPixels);
    }
  };

  recomputeCropPosition = () => {
    if (!this.state.cropSize) {
      return;
    }

    let adjustedCrop = this.props.crop;

    if (this.isInitialized && this.previousCropSize) {
      const sizeChanged =
        Math.abs(this.previousCropSize.width - this.state.cropSize.width) >
          1e-6 ||
        Math.abs(this.previousCropSize.height - this.state.cropSize.height) >
          1e-6;

      if (sizeChanged) {
        const scaleX = this.state.cropSize.width / this.previousCropSize.width;
        const scaleY =
          this.state.cropSize.height / this.previousCropSize.height;

        adjustedCrop = {
          x: this.props.crop.x * scaleX,
          y: this.props.crop.y * scaleY,
        };
      }
    }

    const newPosition = this.props.restrictPosition
      ? restrictPosition(
          adjustedCrop,
          this.mediaSize,
          this.state.cropSize,
          this.props.zoom,
          this.props.rotation
        )
      : adjustedCrop;

    this.previousCropSize = this.state.cropSize;

    this.props.onCropChange(newPosition);
    this.emitCropData();
  };

  onKeyDown = (event) => {
    const { crop, onCropChange, keyboardStep, zoom, rotation } = this.props;
    let step = keyboardStep;

    if (!this.state.cropSize) {
      return;
    }

    if (event.shiftKey) {
      step *= 0.2;
    }

    let newCrop = { ...crop };

    switch (event.key) {
      case "ArrowUp":
        newCrop.y -= step;
        event.preventDefault();
        break;
      case "ArrowDown":
        newCrop.y += step;
        event.preventDefault();
        break;
      case "ArrowLeft":
        newCrop.x -= step;
        event.preventDefault();
        break;
      case "ArrowRight":
        newCrop.x += step;
        event.preventDefault();
        break;
      default:
        return;
    }

    if (this.props.restrictPosition) {
      newCrop = restrictPosition(
        newCrop,
        this.mediaSize,
        this.state.cropSize,
        zoom,
        rotation
      );
    }

    if (!event.repeat && this.props.onInteractionStart) {
      this.props.onInteractionStart();
    }

    onCropChange(newCrop);
  };

  onKeyUp = (event) => {
    switch (event.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault();
        break;
      default:
        return;
    }
    this.emitCropData();
    if (this.props.onInteractionEnd) {
      this.props.onInteractionEnd();
    }
  };

  render() {
    const {
      image,
      video,
      mediaProps,
      cropperProps,
      transform,
      crop: { x, y },
      rotation,
      zoom,
      cropShape,
      showGrid,
      roundCropAreaPixels,
      style: { containerStyle, cropAreaStyle, mediaStyle } = {},
      classes: { containerClassName, cropAreaClassName, mediaClassName } = {},
    } = this.props;

    const objectFit = this.state.mediaObjectFit ?? this.getObjectFit();

    return (
      <div
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        ref={(el) => (this.containerRef = el)}
        data-testid="container"
        style={containerStyle}
        className={classNames(styles.container, containerClassName)}
      >
        {image ? (
          <img
            alt=""
            className={classNames(
              styles.media,
              objectFit === "contain" && styles.contain,
              objectFit === "horizontal-cover" && styles.coverHorizontal,
              objectFit === "vertical-cover" && styles.coverVertical,
              mediaClassName
            )}
            {...mediaProps}
            src={image}
            ref={this.imageRef}
            style={{
              ...mediaStyle,
              transform:
                transform ||
                `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
            }}
            onLoad={this.onMediaLoad}
          />
        ) : (
          video && (
            <video
              autoPlay
              playsInline
              loop
              muted={true}
              className={classNames(
                styles.video,
                objectFit === "contain" && styles.contain,
                objectFit === "horizontal-cover" && styles.coverHorizontal,
                objectFit === "vertical-cover" && styles.coverVertical,
                mediaClassName
              )}
              {...mediaProps}
              ref={this.videoRef}
              onLoadedMetadata={this.onMediaLoad}
              style={{
                ...mediaStyle,
                transform:
                  transform ||
                  `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
              }}
              controls={false}
            >
              {(Array.isArray(video) ? video : [{ src: video }]).map((item) => (
                <source key={item.src} {...item} />
              ))}
            </video>
          )
        )}
        {this.state.cropSize && (
          <div
            ref={this.cropperRef}
            style={{
              ...cropAreaStyle,
              width: roundCropAreaPixels
                ? Math.round(this.state.cropSize.width)
                : this.state.cropSize.width,
              height: roundCropAreaPixels
                ? Math.round(this.state.cropSize.height)
                : this.state.cropSize.height,
            }}
            tabIndex={0}
            onKeyDown={this.onKeyDown}
            onKeyUp={this.onKeyUp}
            data-testid="cropper"
            className={classNames(
              styles.cropArea,
              cropShape === "round" && styles.cropAreaRound,
              showGrid && styles.cropAreaGrid,
              cropAreaClassName
            )}
            {...cropperProps}
          />
        )}
      </div>
    );
  }
}

export default function Cropper({
  image,
  expectedDimensions,
  initialCrop = { x: 0, y: 0 },
  initialZoom = 1,
  zoom: controlledZoom,
  onZoomChange: onZoomChangeProp,
  minZoom = MIN_ZOOM,
  maxZoom = MAX_ZOOM,
  cropShape = "rect",
  showGrid = true,
  restrictPosition = true,
  zoomWithScroll = true,
  onCropComplete,
  onCropAreaChange,
  onInteractionStart,
  onInteractionEnd,
  className,
  containerStyle,
}) {
  if (!image) {
    throw new Error("Cropper requires an image source");
  }
  if (
    !expectedDimensions ||
    !expectedDimensions.width ||
    !expectedDimensions.height
  ) {
    throw new Error("Cropper expectedDimensions requires width and height");
  }

  const { width, height } = expectedDimensions;

  const aspect = useMemo(() => width / height, [width, height]);

  const [crop, setCrop] = useState(initialCrop);
  const [uncontrolledZoom, setUncontrolledZoom] = useState(initialZoom);
  const isZoomControlled = typeof controlledZoom === "number";
  const resolvedZoom = isZoomControlled ? controlledZoom : uncontrolledZoom;

  useEffect(() => {
    if (!isZoomControlled) {
      setUncontrolledZoom(initialZoom);
    }
  }, [initialZoom, isZoomControlled]);

  const handleCropChange = useCallback(
    (nextCrop) => {
      setCrop(nextCrop);
    },
    [setCrop]
  );

  const handleZoomChange = useCallback(
    (nextZoom) => {
      if (!isZoomControlled) {
        setUncontrolledZoom(nextZoom);
      }
      if (onZoomChangeProp) {
        onZoomChangeProp(nextZoom);
      }
    },
    [isZoomControlled, onZoomChangeProp]
  );

  const handleCropComplete = useCallback(
    (area, pixels) => {
      if (onCropComplete) {
        onCropComplete({
          area,
          pixels,
          expectedDimensions,
        });
      }
    },
    [expectedDimensions, onCropComplete]
  );

  const handleCropAreaChange = useCallback(
    (area, pixels) => {
      if (onCropAreaChange) {
        onCropAreaChange({
          area,
          pixels,
          expectedDimensions,
        });
      }
    },
    [expectedDimensions, onCropAreaChange]
  );

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={{ ...containerStyle, aspectRatio: `${width} / ${height}` }}
    >
      <InternalCropper
        image={image}
        crop={crop}
        zoom={resolvedZoom}
        aspect={aspect}
        minZoom={minZoom}
        maxZoom={maxZoom}
        cropShape={cropShape}
        showGrid={showGrid}
        restrictPosition={restrictPosition}
        zoomWithScroll={zoomWithScroll}
        onCropChange={handleCropChange}
        onZoomChange={handleZoomChange}
        onCropComplete={handleCropComplete}
        onCropAreaChange={handleCropAreaChange}
        onInteractionStart={onInteractionStart}
        onInteractionEnd={onInteractionEnd}
        style={{ containerStyle: { position: "absolute", inset: 0 } }}
      />
    </div>
  );
}
