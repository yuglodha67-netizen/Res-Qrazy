"use client";

import React, { useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; poster?: string; alt?: string; ar?: boolean; "ar-modes"?: string; "camera-controls"?: boolean; "auto-rotate"?: boolean; "shadow-intensity"?: string; };
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; poster?: string; alt?: string; ar?: boolean; "ar-modes"?: string; "camera-controls"?: boolean; "auto-rotate"?: boolean; "shadow-intensity"?: string; };
      }
    }
  }
}


interface ARViewerProps {
  modelUrl: string;
  posterUrl?: string;
  altText?: string;
}

export function ARViewer({ modelUrl, posterUrl, altText = "A 3D model of a dish" }: ARViewerProps) {
  useEffect(() => {
    // Import the model-viewer web component dynamically to avoid SSR issues
    import("@google/model-viewer").catch(console.error);
  }, []);

  return (
    <div className="w-full h-[60vh] md:h-[80vh] bg-muted/30 rounded-2xl overflow-hidden relative">
      <model-viewer
        src={modelUrl}
        poster={posterUrl}
        alt={altText}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-colors"
        >
          View in your space (AR)
        </button>
      </model-viewer>
    </div>
  );
}
