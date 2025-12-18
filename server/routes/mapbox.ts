import { Router } from "express";

const router = Router();
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

// Geocode address to coordinates
router.get("/geocode", async (req, res) => {
  if (!MAPBOX_TOKEN) {
    return res.status(500).json({ message: "Mapbox token not configured" });
  }

  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}&limit=5`
    );

    if (!response.ok) {
      throw new Error("Mapbox geocoding request failed");
    }

    const data = await response.json();

    // Transform to simpler format
    const results = (
      Array.isArray((data as any)?.features) ? (data as any).features : []
    ).map((feature: any) => ({
      id: feature.id,
      address: feature.place_name,
      lat:
        Array.isArray(feature.center) && feature.center.length === 2
          ? feature.center[1]
          : null,
      lng:
        Array.isArray(feature.center) && feature.center.length === 2
          ? feature.center[0]
          : null,
    }));

    return res.json({ results });
  } catch (error) {
    console.error("Geocode error:", error);
    return res.status(500).json({ message: "Geocoding failed" });
  }
});

router.get("/route", async (req, res) => {
  if (!MAPBOX_TOKEN) {
    return res.status(500).json({ message: "Mapbox token not configured" });
  }

  const { startLat, startLng, endLat, endLng } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res
      .status(400)
      .json({ message: "startLat, startLng, endLat, endLng are required" });
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
    );

    if (!response.ok) {
      throw new Error("Mapbox directions request failed");
    }
    const data = (await response.json()) as {
      routes: { distance: number; duration: number; geometry: any }[];
    };

    const route = data.routes[0]!;

    return res.json({
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
    });
  } catch (error) {
    console.error("Route error:", error);
    return res.status(500).json({ message: "Routing failed" });
  }
});

export default router;
