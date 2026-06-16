import { redirect } from "next/navigation";
import React from "react";
import { HeroScrollAnimation } from "@/components/HeroScrollAnimation"

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  
  if (params.qr) {
    return (
      <main className="w-full bg-black min-h-screen -mt-[72px] -mb-24">
        <React.Suspense fallback={<div className="flex justify-center items-center h-screen text-white bg-black animate-pulse">Loading experience...</div>}>
          <HeroScrollAnimation />
        </React.Suspense>
      </main>
    );
  }

  redirect("/owner/login");
}
