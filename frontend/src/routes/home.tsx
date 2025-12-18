import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAddresses } from "../hooks/useAddresses";
import { useGeolocation } from "../hooks/useGeolocation";
import { useGeocode } from "../hooks/useGeocode";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addresses, isLoading: addressesLoading } = useAddresses();
  const {
    location,
    error: locationError,
    isLoading: locationLoading,
    refresh: refreshLocation,
  } = useGeolocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useGeocode(searchQuery);

  // Manual location state
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualLocationSet, setManualLocationSet] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Get the current location (either from geolocation or manual entry)
  const currentLocation = manualLocationSet
    ? { lat: parseFloat(manualLat), lng: parseFloat(manualLng) }
    : location;

  const handleSelectDestination = (
    address: string,
    lat: number,
    lng: number
  ) => {
    // Navigate to navigation page with destination params and current location
    navigate({
      to: "/navigate",
      search: {
        address,
        lat,
        lng,
        // Pass current location if available
        ...(currentLocation && {
          startLat: currentLocation.lat,
          startLng: currentLocation.lng,
        }),
      },
    });
  };

  const handleSetManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setManualLocationSet(true);
      setShowManualLocation(false);
    }
  };

  const handleUseDefaultLocation = () => {
    // Default to a common location (can be changed)
    setManualLat("47.6062");
    setManualLng("-122.3321");
    setManualLocationSet(true);
    setShowManualLocation(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">NavApp</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user?.email}</span>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-white transition text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Location Status */}
        <div className="mb-6">
          {locationLoading && !manualLocationSet ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500" />
              <span>Getting your location...</span>
            </div>
          ) : manualLocationSet ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Manual location ({manualLat}, {manualLng})
                </span>
              </div>
              <button
                onClick={() => {
                  setManualLocationSet(false);
                  refreshLocation();
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Try GPS again
              </button>
            </div>
          ) : locationError ? (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/50">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
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
                <div className="flex-1">
                  <p className="text-amber-400 text-sm font-medium">
                    {locationError}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    You can still search and navigate by entering your location
                    manually.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowManualLocation(true)}
                      className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                      Enter manually
                    </button>
                    <button
                      onClick={handleUseDefaultLocation}
                      className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                    >
                      Use default location
                    </button>
                    <button
                      onClick={refreshLocation}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : location ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">
                Location found ({location.lat.toFixed(4)},{" "}
                {location.lng.toFixed(4)})
              </span>
            </div>
          ) : null}
        </div>

        {/* Manual Location Modal */}
        {showManualLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Enter Your Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g., 47.6062"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g., -122.3321"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Tip: You can get coordinates from Google Maps by right-clicking
                  on a location.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowManualLocation(false)}
                  className="flex-1 py-2 text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetManualLocation}
                  disabled={!manualLat || !manualLng}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
                >
                  Set Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="relative z-20 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Where do you want to go?
          </h2>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter destination address..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.length >= 3 && (
              <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                {suggestionsLoading ? (
                  <div className="p-4 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500 mx-auto" />
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        handleSelectDestination(
                          suggestion.address,
                          suggestion.lat,
                          suggestion.lng
                        );
                        setShowSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-700 transition flex items-start gap-3"
                    >
                      <svg
                        className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="text-white text-sm">
                        {suggestion.address}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-sm">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Address History */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Destinations
          </h2>

          {addressesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() =>
                    handleSelectDestination(addr.address, addr.lat, addr.lng)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition flex items-start gap-3 text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition">
                    <svg
                      className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{addr.address}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(addr.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-slate-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-slate-400">No recent destinations</p>
              <p className="text-slate-500 text-sm mt-1">
                Your navigation history will appear here
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}
