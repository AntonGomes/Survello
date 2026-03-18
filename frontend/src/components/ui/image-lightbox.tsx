"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from "lucide-react";
import NextImage from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;
const PERCENT_MULTIPLIER = 100;

interface LightboxImage {
  id: number | string;
  url: string;
  alt?: string;
  fileName?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (image: LightboxImage) => void;
}

function LightboxToolbar({ currentIndex, total, fileName, zoom, onZoomIn, onZoomOut, onDownload, onClose }: {
  currentIndex: number; total: number; fileName?: string; zoom: number
  onZoomIn: () => void; onZoomOut: () => void; onDownload: () => void; onClose: () => void
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
      <div className="text-white text-sm">
        {currentIndex + 1} / {total}
        {fileName && <span className="ml-2 text-white/70">— {fileName}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onZoomOut} disabled={zoom <= MIN_ZOOM}><ZoomOut className="h-5 w-5" /></Button>
        <span className="text-white text-sm w-12 text-center">{Math.round(zoom * PERCENT_MULTIPLIER)}%</span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onZoomIn} disabled={zoom >= MAX_ZOOM}><ZoomIn className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onDownload}><Download className="h-5 w-5" /></Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}><X className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}

function ThumbnailStrip({ images, currentIndex, onSelect }: {
  images: LightboxImage[]; currentIndex: number; onSelect: (index: number) => void
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent">
      <div className="flex justify-center gap-2 overflow-x-auto max-w-full pb-2">
        {images.map((img, index) => (
          <button key={img.id} onClick={() => onSelect(index)}
            className={cn("relative flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all", index === currentIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80")}>
            <NextImage src={img.url} alt={img.alt || `Thumbnail ${index + 1}`} fill className="object-cover" unoptimized />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ImageLightbox({ images, initialIndex = 0, open, onOpenChange, onDownload }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { if (open) { setCurrentIndex(initialIndex); setZoom(1); setIsLoading(true); } }, [open, initialIndex]);

  const currentImage = images[currentIndex];
  const goToPrevious = useCallback(() => { setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); setZoom(1); setIsLoading(true); }, [images.length]);
  const goToNext = useCallback(() => { setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); setZoom(1); setIsLoading(true); }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  const handleDownload = () => {
    if (onDownload && currentImage) { onDownload(currentImage); }
    else if (currentImage?.url) { const link = document.createElement("a"); link.href = currentImage.url; link.download = currentImage.fileName || `image-${currentImage.id}`; link.click(); }
  };

  const handleThumbnailSelect = (index: number) => { setCurrentIndex(index); setZoom(1); setIsLoading(true); };
  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        <VisuallyHidden><DialogTitle>Image Viewer</DialogTitle></VisuallyHidden>
        <LightboxToolbar currentIndex={currentIndex} total={images.length} fileName={currentImage?.fileName} zoom={zoom} onZoomIn={() => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM))} onZoomOut={() => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM))} onDownload={handleDownload} onClose={() => onOpenChange(false)} />
        {images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 text-white hover:bg-white/20" onClick={goToPrevious}><ChevronLeft className="h-8 w-8" /></Button>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 text-white hover:bg-white/20" onClick={goToNext}><ChevronRight className="h-8 w-8" /></Button>
          </>
        )}
        <div className="flex items-center justify-center w-full h-full overflow-hidden">
          {currentImage && <NextImage src={currentImage.url} alt={currentImage.alt || currentImage.fileName || "Survey image"} width={0} height={0} sizes="95vw" className={cn("max-w-full max-h-full object-contain transition-all duration-200", isLoading && "opacity-0")} style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%", transform: `scale(${zoom})` }} onLoad={() => setIsLoading(false)} draggable={false} unoptimized />}
          {isLoading && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
        </div>
        {images.length > 1 && <ThumbnailStrip images={images} currentIndex={currentIndex} onSelect={handleThumbnailSelect} />}
      </DialogContent>
    </Dialog>
  );
}

export function useLightbox(images: LightboxImage[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const openLightbox = useCallback((index: number = 0) => { setInitialIndex(index); setIsOpen(true); }, []);
  const closeLightbox = useCallback(() => { setIsOpen(false); }, []);
  return { isOpen, initialIndex, openLightbox, closeLightbox, setIsOpen, images };
}
