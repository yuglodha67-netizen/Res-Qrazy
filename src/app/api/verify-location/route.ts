import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebase/admin";

// Haversine formula to calculate distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng, accuracy, sessionId, qrToken } = body;

    if (!lat || !lng || !sessionId) {
      return NextResponse.json({ success: false, error: "Missing location or session data" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Server misconfigured: Missing Firebase Admin credentials" }, { status: 500 });
    }

    // 1. Fetch Location Settings
    const settingsDoc = await adminDb.collection("settings").doc("location").get();
    
    // If no location settings exist or it's disabled, we might allow it depending on owner configuration.
    // For safety, let's assume if it's not explicitly disabled, we require it. But actually, if they haven't configured it, we should pass them to not break existing instances.
    const settings = settingsDoc.exists ? settingsDoc.data() : null;
    
    if (!settings || settings.enabled !== true) {
      // Location verification is globally disabled or not configured
      await adminDb.collection("customer_sessions").doc(sessionId).update({
        location_verified: true,
        verified_at: new Date(),
        verification_method: "bypassed_settings_disabled"
      });
      return NextResponse.json({ success: true, bypassed: true });
    }

    const { latitude: restLat, longitude: restLng, allowedRadius } = settings;

    if (!restLat || !restLng) {
      // Settings are enabled but no coordinates saved - fail safe by allowing or blocking? Block is safer but annoying. Let's block.
      return NextResponse.json({ success: false, error: "Restaurant coordinates not configured properly." }, { status: 500 });
    }

    const radius = allowedRadius || 200; // Default 200m

    // 2. Calculate Distance
    const distance = calculateDistance(lat, lng, restLat, restLng);

    // Consider accuracy. If accuracy is very bad (e.g. 1000m), it might throw them outside.
    // We could subtract accuracy from distance to be generous, but that allows spoofing easily if they submit bad accuracy.
    // Just stick to raw calculated distance for strict security.

    if (distance <= radius) {
      // 3. Update Session Document
      await adminDb.collection("customer_sessions").doc(sessionId).update({
        location_verified: true,
        verified_at: new Date(),
        distance_meters: Math.round(distance),
        accuracy_meters: Math.round(accuracy)
      });

      return NextResponse.json({ success: true, distance });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Outside allowed radius", 
        distance: Math.round(distance),
        radius 
      }, { status: 403 });
    }

  } catch (error: any) {
    console.error("Location verification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
