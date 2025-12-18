import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if user has token, redirect accordingly
    const token = localStorage.getItem('access_token')
    if (token) {
      throw redirect({ to: '/home' })
    }
    throw redirect({ to: '/login' })
  },
  component: () => null,
})
