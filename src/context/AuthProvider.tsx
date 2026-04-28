import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AUTH_STORAGE_KEY, AuthContext } from './auth-context'

function readStoredSession(): boolean {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredSession)

  const login = useCallback(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, '1')
    } catch {
      /* ignore quota / private mode */
    }
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
