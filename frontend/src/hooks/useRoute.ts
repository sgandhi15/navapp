import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface RouteData {
  distance: number // meters
  duration: number // seconds
  geometry: {
    type: 'LineString'
    coordinates: [number, number][]
  }
}

export function useRoute(
  startLat: number | null,
  startLng: number | null,
  endLat: number,
  endLng: number
) {
  return useQuery({
    queryKey: ['route', startLat, startLng, endLat, endLng],
    queryFn: async () => {
      if (startLat === null || startLng === null) return null
      const response = await api.getRoute(startLat, startLng, endLat, endLng)
      return response as RouteData
    },
    enabled: startLat !== null && startLng !== null,
    staleTime: 1000 * 30, // Cache for 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  })
}

// Helper functions
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} min`
}

export function formatETA(seconds: number): string {
  const now = new Date()
  const eta = new Date(now.getTime() + seconds * 1000)
  return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

