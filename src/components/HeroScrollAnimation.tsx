"use client";

import React, { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function HeroScrollAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const frameCount = 180;
  
  const [settings, setSettings] = useState({
    name: "QRAZY",
    tagline: "Experience the future of dining."
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          name: data.name || "QRAZY",
          tagline: data.tagline || "Experience the future of dining."
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      // Format number to 3 digits, e.g., 001, 002...
      const frameNumber = i.toString().padStart(3, "0");
      img.src = `/frames/ezgif-frame-${frameNumber}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
          // Draw the first frame initially
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d", { alpha: false });
            if (ctx && loadedImages[0]) {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
              drawCoverImage(ctx, loadedImages[0], canvas.width, canvas.height);
            }
          }
        }
      };
      loadedImages.push(img);
    }
  }, []);

  const targetFrame = useRef(0);
  const currentFrame = useRef(0);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const html = document.documentElement;
      const scrollTop = html.scrollTop;
      const maxScrollTop = html.scrollHeight - window.innerHeight;
      
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
      targetFrame.current = scrollFraction * (frameCount - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initialize target frame based on initial scroll position
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimize performance
    if (!ctx) return;

    const render = () => {
      // Smooth interpolation (lerping)
      currentFrame.current += (targetFrame.current - currentFrame.current) * 0.08;
      
      const frameIndex = Math.floor(currentFrame.current);
      
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      if (images[frameIndex]) {
        drawCoverImage(ctx, images[frameIndex], canvas.width, canvas.height);
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [images]);

  const drawCoverImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      // Canvas is wider than the image
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      // Canvas is taller than the image
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  return (
    <div className="relative w-full" style={{ height: "200vh" }}>
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        
        {/* Dynamic Restaurant Name Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-6 pointer-events-auto">
            {settings.name}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl drop-shadow-lg mb-8 pointer-events-auto">
            {settings.tagline}
          </p>
          <div className="pointer-events-auto">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
            >
              View Menu <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 animate-pulse text-white pointer-events-none">
          <p className="text-sm font-light tracking-widest uppercase mb-2">Scroll</p>
          <div className="w-[1px] h-12 bg-white"></div>
        </div>

        {/* Theme Toggle in the Corner */}
        <div className="absolute top-6 right-6 z-50 pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
