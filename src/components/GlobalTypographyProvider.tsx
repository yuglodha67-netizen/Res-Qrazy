"use client";

import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase/config";

const FONT_SCALES = {
  "small": "90%",
  "default": "100%",
  "medium": "110%",
  "large": "120%",
  "extra-large": "130%"
};

/**
 * GlobalTypographyProvider listens to the restaurant's settings and automatically
 * scales the root html font-size. Because Tailwind relies on 'rem' (root em), 
 * scaling the root font-size proportionally scales all text, padding, and margins 
 * seamlessly across the entire application without breaking layouts.
 */
export function GlobalTypographyProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState<string>("100%");

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fontScalePreference = data.fontScale || "default";
        const percentage = FONT_SCALES[fontScalePreference as keyof typeof FONT_SCALES] || "100%";
        setScale(percentage);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    // Apply the scale to the document root
    if (typeof document !== "undefined") {
      document.documentElement.style.fontSize = scale;
    }
  }, [scale]);

  return <>{children}</>;
}
