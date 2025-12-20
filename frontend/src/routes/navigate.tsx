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
  const {
    location: geoLocation,
    isWatching,
    startWatching,
    stopWatching,
  } = useGeolocation();
  const { saveAddress } = useAddresses();

  const location =
    passedStartLat && passedStartLng
      ? { lat: passedStartLat, lng: passedStartLng, accuracy: 0 }
      : geoLocation;

  const { data: routeData, isLoading: routeLoading } = useRoute(
    location?.lat ?? null,
    location?.lng ?? null,
    destLat,
    destLng
  );

  const mapRef = useRef<MapRef>(null);
  const hasSavedRef = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navRouter({ to: "/login", replace: true });
    }
  }, [authLoading, isAuthenticated, navRouter]);

  useEffect(() => {
    if (!passedStartLat || !passedStartLng) {
      startWatching();
      return () => stopWatching();
    }
  }, [startWatching, stopWatching, passedStartLat, passedStartLng]);

  useEffect(() => {
    if (!hasSavedRef.current && address && destLat && destLng) {
      hasSavedRef.current = true;
      saveAddress({ address, lat: destLat, lng: destLng });
    }
  }, [address, destLat, destLng, saveAddress]);

  useEffect(() => {
    if (location && mapRef.current) {
      const bounds = [
        [Math.min(location.lng, destLng), Math.min(location.lat, destLat)],
        [Math.max(location.lng, destLng), Math.max(location.lat, destLat)],
      ] as [[number, number], [number, number]];

      mapRef.current.fitBounds(bounds, {
        padding: { top: 80, bottom: 280, left: 40, right: 40 },
        duration: 1000,
      });
    }
  }, [location?.lat, location?.lng, destLat, destLng]);


  const handleBack = () => {
    stopWatching();
    navRouter({ to: "/home" });
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#37352F]" />
      </div>
    );
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-[#E3E2DF] p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-[#FBE4E4] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-[#E03E3E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-[18px] font-semibold text-[#37352F] mb-2">
            Map not configured
          </h2>
          <p className="text-[14px] text-[#787774] mb-6">
            Please add your Mapbox token to the environment variables.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-[#F7F6F3] hover:bg-[#E3E2DF] text-[#37352F] text-[14px] font-medium rounded-md transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const routeLayer = {
    id: "route",
    type: "line" as const,
    layout: {
      "line-join": "round" as const,
      "line-cap": "round" as const,
    },
    paint: {
      "line-color": "#2F80ED",
      "line-width": 4,
      "line-opacity": 0.9,
    },
  };

  return (
    <div className="h-screen w-screen relative bg-[#F7F6F3]">
      {/* Map */}
      {mapError ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-[14px] text-[#E03E3E] mb-4">{mapError}</p>
            <button
              onClick={() => setMapError(null)}
              className="px-4 py-2 bg-white border border-[#E3E2DF] text-[#37352F] rounded-md hover:bg-[#F7F6F3]"
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
          mapStyle="mapbox://styles/mapbox/light-v11"
          onError={(e) => setMapError(e.error?.message || "Map failed to load")}
        >
          <NavigationControl position="top-right" showCompass={false} />

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

          {location && (
            <Marker
              latitude={location.lat}
              longitude={location.lng}
              anchor="center"
            >
              <div className="relative">
                <div className="w-4 h-4 bg-[#2F80ED] rounded-full border-2 border-white shadow-md" />
                <div className="absolute -inset-2 bg-[#2F80ED]/20 rounded-full animate-ping" />
              </div>
            </Marker>
          )}

          {destLat && destLng && (
            <Marker latitude={destLat} longitude={destLng} anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#E03E3E] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
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
                <div className="w-1 h-1 bg-[#E03E3E] rounded-full -mt-0.5" />
              </div>
            </Marker>
          )}
        </Map>
      )}

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-10 w-10 h-10 bg-white border border-[#E3E2DF] rounded-lg shadow-sm hover:bg-[#F7F6F3] transition-colors flex items-center justify-center"
      >
        <svg
          className="w-5 h-5 text-[#37352F]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Navigation Info Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 safe-area-bottom">
        <div className="bg-white rounded-t-2xl shadow-lg border-t border-[#E3E2DF]">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-[#E3E2DF] rounded-full" />
          </div>

          <div className="px-5 pb-6 sm:px-6">
            {/* Destination */}
            <div className="flex items-start gap-3 pb-5 border-b border-[#E3E2DF]">
              <div className="w-10 h-10 rounded-lg bg-[#FBE4E4] flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[#E03E3E]"
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
                <p className="text-[12px] text-[#9B9A97] uppercase tracking-wide mb-0.5">
                  Destination
                </p>
                <p className="text-[15px] text-[#37352F] font-medium truncate">
                  {address}
                </p>
              </div>
            </div>

            {/* Transport Mode */}
            <div className="flex items-center gap-2 pt-4 pb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E7F0FD] text-[#2F80ED] rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
                <span className="text-[12px] font-medium">Driving</span>
              </div>
              <span className="text-[12px] text-[#9B9A97]">Fastest route</span>
            </div>

            {/* Stats */}
            <div className="pt-2">
              {routeLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#787774]" />
                </div>
              ) : routeData ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-[#F7F6F3] rounded-lg">
                    <p className="text-[11px] text-[#9B9A97] uppercase tracking-wide mb-1">
                      Distance
                    </p>
                    <p className="text-[20px] font-semibold text-[#37352F]">
                      {formatDistance(routeData.distance)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#F7F6F3] rounded-lg">
                    <p className="text-[11px] text-[#9B9A97] uppercase tracking-wide mb-1">
                      Duration
                    </p>
                    <p className="text-[20px] font-semibold text-[#37352F]">
                      {formatDuration(routeData.duration)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#E7F0FD] rounded-lg">
                    <p className="text-[11px] text-[#2F80ED] uppercase tracking-wide mb-1">
                      Arrival
                    </p>
                    <p className="text-[20px] font-semibold text-[#2F80ED]">
                      {formatETA(routeData.duration)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-[14px] text-[#787774]">
                  {!location
                    ? "Waiting for location..."
                    : "Unable to calculate route"}
                </div>
              )}
            </div>

            {/* Status */}
            {(isWatching || (passedStartLat && passedStartLng)) && (
              <div className="flex items-center justify-center gap-2 mt-4 text-[13px]">
                {isWatching && !passedStartLat ? (
                  <>
                    <div className="w-2 h-2 bg-[#0F7B6C] rounded-full animate-pulse" />
                    <span className="text-[#0F7B6C]">Live tracking</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 text-[#787774]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-[#787774]">Manual start point</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
