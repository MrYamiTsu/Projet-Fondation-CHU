import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlotDetailView from '../views/PlotDetailView.vue'
import AdminView from '../views/AdminView.vue'
import ReservationView from '../views/ReservationView.vue'
import ProfilView from '../views/ProfilView.vue'
import { useAuthStore } from '../stores/auth.js'
import MyReservationsView from '../views/MyReservationsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),

    scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.path === from.path) {
      if (to.hash && to.hash !== from.hash) {
        return {
          el: to.hash,
          top: 80,
          behavior: 'smooth',
        }
      }
      return false
    }
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
     path: '/mes-reservations',
     name: 'my-reservations',
     component: MyReservationsView,
     meta: { requiresAuth: true },
    },
    {
      path: '/emplacement/:id',
      name: 'emplacement-detail',
      component: PlotDetailView,
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
      component: ReservationView,
    },
    {
      path: '/profil',
      name: 'profil',
      component: ProfilView,
      meta: { requiresAuth: true },
    }
  ],
})


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
