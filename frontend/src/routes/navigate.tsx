import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import { useRoute, formatDistance, formatDuration } from "../hooks/useRoute";
import { useAddresses } from "../hooks/useAddresses";
import { useToast } from "../components/Toast";
import "mapbox-gl/dist/mapbox-gl.css";

type NavigateSearch = {
  address: string;
  lat: number;
  lng: number;
  startLat?: number;
  startLng?: number;
};

export const Route = createFileRoute("/navigate")({
  component: NavigatePage,
  validateSearch: (search: Record<string, unknown>): NavigateSearch => ({
    address: (search.address as string) || "",
    lat: Number(search.lat) || 0,
    lng: Number(search.lng) || 0,
    startLat: search.startLat ? Number(search.startLat) : undefined,
    startLng: search.startLng ? Number(search.startLng) : undefined,
  }),
});

function NavigatePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { address, lat, lng, startLat, startLng } = Route.useSearch();
  const { saveAddress } = useAddresses();

  const mapRef = useRef<MapRef | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(startLat && startLng ? { lat: startLat, lng: startLng } : null);
  const [isTracking, setIsTracking] = useState(true);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const destination = {
    lat: lat || 40.7128,
    lng: lng || -74.006,
    address: address || "Unknown destination",
  };

  const {
    data: routeData,
    isLoading: routeLoading,
    error: routeError,
  } = useRoute(
    userLocation?.lat ?? 0,
    userLocation?.lng ?? 0,
    destination.lat,
    destination.lng
  );

  // Watch user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setLocationError(null);

        if (isTracking && mapRef.current && mapLoaded) {
          mapRef.current.getMap().easeTo({
            center: [newLocation.lng, newLocation.lat],
            duration: 500,
          });
        }
      },
      (error) => {
        // Only set error if we don't have a manual starting location
        if (!startLat || !startLng) {
          setLocationError(
            error.code === 1
              ? "Location access denied"
              : error.code === 2
                ? "Location unavailable"
                : "Location timeout"
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, mapLoaded, startLat, startLng]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.getMap().easeTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 500,
      });
      setIsTracking(true);
    }
  }, [userLocation]);

  const handleSaveDestination = useCallback(() => {
    saveAddress(
      { address, lat, lng },
      {
        onSuccess: () => {
          setIsSaved(true);
          showToast("Saved to recents", "success");
        },
        onError: () => showToast("Couldn't save", "error"),
      }
    );
  }, [address, lat, lng, saveAddress, showToast]);

  const routeGeoJSON = routeData?.geometry
    ? {
        type: "Feature" as const,
        properties: {},
        geometry: routeData.geometry,
      }
    : null;

  if (!mapboxToken) {
    return (
      <div className="h-screen bg-[#F1F3F4] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full bg-[#FCE8E6] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#EA4335]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-medium text-[#202124] mb-2">Map unavailable</h2>
        <p className="text-[14px] text-[#5F6368] text-center mb-6">
          Mapbox token is missing. Please check your configuration.
        </p>
        <button
          onClick={() => navigate({ to: "/home" })}
          className="px-6 py-3 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-full text-[14px] font-medium transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#E5E3DF]">
      {/* Map Container */}
      <div className="absolute inset-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: userLocation?.lng || destination.lng,
            latitude: userLocation?.lat || destination.lat,
            zoom: 14,
            pitch: 0,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={mapboxToken}
          onLoad={handleMapLoad}
          onDragStart={() => setIsTracking(false)}
          interactive={true}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {/* Route Line */}
          {routeGeoJSON && (
            <Source type="geojson" data={routeGeoJSON}>
              {/* Route shadow */}
              <Layer
                id="route-shadow"
                type="line"
                paint={{
                  "line-color": "#000000",
                  "line-width": 10,
                  "line-opacity": 0.1,
                  "line-blur": 3,
                }}
              />
              {/* Route outline */}
              <Layer
                id="route-outline"
                type="line"
                paint={{
                  "line-color": "#1557B0",
                  "line-width": 7,
                }}
              />
              {/* Route line */}
              <Layer
                id="route"
                type="line"
                paint={{
                  "line-color": "#4285F4",
                  "line-width": 5,
                }}
              />
            </Source>
          )}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              longitude={userLocation.lng}
              latitude={userLocation.lat}
              anchor="center"
            >
              <div className="relative">
                {/* Accuracy ring */}
                <div className="absolute inset-0 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-[#4285F4]/20 rounded-full animate-pulse-ring" />
                {/* User dot */}
                <div className="relative w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#4285F4] rounded-full" />
                </div>
              </div>
            </Marker>
          )}

          {/* Destination Marker */}
          <Marker
            longitude={destination.lng}
            latitude={destination.lat}
            anchor="bottom"
          >
            <div className="relative animate-scaleIn">
              <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
                <ellipse cx="16" cy="41" rx="8" ry="3" fill="rgba(0,0,0,0.2)" />
                <path
                  d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28c0-8.84-7.16-16-16-16z"
                  fill="#EA4335"
                />
                <circle cx="16" cy="16" r="6" fill="white" />
              </svg>
            </div>
          </Marker>
        </Map>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 safe-area-top">
        <div className="flex items-center gap-3 p-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#F8F9FA] active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Destination Preview */}
          <div className="flex-1 bg-white rounded-full shadow-md px-4 py-3 min-w-0">
            <p className="text-[15px] text-[#202124] truncate font-medium">
              {destination.address.split(",")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Re-center Button */}
      {userLocation && !isTracking && (
        <button
          onClick={handleCenterOnUser}
          className="absolute right-4 bottom-[240px] w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#F8F9FA] active:scale-95 transition-all animate-scaleIn z-10"
        >
          <svg className="w-5 h-5 text-[#5F6368]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>
      )}

      {/* Bottom Sheet */}
      <div
        className={`absolute left-0 right-0 bg-white z-20 transition-all duration-300 ease-out safe-area-bottom ${
          sheetExpanded ? "bottom-0 rounded-t-3xl" : "bottom-0 rounded-t-3xl"
        }`}
        style={{
          transform: sheetExpanded ? "translateY(0)" : "translateY(0)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Handle */}
        <div
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setSheetExpanded(!sheetExpanded)}
        >
          <div className="w-10 h-1 bg-[#DADCE0] rounded-full" />
        </div>

        {/* Sheet Content */}
        <div className="px-5 pb-5">
          {/* ETA Section */}
          {routeLoading ? (
            <div className="flex items-center gap-6 mb-5">
              <div className="w-24 h-10 skeleton rounded-lg" />
              <div className="w-32 h-6 skeleton rounded-lg" />
            </div>
          ) : routeError ? (
            <div className="flex items-center gap-3 mb-5 text-[#EA4335]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[14px]">Route unavailable</span>
            </div>
          ) : routeData ? (
            <div className="flex items-baseline gap-4 mb-5">
              <span className="text-[36px] font-medium text-[#34A853] leading-none">
                {formatDuration(routeData.duration)}
              </span>
              <span className="text-[16px] text-[#5F6368]">
                {formatDistance(routeData.distance)}
              </span>
            </div>
          ) : null}

          {/* Location status */}
          {locationError && !userLocation && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#FEF7E0] rounded-lg">
              <svg className="w-4 h-4 text-[#B06000]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[13px] text-[#B06000]">{locationError}</span>
            </div>
          )}

          {/* Destination Details */}
          <div className="flex items-start gap-3 mb-5 p-3 bg-[#F8F9FA] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#EA4335]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#EA4335]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-medium text-[#202124] mb-0.5">
                {destination.address.split(",")[0]}
              </p>
              <p className="text-[13px] text-[#5F6368] truncate">
                {destination.address.split(",").slice(1).join(",")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveDestination}
              disabled={isSaved}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-medium transition-all active:scale-[0.98] ${
                isSaved
                  ? "bg-[#E6F4EA] text-[#137333]"
                  : "bg-[#F1F3F4] text-[#202124] hover:bg-[#E8E8E8]"
              }`}
            >
              {isSaved ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (userLocation) {
                  const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination.lat},${destination.lng}`;
                  window.open(url, "_blank");
                } else {
                  const url = `https://www.google.com/maps/dir//${destination.lat},${destination.lng}`;
                  window.open(url, "_blank");
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-full text-[14px] font-medium transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Maps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
