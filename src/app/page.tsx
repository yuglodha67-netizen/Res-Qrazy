import React from "react";
import { HeroScrollAnimation } from "@/components/HeroScrollAnimation"

export default function Home() {
  return (
    <main className="w-full bg-black min-h-screen -mt-[72px] -mb-24">
      <React.Suspense fallback={<div className="flex justify-center items-center h-screen text-white bg-black animate-pulse">Loading experience...</div>}>
        <HeroScrollAnimation />
      </React.Suspense>
    </main>
  );
}
