"use client";

import { Loader2 } from "lucide-react";
import dynamic from 'next/dynamic';

// Replace the static import with dynamic import
const PdfViewer = dynamic(() => import('./pdf-viewer').then(mod => ({ default: mod.PdfViewer })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>,
});

export function DocumentViewerWithChat({ previewUrl }: { previewUrl: string }) {
    return (
        <div className="h-[700px]">
            <PdfViewer url={previewUrl} className="w-full h-full" />
        </div>
    );
}