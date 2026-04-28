import { createContext } from 'react'

export const AUTH_STORAGE_KEY = 'mind-orbit-demo-session'

export type AuthContextValue = {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
