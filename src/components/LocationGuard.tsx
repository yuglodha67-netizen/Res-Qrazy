"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ShieldAlert, Loader2, Navigation } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";

interface LocationGuardProps {
  children: React.ReactNode;
}

export function LocationGuard({ children }: LocationGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "requesting" | "verifying" | "verified" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyLocation = async () => {
      try {
        const sessionId = sessionStorage.getItem("qrazy_session_id");
        if (!sessionId) {
          setErrorMessage("No active session found. Please scan the QR code from your table.");
          setStatus("error");
          return;
        }

        // 1. Check if location security is even enabled
        const settingsDoc = await getDoc(doc(db, "settings", "location"));
        if (!settingsDoc.exists() || settingsDoc.data().enabled !== true) {
          setStatus("verified");
          return;
        }

        // 1. Check if session is already verified
        const sessionDoc = await getDoc(doc(db, "customer_sessions", sessionId));
        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          if (data.location_verified) {
            // Optional: check expiration of verification if needed
            setStatus("verified");
            return;
          }
        }

        // 2. Request Location Permission
        setStatus("requesting");
        if (!navigator.geolocation) {
          setErrorMessage("Geolocation is not supported by your browser.");
          setStatus("error");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setStatus("verifying");
            const { latitude, longitude, accuracy } = position.coords;

            // 3. Send to API for backend distance verification
            try {
              const res = await fetch("/api/verify-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  lat: latitude,
                  lng: longitude,
                  accuracy,
                  sessionId
                })
              });

              const data = await res.json();

              if (data.success) {
                setStatus("verified");
              } else {
                setErrorMessage(data.error || "You are currently outside the restaurant area. Please scan the QR code from your table.");
                setStatus("error");
              }
            } catch (err) {
              setErrorMessage("Unable to verify your location. Please try again.");
              setStatus("error");
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setErrorMessage("Location access is required to verify restaurant presence. Please enable location permission.");
            } else {
              setErrorMessage("Unable to retrieve your location. Please check your GPS signal.");
            }
            setStatus("error");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

      } catch (error) {
        console.error(error);
        setErrorMessage("An unexpected error occurred.");
        setStatus("error");
      }
    };

    verifyLocation();
  }, []);

  if (status === "verified") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-center p-10">
        
        {status === "error" ? (
          <>
            <div className="inline-flex p-4 bg-red-100 dark:bg-red-500/20 rounded-full mb-6">
              <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Access Denied
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-500/20 rounded-full mb-6 relative">
              <MapPin className="w-12 h-12 text-blue-600 dark:text-blue-500" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Security Check
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              {status === "requesting" && "Requesting location permission to verify your presence at the restaurant..."}
              {status === "verifying" && "Verifying your location securely on our servers..."}
              {status === "checking" && "Initializing security protocols..."}
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
