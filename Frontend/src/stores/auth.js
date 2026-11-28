import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const rawApi = import.meta.env.VITE_API_URL ?? import.meta.env.API_BASE
const isDev = Boolean(import.meta.env.DEV)
const API_BASE = (rawApi && (!String(rawApi).includes('localhost') || isDev))
  ? String(rawApi).replace(/\/+$/, '')
  : (isDev ? 'http://localhost:3000' : '')
const API_URL = `${API_BASE}/api/auth`

export function getTokenExpiry(jwt) {
  if (typeof jwt !== 'string') return null
  const payload = jwt.split('.')[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')))
    return Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

export function isTokenExpired(jwt, now = Date.now()) {
  const expiry = getTokenExpiry(jwt)
  return expiry !== null && expiry <= now
}

export const useAuthStore = defineStore('auth', () => {
  const savedUser = localStorage.getItem('chu_current_user')
  const currentUser = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const isLoginOpen = ref(false)

  const users = ref(JSON.parse(localStorage.getItem('chu_users') || '[]'))

  const isAuthenticated = computed(() => !!currentUser.value)
  const tokenExpiry = computed(() => getTokenExpiry(token.value))
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.admin === true)

  function setSession(user, authToken) {
    currentUser.value = {
      id: user.id,
      name: user.name || `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      role: user.role || 'user',
      admin: user.role === 'admin' || Boolean(user.admin),
    }
    localStorage.setItem('chu_current_user', JSON.stringify(currentUser.value))

    if (authToken) {
      token.value = authToken
      localStorage.setItem('token', authToken)
    }
  }

  async function login(email, password) {
    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.erreur || data.message || 'Identifiants invalides' }
      }

      setSession(data.data.utilisateur, data.data.token)
      return { success: true, user: currentUser.value }
    } catch (error) {
      return { success: false, message: 'Impossible de contacter le serveur backend.' }
    } finally {
      isLoading.value = false
    }
  }

  async function signup({ prenom, nom, email, password, confirmPassword }) {
    if (password !== confirmPassword) {
      return { success: false, message: 'Les mots de passe doivent correspondre.' }
    }

    isLoading.value = true
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: prenom?.trim(),
          nom: nom?.trim(),
          email: email?.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, message: data.erreur || data.message || "Erreur lors de l'inscription" }
      }

      return await login(email, password)
    } catch (error) {
      return { success: false, message: 'Impossible de contacter le serveur backend.' }
    } finally {
      isLoading.value = false
    }
  }

  function openLogin() {
    isLoginOpen.value = true
  }

  function closeLogin() {
    isLoginOpen.value = false
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('chu_current_user')
  }

  function hasExpiredSession(now = Date.now()) {
    if (!currentUser.value) return false
    return !token.value || isTokenExpired(token.value, now)
  }

  function toggleUserAdmin(email) {
    const user = users.value.find((u) => u.email === email)
    if (user) {
      user.admin = !user.admin
      user.role = user.admin ? 'admin' : 'user'
      localStorage.setItem('chu_users', JSON.stringify(users.value))
    }
    return { success: true }
  }

  function deleteUser(email) {
    users.value = users.value.filter((u) => u.email !== email)
    localStorage.setItem('chu_users', JSON.stringify(users.value))
    return { success: true }
  }

  function addUser({ name, email, password, admin = false }) {
    const newUser = { name, email, password, admin, role: admin ? 'admin' : 'user' }
    users.value.push(newUser)
    localStorage.setItem('chu_users', JSON.stringify(users.value))
    return { success: true, user: newUser }
  }

  return {
    currentUser,
    token,
    tokenExpiry,
    users,
    isLoading,
    isLoginOpen,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    openLogin,
    closeLogin,
    hasExpiredSession,
    toggleUserAdmin,
    deleteUser,
    addUser,
  }
})
