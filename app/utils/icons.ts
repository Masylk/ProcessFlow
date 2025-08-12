import { cache } from 'react'

export const getIcons = cache(async () => {
  const response = await fetch('/api/step-icons')
  if (!response.ok) throw new Error('Failed to fetch icons')
  return response.json()
}) 