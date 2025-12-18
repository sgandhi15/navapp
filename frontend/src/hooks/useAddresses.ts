import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface Address {
  id: number
  userId: number
  address: string
  lat: number
  lng: number
  createdAt: string
}

export function useAddresses() {
  const queryClient = useQueryClient()

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.getAddresses()
      return response.addresses as Address[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: ({ address, lat, lng }: { address: string; lat: number; lng: number }) =>
      api.saveAddress(address, lat, lng),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })

  return {
    addresses,
    isLoading,
    saveAddress: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteAddress: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}

