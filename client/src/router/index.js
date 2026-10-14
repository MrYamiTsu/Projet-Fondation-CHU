import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PageDetail from '../views/page_details.vue'
import pageReservation from '../views/page_reserver.vue'

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
      path: '/reservation/:id',
      name: 'reservation',
      component: pageReservation,
    }
  ],
})

export default router