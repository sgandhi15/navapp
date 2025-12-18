import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAddresses } from "../hooks/useAddresses";
import { useGeolocation } from "../hooks/useGeolocation";
import { useGeocode } from "../hooks/useGeocode";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    addresses,
    isLoading: addressesLoading,
    deleteAddress,
  } = useAddresses();
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const currentLocation = manualLocationSet
    ? { lat: parseFloat(manualLat), lng: parseFloat(manualLng) }
    : location;

  const handleSelectDestination = (
    address: string,
    lat: number,
    lng: number
  ) => {
    navigate({
      to: "/navigate",
      search: {
        address,
        lat,
        lng,
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
    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      setManualLocationSet(true);
      setShowManualLocation(false);
      showToast("Location set successfully", "success");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#37352F]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#E3E2DF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#37352F] flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-[#37352F] hidden sm:block">
              NavApp
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#787774] hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-[13px] text-[#787774] hover:text-[#37352F] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-[#37352F] tracking-tight mb-2">
            Where to?
          </h1>
          <p className="text-[15px] text-[#787774]">
            Search for a destination or pick from your recent places
          </p>
        </div>

        {/* Location Status */}
        <div className="mb-6">
          {locationLoading && !manualLocationSet ? (
            <div className="flex items-center gap-2 text-[14px] text-[#787774]">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#E3E2DF] border-t-[#787774]" />
              <span>Getting your location...</span>
            </div>
          ) : manualLocationSet ? (
            <div className="flex items-center justify-between p-3 bg-[#E7F0FD] rounded-lg">
              <div className="flex items-center gap-2 text-[14px] text-[#2F80ED]">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <span>Manual location set</span>
              </div>
              <button
                onClick={() => {
                  setManualLocationSet(false);
                  refreshLocation();
                }}
                className="text-[13px] text-[#2F80ED] hover:underline"
              >
                Use GPS
              </button>
            </div>
          ) : locationError ? (
            <div className="p-4 bg-[#FBF3DB] rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div className="flex-1">
                  <p className="text-[14px] text-[#37352F] font-medium mb-1">
                    Location unavailable
                  </p>
                  <p className="text-[13px] text-[#787774] mb-3">
                    {locationError}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowManualLocation(true)}
                      className="px-3 py-1.5 text-[13px] bg-white border border-[#E3E2DF] rounded-md hover:bg-[#F7F6F3] transition-colors"
                    >
                      Enter manually
                    </button>
                    <button
                      onClick={refreshLocation}
                      className="px-3 py-1.5 text-[13px] text-[#787774] hover:text-[#37352F] transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : location ? (
            <div className="flex items-center gap-2 text-[14px] text-[#0F7B6C]">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Location ready</span>
            </div>
          ) : null}
        </div>

        {/* Search */}
        <div className="relative z-20 mb-10">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9B9A97]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for an address..."
              className="w-full pl-10 pr-4 py-3 text-[15px] bg-[#F7F6F3] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:bg-white transition-all placeholder:text-[#9B9A97]"
            />
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.length >= 3 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-[#E3E2DF] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
              {suggestionsLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#E3E2DF] border-t-[#787774] mx-auto" />
                </div>
              ) : suggestions.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {suggestions.map((suggestion) => (
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
                      className="w-full px-4 py-3 text-left hover:bg-[#F7F6F3] transition-colors flex items-start gap-3 border-b border-[#E3E2DF] last:border-0"
                    >
                      <svg
                        className="w-5 h-5 text-[#9B9A97] mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="text-[14px] text-[#37352F]">
                        {suggestion.address}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[14px] text-[#787774]">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Destinations */}
        <div>
          <h2 className="text-[13px] font-medium text-[#9B9A97] uppercase tracking-wide mb-4">
            Recent
          </h2>

          {addressesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E3E2DF] border-t-[#787774]" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-1">
              {addresses.map((addr) => (
                <div key={addr.id} className="group relative">
                  <button
                    onClick={() =>
                      handleSelectDestination(addr.address, addr.lat, addr.lng)
                    }
                    className="w-full px-3 py-3 rounded-lg hover:bg-[#F7F6F3] transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F7F6F3] group-hover:bg-[#E3E2DF] flex items-center justify-center flex-shrink-0 transition-colors">
                      <svg
                        className="w-4 h-4 text-[#787774]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-[14px] text-[#37352F] truncate">
                        {addr.address}
                      </p>
                      <p className="text-[12px] text-[#9B9A97] mt-0.5">
                        {new Date(addr.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-[#9B9A97] group-hover:text-[#787774] transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(addr.id, {
                        onSuccess: () => showToast("Removed", "success"),
                        onError: () => showToast("Failed to remove", "error"),
                      });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-[#FBE4E4] rounded-md transition-all"
                    title="Remove"
                  >
                    <svg
                      className="w-4 h-4 text-[#9B9A97] hover:text-[#E03E3E]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[#9B9A97]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
              </div>
              <p className="text-[14px] text-[#37352F] font-medium mb-1">
                No recent destinations
              </p>
              <p className="text-[13px] text-[#9B9A97]">
                Search for a place to get started
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Manual Location Modal */}
      {showManualLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-[#E3E2DF] shadow-xl w-full max-w-md animate-fadeIn">
            <div className="p-6">
              <h3 className="text-[18px] font-semibold text-[#37352F] mb-1">
                Enter location
              </h3>
              <p className="text-[14px] text-[#787774] mb-6">
                Enter coordinates or get them from Google Maps
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g., 47.6062"
                    className="notion-input"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#37352F] mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g., -122.3321"
                    className="notion-input"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-[#E3E2DF] bg-[#F7F6F3] rounded-b-xl">
              <button
                onClick={() => setShowManualLocation(false)}
                className="flex-1 py-2 text-[14px] text-[#787774] hover:text-[#37352F] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetManualLocation}
                disabled={!manualLat || !manualLng}
                className="flex-1 py-2 bg-[#2F80ED] hover:bg-[#2671D9] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-md transition-colors"
              >
                Set location
              </button>
            </div>
          </div>
        </div>
      )}

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
