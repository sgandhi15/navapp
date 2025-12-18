import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useNavigate } from '@tanstack/react-router'

interface User {
  id: number
  email: string
}

interface AuthResponse {
  user: User
  token: string
  message: string
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Check if user is logged in
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return null
      
      try {
        const response = await api.getMe()
        return response.user as User
      } catch {
        localStorage.removeItem('access_token')
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password) as Promise<AuthResponse>,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate({ to: '/home' })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.register(email, password) as Promise<AuthResponse>,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.user)
      navigate({ to: '/home' })
    },
  })

  // Logout
  const logout = () => {
    localStorage.removeItem('access_token')
    queryClient.setQueryData(['auth', 'me'], null)
    queryClient.clear()
    navigate({ to: '/login' })
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error?.message,
    isRegistering: registerMutation.isPending,
    logout,
  }
}

