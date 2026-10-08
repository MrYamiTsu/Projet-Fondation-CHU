import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DEFAULT_USERS = [
  { name: 'Administrateur CHU', email: 'admin@admin.ca', password: '123', admin: true },
  { name: 'Utilisateur Standard', email: 'user@user.ca', password: '123', admin: false },
]

export const useAuthStore = defineStore('auth', () => {
  // Initialisation des utilisateurs depuis le localStorage
  const loadUsers = () => {
    try {
      const saved = localStorage.getItem('chu_users')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement des utilisateurs:', e)
    }
    return DEFAULT_USERS
  }

  // Initialisation de la session actuelle
  const loadCurrentUser = () => {
    try {
      const saved = localStorage.getItem('chu_current_user')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Erreur lors du chargement de la session:', e)
    }
    return null
  }

  const users = ref(loadUsers())
  const currentUser = ref(loadCurrentUser())

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => Boolean(currentUser.value?.admin))

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

  function login(email, password) {
    const found = users.value.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    )
    if (!found) {
      return { success: false, message: 'Email ou mot de passe incorrect.' }
    }

    currentUser.value = {
      name: found.name,
      email: found.email,
      admin: Boolean(found.admin),
    }
    persistCurrentUser()
    return { success: true, user: currentUser.value }
  }

  function signup({ name, email, password }) {
    const cleanEmail = email.trim().toLowerCase()
    const exists = users.value.some((u) => u.email.toLowerCase() === cleanEmail)
    if (exists) {
      return { success: false, message: 'Un compte existe déjà avec cet email.' }
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password,
      admin: false,
    }
    users.value.push(newUser)
    persistUsers()

    currentUser.value = {
      name: newUser.name,
      email: newUser.email,
      admin: false,
    }
    persistCurrentUser()
    return { success: true, user: currentUser.value }
  }

  function logout() {
    currentUser.value = null
    persistCurrentUser()
  }

  function toggleUserAdmin(email) {
    const user = users.value.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return false

    // Empêcher de rétrograder le dernier admin ou son propre compte si admin unique
    const adminCount = users.value.filter((u) => u.admin).length
    if (user.admin && adminCount <= 1) {
      return { success: false, message: 'Impossible de retirer le rôle du dernier administrateur.' }
    }

    user.admin = !user.admin
    persistUsers()

    // Si on a modifié l'utilisateur actuellement connecté
    if (currentUser.value && currentUser.value.email.toLowerCase() === email.toLowerCase()) {
      currentUser.value.admin = user.admin
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
    }
    users.value.push(newUser)
    persistUsers()
    return { success: true, user: newUser }
  }

  return {
    users,
    currentUser,
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

