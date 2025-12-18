import { useState, useEffect, useCallback, useRef } from "react";

interface Location {
  lat: number;
  lng: number;
  accuracy: number;
}

interface UseGeolocationResult {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
  startWatching: () => void;
  stopWatching: () => void;
  refresh: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let message = "Unable to get location";
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = "Location permission denied. Please enable location access.";
        break;
      case err.POSITION_UNAVAILABLE:
        message = "Location unavailable";
        break;
      case err.TIMEOUT:
        message = "Location request timed out. Please try again.";
        break;
    }
    setError(message);
    setIsLoading(false);
  }, []);

  // Get initial location with fallback strategy
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    // First try: Use cached position for quick response
    const quickOptions: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60000, // Accept 1 minute old cached position
    };

    // Second try: High accuracy with longer timeout
    const accurateOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    };

    // Try quick first, then accurate
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      () => {
        // Quick failed, try accurate
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          accurateOptions
        );
      },
      quickOptions
    );
  }, [handleSuccess, handleError]);

  // Start watching location
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const watchOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 5000, // Accept 5 second old position for smoother updates
    };

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      watchOptions
    );
    watchIdRef.current = id;
    setIsWatching(true);
  }, [handleSuccess, handleError]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsWatching(false);
    }
  }, []);

  // Refresh location once
  const refresh = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isLoading,
    isWatching,
    startWatching,
    stopWatching,
    refresh,
  };
}
