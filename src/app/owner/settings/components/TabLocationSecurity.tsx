"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, MapPin, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/utils/firebase/config";
import { toast } from "sonner";

export function LocationSecurityTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("200");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "location");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEnabled(data.enabled || false);
          setLatitude(data.latitude?.toString() || "");
          setLongitude(data.longitude?.toString() || "");
          setAddress(data.address || "");
          setRadius(data.allowedRadius?.toString() || "200");
        }
      } catch (error) {
        console.error("Failed to load location settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.loading("Detecting location...", { id: "loc" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        toast.success("Location updated successfully", { id: "loc" });
      },
      (error) => {
        toast.error("Failed to get location. Please ensure location permissions are granted.", { id: "loc" });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    if (enabled && (!latitude || !longitude)) {
      toast.error("Latitude and Longitude are required when Location Security is enabled.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "location"), {
        enabled,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        allowedRadius: parseInt(radius, 10),
        updatedAt: new Date()
      }, { merge: true });
      toast.success("Location security settings saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Location Security
        </h2>
        <p className="text-muted-foreground font-medium">
          Verify that customers are physically at your restaurant before granting them access to the menu and ordering system.
        </p>
      </div>

      <div className="bg-card border border-border/50 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
          <div>
            <h3 className="font-bold text-lg">Enable Location Security</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When enabled, customers will be prompted to share their GPS location when scanning a QR code.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
          </label>
        </div>

        <div className={`space-y-6 transition-opacity ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 21.1458"
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 79.0882"
                className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="outline" type="button" onClick={handleGetCurrentLocation} className="rounded-full shadow-sm">
              <MapPin className="w-4 h-4 mr-2" /> Detect My Current Location
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Restaurant Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, City, Country"
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Allowed Verification Radius (meters)</label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all font-medium appearance-none"
            >
              <option value="50">50 meters (Very Strict)</option>
              <option value="100">100 meters (Strict)</option>
              <option value="200">200 meters (Recommended)</option>
              <option value="500">500 meters (Lenient)</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Customers must be within this distance from the coordinates above to access the menu.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-8 py-6 font-bold shadow-lg shadow-primary/20">
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Save Location Security
        </Button>
      </div>
    </div>
  );
}
