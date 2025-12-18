import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useGeocode(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  // Manual location state
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualLocationSet, setManualLocationSet] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
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
    setIsSearchFocused(false);
    setSearchQuery("");
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
      showToast("Location set", "success");
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-[#F1F3F4] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#DADCE0] border-t-[#1A73E8] rounded-full animate-spin" />
      </div>
    );
  }

  const showSearchResults = isSearchFocused && searchQuery.length >= 2;

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-[#F1F3F4] pt-3 px-4 pb-2 safe-area-top">
        <div className="relative">
          {/* Search Bar */}
          <div
            className={`relative bg-white rounded-full transition-all duration-200 ${
              isSearchFocused ? "shadow-lg" : "shadow-md"
            }`}
          >
            {/* Back/Search Icon */}
            <button
              onClick={() => {
                if (isSearchFocused) {
                  setIsSearchFocused(false);
                  setSearchQuery("");
                }
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors"
            >
              {isSearchFocused ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search here"
              className="w-full py-3.5 pl-14 pr-14 text-[16px] bg-transparent border-none outline-none text-[#202124] placeholder-[#9AA0A6]"
            />

            {/* Profile/Clear Button */}
            <button
              onClick={() => {
                if (searchQuery) {
                  setSearchQuery("");
                  searchRef.current?.focus();
                } else {
                  logout();
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F1F3F4] transition-colors"
            >
              {searchQuery ? (
                <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1A73E8] flex items-center justify-center text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </button>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden animate-scaleIn">
              {suggestionsLoading ? (
                <div className="p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                      <div className="w-10 h-10 rounded-full skeleton" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 skeleton rounded mb-2" />
                        <div className="h-3 w-1/2 skeleton rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() =>
                        handleSelectDestination(
                          suggestion.address,
                          suggestion.lat,
                          suggestion.lng
                        )
                      }
                      className="g-list-item w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#5F6368]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[15px] text-[#202124] truncate">
                          {suggestion.address.split(",")[0]}
                        </p>
                        <p className="text-[13px] text-[#5F6368] truncate">
                          {suggestion.address.split(",").slice(1).join(",")}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-8 text-center">
                  <p className="text-[15px] text-[#5F6368]">No results found</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Location Status Pill */}
        {!isSearchFocused && (
          <div className="flex items-center gap-2 mt-3 px-1 animate-fadeIn">
            {locationLoading && !manualLocationSet ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm text-[13px] text-[#5F6368]">
                <div className="w-3 h-3 border-2 border-[#DADCE0] border-t-[#1A73E8] rounded-full animate-spin" />
                Getting location...
              </div>
            ) : manualLocationSet ? (
              <button
                onClick={() => {
                  setManualLocationSet(false);
                  refreshLocation();
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#E8F0FE] rounded-full text-[13px] text-[#1A73E8] hover:bg-[#D2E3FC] transition-colors"
              >
                <span>📍</span> Manual location
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : locationError ? (
              <button
                onClick={() => setShowManualLocation(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF7E0] rounded-full text-[13px] text-[#B06000] hover:bg-[#FEEFC3] transition-colors"
              >
                <span>⚠️</span> Set location manually
              </button>
            ) : location ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E6F4EA] rounded-full text-[13px] text-[#137333]">
                <div className="w-2 h-2 bg-[#34A853] rounded-full animate-pulse" />
                Location ready
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Content */}
      {!isSearchFocused && (
        <main className="px-4 pb-8 animate-fadeIn">
          {/* Recent Section */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-2">
            <div className="px-4 py-3 border-b border-[#F1F3F4]">
              <h2 className="text-[13px] font-medium text-[#5F6368] uppercase tracking-wide">
                Recent
              </h2>
            </div>

            {addressesLoading ? (
              <div className="p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="w-10 h-10 rounded-full skeleton" />
                    <div className="flex-1">
                      <div className="h-4 w-3/4 skeleton rounded mb-2" />
                      <div className="h-3 w-1/2 skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : addresses.length > 0 ? (
              <div>
                {addresses.slice(0, 5).map((addr) => (
                  <div key={addr.id} className="relative group">
                    <button
                      onClick={() =>
                        handleSelectDestination(addr.address, addr.lat, addr.lng)
                      }
                      className="g-list-item w-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#F1F3F4] flex items-center justify-center flex-shrink-0 group-hover:bg-[#E8F0FE] transition-colors">
                        <svg className="w-5 h-5 text-[#5F6368] group-hover:text-[#1A73E8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left min-w-0 pr-10">
                        <p className="text-[15px] text-[#202124] truncate">
                          {addr.address.split(",")[0]}
                        </p>
                        <p className="text-[13px] text-[#5F6368] truncate">
                          {addr.address.split(",").slice(1, 3).join(",")}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-[#9AA0A6] group-hover:text-[#5F6368] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    {/* Delete on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(addr.id, {
                          onSuccess: () => showToast("Removed", "success"),
                          onError: () => showToast("Error removing", "error"),
                        });
                      }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-[#FCE8E6] rounded-full transition-all"
                    >
                      <svg className="w-4 h-4 text-[#9AA0A6] hover:text-[#EA4335]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F1F3F4] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#9AA0A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-[15px] text-[#5F6368] mb-1">No recent places</p>
                <p className="text-[13px] text-[#9AA0A6]">
                  Search for a destination to get started
                </p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* Manual Location Modal */}
      {showManualLocation && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fadeIn">
          <div className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl animate-slideUp safe-area-bottom">
            <div className="p-6">
              <h3 className="text-[18px] font-medium text-[#202124] mb-1">
                Enter your location
              </h3>
              <p className="text-[14px] text-[#5F6368] mb-6">
                Enter latitude and longitude coordinates
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#5F6368] mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g., 47.6062"
                    className="g-search shadow-none border border-[#DADCE0] pl-4"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#5F6368] mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g., -122.3321"
                    className="g-search shadow-none border border-[#DADCE0] pl-4"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-[#F1F3F4]">
              <button
                onClick={() => setShowManualLocation(false)}
                className="flex-1 py-3 text-[14px] font-medium text-[#5F6368] hover:bg-[#F1F3F4] rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetManualLocation}
                disabled={!manualLat || !manualLng}
                className="flex-1 py-3 bg-[#1A73E8] hover:bg-[#1557B0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium rounded-full transition-colors"
              >
                Set location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for search */}
      {isSearchFocused && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => {
            setIsSearchFocused(false);
            setSearchQuery("");
          }}
        />
      )}
    </div>
  );
}
