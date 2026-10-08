import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageDetail from '../views/page_details.vue'
import AdminView from '../views/AdminView.vue'
import { useAuthStore } from '../stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/emplacement/:id',
      name: 'emplacement-detail',
      component: PageDetail,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAdmin: true },
    },
  ],
})

// Garde de navigation pour protéger la vue admin
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      // Non connecté : redirection vers l'accueil avec ouverture de la modale de connexion
      return next({ path: '/', query: { authModal: '1', reason: 'login_required' } })
    }
    if (!authStore.isAdmin) {
      // Connecté mais non-admin : redirection vers l'accueil avec refus d'accès
      return next({ path: '/', query: { reason: 'admin_forbidden' } })
    }
  }
  next()
})

export default router