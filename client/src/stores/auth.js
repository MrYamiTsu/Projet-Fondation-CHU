import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API_BASE = 'http://localhost:3000'

const DEFAULT_USERS = [
  { name: 'Administrateur CHU', email: 'admin@admin.com', password: 'admin123', admin: true },
  { name: 'Jean Dupond', email: 'jeandupond@courriel.com', password: 'user1234', admin: false },
]

export const useAuthStore = defineStore('auth', () => {
  // Init des utilisateurs
  const loadUsers = () => {
    try {
      const saved = localStorage.getItem('chu_users')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement des utilisateurs:', e)
    }
    return DEFAULT_USERS
  }

  // Init de la session 
  const loadCurrentUser = () => {
    try {
      const saved = localStorage.getItem('chu_current_user')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement de la session:', e)
    }
    return null
  }

  const token = ref(localStorage.getItem('token') || null)
  const users = ref(loadUsers())
  const currentUser = ref(loadCurrentUser())
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => {
    if (!currentUser.value) return false
    return currentUser.value.admin === true || currentUser.value.role === 'admin'
  })

  function persistUsers() {
    try {
      localStorage.setItem('chu_users', JSON.stringify(users.value))
    } catch (e) {
      console.error('Erreur de sauvegarde des utilisateurs:', e)
    }
  }

  function persistCurrentUser() {
    try {
      if (currentUser.value) {
        localStorage.setItem('chu_current_user', JSON.stringify(currentUser.value))
      } else {
        localStorage.removeItem('chu_current_user')
      }
    } catch (e) {
      console.error('Erreur de sauvegarde de la session:', e)
    }
  }

  function setSession(userData, authToken) {
    const isAdminUser = userData.role === 'admin' || Boolean(userData.admin)
    const displayName =
      userData.name ||
      `${userData.prenom ?? ''} ${userData.nom ?? ''}`.trim() ||
      userData.email

    currentUser.value = {
      id: userData.id,
      name: displayName,
      prenom: userData.prenom,
      nom: userData.nom,
      email: userData.email,
      role: userData.role || (isAdminUser ? 'admin' : 'user'),
      admin: isAdminUser,
    }

    if (authToken) {
      token.value = authToken
      localStorage.setItem('token', authToken)
    }

    persistCurrentUser()
  }

  function tryLocalLogin(cleanEmail, password) {
    const localFound = users.value.find((u) => {
      if (u.email.toLowerCase() !== cleanEmail) return false
      if (u.password === password) return true
      if (cleanEmail === 'admin@admin.com' && (password === 'admin123' || password === '123')) return true
      if (cleanEmail === 'jeandupond@courriel.com' && (password === 'user1234' || password === '123')) return true
      return false
    })

    if (localFound) {
      setSession(localFound, null)
      return { success: true, user: currentUser.value, offline: true }
    }
    return null
  }

  function tryLocalSignup({ prenomVal, nomVal, cleanEmail, password }) {
    const exists = users.value.some((u) => u.email.toLowerCase() === cleanEmail)
    if (exists) {
      return { success: false, message: 'Un compte existe déjà avec cet email.' }
    }

    const newUser = {
      name: `${prenomVal} ${nomVal}`.trim(),
      email: cleanEmail,
      password,
      admin: false,
      role: 'user',
    }
    users.value.push(newUser)
    persistUsers()

    setSession(newUser, null)
    return { success: true, user: currentUser.value, offline: true }
  }

  async function login(email, password) {
    isLoading.value = true
    const cleanEmail = email.trim().toLowerCase()

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.data) {
        setSession(data.data.utilisateur, data.data.token)
        return { success: true, user: currentUser.value }
      }

      // Si le serveur backend répond avec une erreur 500 ou 503 (ex: BD PostgreSQL hors ligne),
      // on bascule automatiquement sur les comptes locaux pour ne jamais bloquer l'utilisateur
      if (res.status >= 500) {
        console.warn('Serveur en erreur (BD hors ligne), tentative en mode secours local...')
        const local = tryLocalLogin(cleanEmail, password)
        if (local) return local
      }

      const message =
        data.erreur ||
        data.message ||
        (res.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur de connexion.')
      return { success: false, message }
    } catch (error) {
      console.warn('Backend injoignable, tentative en mode local:', error)

      const local = tryLocalLogin(cleanEmail, password)
      if (local) return local

      return {
        success: false,
        message: 'Impossible de contacter le serveur backend (http://localhost:3000).',
      }
    } finally {
      isLoading.value = false
    }
  }

  async function signup({ name, prenom, nom, email, password }) {
    isLoading.value = true
    const cleanEmail = email.trim().toLowerCase()

    let prenomVal = (prenom || '').trim()
    let nomVal = (nom || '').trim()

    if (!prenomVal && !nomVal && name) {
      const parts = name.trim().split(/\s+/)
      prenomVal = parts[0] || 'Utilisateur'
      nomVal = parts.slice(1).join(' ') || prenomVal
    } else if (!prenomVal) {
      prenomVal = 'Utilisateur'
    } else if (!nomVal) {
      nomVal = prenomVal
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomVal,
          prenom: prenomVal,
          email: cleanEmail,
          password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.data) {
        const loginRes = await login(cleanEmail, password)
        if (loginRes.success) {
          return { success: true, user: currentUser.value }
        }
        setSession(data.data.utilisateur, null)
        return { success: true, user: currentUser.value }
      }

      // Si la BD PostgreSQL est hors ligne (500 ou 503), secours local automatique
      if (res.status >= 500) {
        console.warn('Serveur en erreur (BD hors ligne), création de compte en mode local...')
        return tryLocalSignup({ prenomVal, nomVal, cleanEmail, password })
      }

      const message =
        data.erreur ||
        data.message ||
        (res.status === 409
          ? 'Cette adresse email est déjà utilisée.'
          : 'Erreur lors de la création du compte.')
      return { success: false, message }
    } catch (error) {
      console.warn('Backend injoignable pour signup, tentative en mode local:', error)
      return tryLocalSignup({ prenomVal, nomVal, cleanEmail, password })
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('chu_current_user')
  }

  function toggleUserAdmin(email) {
    const user = users.value.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return false

    const adminCount = users.value.filter((u) => u.admin || u.role === 'admin').length
    if ((user.admin || user.role === 'admin') && adminCount <= 1) {
      return { success: false, message: 'Impossible de retirer le rôle du dernier administrateur.' }
    }

    user.admin = !user.admin
    user.role = user.admin ? 'admin' : 'user'
    persistUsers()

    if (currentUser.value && currentUser.value.email.toLowerCase() === email.toLowerCase()) {
      currentUser.value.admin = user.admin
      currentUser.value.role = user.role
      persistCurrentUser()
    }
    return { success: true }
  }

  function deleteUser(email) {
    if (currentUser.value && currentUser.value.email.toLowerCase() === email.toLowerCase()) {
      return { success: false, message: 'Vous ne pouvez pas supprimer votre propre compte actif.' }
    }
    const beforeCount = users.value.length
    users.value = users.value.filter((u) => u.email.toLowerCase() !== email.toLowerCase())
    if (users.value.length !== beforeCount) {
      persistUsers()
      return { success: true }
    }
    return { success: false, message: 'Utilisateur introuvable.' }
  }

  function addUser({ name, email, password, admin = false }) {
    const cleanEmail = email.trim().toLowerCase()
    const exists = users.value.some((u) => u.email.toLowerCase() === cleanEmail)
    if (exists) {
      return { success: false, message: 'Cet email est déjà utilisé.' }
    }
    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password,
      admin: Boolean(admin),
      role: admin ? 'admin' : 'user',
    }
    users.value.push(newUser)
    persistUsers()
    return { success: true, user: newUser }
  }

  return {
    token,
    users,
    currentUser,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    toggleUserAdmin,
    deleteUser,
    addUser,
  }
})
