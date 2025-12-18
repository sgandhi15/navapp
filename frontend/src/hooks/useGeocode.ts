import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useDebounce } from "./useDebounce";

interface GeocodeResult {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

export function useGeocode(query: string) {
  // Debounce the search query by 300ms
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["geocode", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) return [];
      const response = await api.geocode(debouncedQuery);
      return response.results as GeocodeResult[];
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

