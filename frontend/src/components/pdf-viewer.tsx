"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const PERCENT_MULTIPLIER = 100;

interface PdfViewerProps {
  url: string;
  className?: string;
}

function PdfToolbar({ pageNumber, numPages, isLoading, scale, onPrev, onNext, onZoomIn, onZoomOut }: {
  pageNumber: number; numPages: number; isLoading: boolean; scale: number
  onPrev: () => void; onNext: () => void; onZoomIn: () => void; onZoomOut: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrev} disabled={pageNumber <= 1} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
        <span className="text-sm text-muted-foreground min-w-[80px] text-center">{isLoading ? "..." : `${pageNumber} / ${numPages}`}</span>
        <Button variant="ghost" size="icon" onClick={onNext} disabled={pageNumber >= numPages} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={scale <= MIN_ZOOM} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
        <span className="text-sm text-muted-foreground min-w-[50px] text-center">{Math.round(scale * PERCENT_MULTIPLIER)}%</span>
        <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={scale >= MAX_ZOOM} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function PdfErrorView({ error, className }: { error: string; className: string }) {
  return (
    <div className={`flex items-center justify-center h-full bg-muted/30 rounded-lg border ${className}`}>
      <div className="text-center text-muted-foreground">
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-1">Please try refreshing the page</p>
      </div>
    </div>
  );
}

export function PdfViewer({ url, className = "" }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => { setNumPages(numPages); setIsLoading(false); setError(null); }, []);
  const onDocumentLoadError = useCallback(() => { setError("Failed to load PDF document"); setIsLoading(false); }, []);

  if (error) return <PdfErrorView error={error} className={className} />;

  return (
    <div className={`flex flex-col h-full bg-muted/30 rounded-lg border overflow-hidden ${className}`}>
      <PdfToolbar pageNumber={pageNumber} numPages={numPages} isLoading={isLoading} scale={scale}
        onPrev={() => setPageNumber((p) => Math.max(p - 1, 1))} onNext={() => setPageNumber((p) => Math.min(p + 1, numPages))}
        onZoomIn={() => setScale((s) => Math.min(s + ZOOM_STEP, MAX_ZOOM))} onZoomOut={() => setScale((s) => Math.max(s - ZOOM_STEP, MIN_ZOOM))} />
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/50">
        {isLoading && <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError} loading={null} className="flex justify-center">
          <Page pageNumber={pageNumber} scale={scale} className="shadow-lg" renderTextLayer={true} renderAnnotationLayer={true}
            loading={<div className="flex items-center justify-center h-[600px] w-[450px] bg-white rounded shadow-lg"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>} />
        </Document>
      </div>
    </div>
  );
}
