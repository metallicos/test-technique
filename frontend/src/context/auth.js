"use client"
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import Cookies from 'js-cookie'

const AuthContext = createContext()

// Helper to decode JWT without verification
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch (e) {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const verifyToken = useCallback(async (token) => {
    const decoded = decodeJWT(token)
    // Client-side expiration check first
    if (!decoded || decoded.exp * 1000 <= Date.now()) return false

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setUser(res.data)
      setToken(token)
      return true
    } catch (error) {
      return false
    }
  }, [])

  // Auto-logout functionality
  const startLogoutTimer = useCallback((token) => {
    const decoded = decodeJWT(token)
    if (!decoded?.exp) return

    const expiresIn = decoded.exp * 1000 - Date.now()
    if (expiresIn <= 0) {
      logout()
      return
    }

    const timer = setTimeout(logout, expiresIn)
    return () => clearTimeout(timer)
  }, [])

  const logout = useCallback(() => {
    Cookies.remove('jwt')
    setUser(null)
    setToken(null)
    toast.success('Logged out successfully')
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = Cookies.get('jwt')
      if (storedToken) {
        const valid = await verifyToken(storedToken)
        if (!valid) Cookies.remove('jwt')
      }
      setLoading(false)
    }
    initAuth()
  }, [verifyToken])

  // Set up axios response interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          const storedToken = Cookies.get('jwt')
          if (storedToken) {
            const decoded = decodeJWT(storedToken)
            if (!decoded || decoded.exp * 1000 <= Date.now()) {
              logout()
              toast.error('Session expired. Please login again.')
            }
          }
        }
        return Promise.reject(error)
      }
    )

    return () => axios.interceptors.response.eject(interceptor)
  }, [logout])

  // Start logout timer when token changes
  useEffect(() => {
    if (!token) return
    const cleanup = startLogoutTimer(token)
    return cleanup
  }, [token, startLogoutTimer])

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, { email, password })
      Cookies.set('jwt', res.data.token, { expires: 7, secure: true, sameSite: 'strict' })
      const valid = await verifyToken(res.data.token)
      if (valid) {
        toast.success('Login successful!')
        return true
      }
      return false
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const register = async (name, email, password) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, { name, email, password })
      const loginRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, { email, password })
      Cookies.set('jwt', loginRes.data.token, { expires: 7, secure: true, sameSite: 'strict' })
      const valid = await verifyToken(loginRes.data.token)
      if (valid) {
        toast.success('Registration & Login successful!')
        return true
      }
      return false
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}