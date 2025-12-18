import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
} from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAuth } from "../hooks/useAuth";
import { useGeolocation } from "../hooks/useGeolocation";
import {
  useRoute,
  formatDistance,
  formatDuration,
  formatETA,
} from "../hooks/useRoute";
import { useAddresses } from "../hooks/useAddresses";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface NavigateSearch {
  address: string;
  lat: number;
  lng: number;
  startLat?: number;
  startLng?: number;
}

export const Route = createFileRoute("/navigate")({
  validateSearch: (search: Record<string, unknown>): NavigateSearch => {
    return {
      address: String(search.address || ""),
      lat: Number(search.lat) || 0,
      lng: Number(search.lng) || 0,
      startLat: search.startLat ? Number(search.startLat) : undefined,
      startLng: search.startLng ? Number(search.startLng) : undefined,
    };
  },
  component: NavigatePage,
});

function NavigatePage() {
  const navRouter = useNavigate();
  const {
    address,
    lat: destLat,
    lng: destLng,
    startLat: passedStartLat,
    startLng: passedStartLng,
  } = Route.useSearch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { location: geoLocation, isWatching, startWatching, stopWatching } =
    useGeolocation();
  const { saveAddress } = useAddresses();

  // Use passed location or geolocation
  const location =
    passedStartLat && passedStartLng
      ? { lat: passedStartLat, lng: passedStartLng, accuracy: 0 }
      : geoLocation;

  const {
    data: routeData,
    isLoading: routeLoading,
    refetch: refetchRoute,
  } = useRoute(location?.lat ?? null, location?.lng ?? null, destLat, destLng);

  const mapRef = useRef<MapRef>(null);
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navRouter({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navRouter]);

  // Start watching location when component mounts (only if not using passed location)
  useEffect(() => {
    if (!passedStartLat || !passedStartLng) {
      startWatching();
      return () => stopWatching();
    }
  }, [startWatching, stopWatching, passedStartLat, passedStartLng]);

  // Save address to history (only once)
  useEffect(() => {
    if (!hasSavedAddress && address && destLat && destLng) {
      saveAddress({ address, lat: destLat, lng: destLng });
      setHasSavedAddress(true);
    }
  }, [address, destLat, destLng, hasSavedAddress, saveAddress]);

  // Fit map to show both markers
  useEffect(() => {
    if (location && mapRef.current) {
      const bounds = [
        [Math.min(location.lng, destLng), Math.min(location.lat, destLat)],
        [Math.max(location.lng, destLng), Math.max(location.lat, destLat)],
      ] as [[number, number], [number, number]];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 250, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [location?.lat, location?.lng, destLat, destLng]);

  // Refetch route when location changes significantly (only for live tracking)
  useEffect(() => {
    if (geoLocation && isWatching && !passedStartLat) {
      const timer = setTimeout(() => {
        refetchRoute();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [geoLocation?.lat, geoLocation?.lng, isWatching, refetchRoute, passedStartLat]);

  const handleBack = () => {
    stopWatching();
    navRouter({ to: "/home" });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Check for Mapbox token
  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md text-center border border-slate-700">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Map Configuration Missing
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Mapbox token is not configured. Please add VITE_MAPBOX_TOKEN to your
            environment variables.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Route line layer style
  const routeLayer = {
    id: "route",
    type: "line" as const,
    layout: {
      "line-join": "round" as const,
      "line-cap": "round" as const,
    },
    paint: {
      "line-color": "#10b981",
      "line-width": 5,
      "line-opacity": 0.8,
    },
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Map */}
      {mapError ? (
        <div className="h-full w-full bg-slate-800 flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{mapError}</p>
            <button
              onClick={() => setMapError(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            latitude: destLat || 47.6062,
            longitude: destLng || -122.3321,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onError={(e) => setMapError(e.error?.message || "Map failed to load")}
        >
          <NavigationControl position="top-right" />

          {/* Route Line */}
          {routeData?.geometry && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: routeData.geometry,
              }}
            >
              <Layer {...routeLayer} />
            </Source>
          )}

          {/* Current Location Marker */}
          {location && (
            <Marker
              latitude={location.lat}
              longitude={location.lng}
              anchor="center"
            >
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-30" />
              </div>
            </Marker>
          )}

          {/* Destination Marker */}
          {destLat && destLng && (
            <Marker latitude={destLat} longitude={destLng} anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full -mt-1" />
              </div>
            </Marker>
          )}
        </Map>
      )}

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 p-3 bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-slate-700 transition"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Navigation Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-t-3xl shadow-2xl p-6 pb-8">
          {/* Destination */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                Destination
              </p>
              <p className="text-white font-medium truncate">{address}</p>
            </div>
          </div>

          {/* Stats */}
          {routeLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
            </div>
          ) : routeData ? (
            <div className="grid grid-cols-3 gap-4">
              {/* Distance */}
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Distance
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatDistance(routeData.distance)}
                </p>
              </div>

              {/* Duration */}
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Duration
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatDuration(routeData.duration)}
                </p>
              </div>

              {/* ETA */}
              <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-emerald-400 text-xs uppercase tracking-wide mb-1">
                  ETA
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatETA(routeData.duration)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400">
              {!location
                ? "Waiting for location..."
                : "Unable to calculate route"}
            </div>
          )}

          {/* Live indicator */}
          {isWatching && !passedStartLat && (
            <div className="flex items-center justify-center gap-2 mt-4 text-emerald-400 text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Live tracking active</span>
            </div>
          )}

          {/* Manual location indicator */}
          {passedStartLat && passedStartLng && (
            <div className="flex items-center justify-center gap-2 mt-4 text-cyan-400 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Using manual start location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
