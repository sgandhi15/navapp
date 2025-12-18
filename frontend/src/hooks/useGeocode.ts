import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface GeocodeResult {
  id: string
  address: string
  lat: number
  lng: number
}

export function useGeocode(query: string) {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: async () => {
      if (!query || query.length < 3) return []
      const response = await api.geocode(query)
      return response.results as GeocodeResult[]
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

