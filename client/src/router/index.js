import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageDetail from '../views/page_details.vue'
import AdminView from '../views/AdminView.vue'
import { useAuthStore } from '../stores/auth.js'
import pageReservation from '../views/page_reserver.vue'
import pageProfil from '../views/ProfilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

      scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // Si on reste sur la même page (changement de filtres, query, etc.)
    if (to.path === from.path) {
      // Uniquement si le hash a explicitement changé (ex: clic vers une ancre différente)
      if (to.hash && to.hash !== from.hash) {
        return {
          el: to.hash,
          top: 80,
          behavior: 'smooth',
        }
      }
      return false
    }
    // Navigation depuis une autre page avec une ancre
    if (to.hash) {
      return {
        el: to.hash,
        top: 80,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },

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
    {
      path: '/reservation/:id',
      name: 'reservation',
      component: pageReservation,
    },
    {
      path: '/profil',
      name: 'profil',
      component: pageProfil,
      meta: { requiresAuth: true },
    }
  ],
})

// Garde de navigation pour protéger la vue admin (syntaxe moderne Vue Router sans callback next())
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/', query: { authModal: '1', reason: 'login_required' } }
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAuthenticated) {
      return { path: '/', query: { authModal: '1', reason: 'login_required' } }
    }
    if (!authStore.isAdmin) {
      return { path: '/', query: { reason: 'admin_forbidden' } }
    }
  }
})

export default router
