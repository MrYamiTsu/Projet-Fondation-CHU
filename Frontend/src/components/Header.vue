<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
    <div class="h-[2px] w-full bg-teal-700"></div>

    <div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink to="/" class="group flex shrink-0 items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-xs font-bold tracking-wider text-white shadow-sm transition-colors group-hover:bg-slate-800">
          CHU
        </div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-base font-black leading-none tracking-tight text-slate-900 sm:text-lg">
              CHU de Québec
            </span>

            <span
              class="hidden rounded border border-teal-200/80 bg-teal-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-teal-800 md:inline-flex">
              Fondation
            </span>
          </div>

          <span class="mt-1 text-xs font-medium text-slate-500">
            Université Laval
            <span class="hidden sm:inline">
              &bull; Espaces &amp; Commandites
            </span>
          </span>
        </div>
      </RouterLink>

      <nav aria-label="Navigation principale"
        class="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
        <RouterLink to="/" class="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
          Accueil
        </RouterLink>

        <RouterLink to="/#emplacements"
          class="flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900">
          <span class="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true"></span>
          Explorer les emplacements
        </RouterLink>
      </nav>

      <div class="flex flex-wrap items-center gap-3">
        <template v-if="isAuthenticated && currentUser">
          <nav aria-label="Espace utilisateur" class="flex flex-wrap items-center gap-2">
            <RouterLink to="/mes-reservations" class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-teal-700" active-class="bg-slate-100 text-teal-800">
              Mes réservations
            </RouterLink>

            <RouterLink to="/profil" class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-teal-700" active-class="bg-slate-100 text-teal-800">
              Mon profil
            </RouterLink>

            <div v-if="isAdmin" ref="adminMenuRef" class="relative">
              <button type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-100"
                :class="{ 'bg-teal-100 ring-1 ring-teal-300': adminOpen || surPageAdmin }" aria-haspopup="menu"
                :aria-expanded="adminOpen" @click="adminOpen = !adminOpen">
                <i class="fa-solid fa-sliders text-teal-700" aria-hidden="true"></i>
                Administration
                <i class="fa-solid fa-chevron-down text-[10px] text-teal-700 transition-transform"
                  :class="{ 'rotate-180': adminOpen }" aria-hidden="true"></i>
              </button>

              <div v-if="adminOpen" role="menu"
                class="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white pb-1 shadow-lg">
                <p class="px-4 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400" role="presentation">Emplacements</p>
                <RouterLink to="/admin" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-table-columns w-4 text-teal-700" aria-hidden="true"></i>
                  Tableau de bord
                </RouterLink>
                <RouterLink :to="{ name: 'ajouter-emplacement' }" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-plus w-4 text-teal-700" aria-hidden="true"></i>
                  Ajouter un emplacement
                </RouterLink>

                <div class="my-1 border-t border-slate-100" role="separator"></div>

                <p class="px-4 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400" role="presentation">Réservations</p>
                <RouterLink :to="{ name: 'admin-reservations', query: { statut: 'pending' } }" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-clock w-4 text-teal-700" aria-hidden="true"></i>
                  En attente de confirmation
                </RouterLink>
                <RouterLink :to="{ name: 'admin-reservations' }" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-list w-4 text-teal-700" aria-hidden="true"></i>
                  Toutes les réservations
                </RouterLink>
              </div>
            </div>
          </nav>

          <div class="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold text-teal-300"
              aria-hidden="true">
              {{ (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase() }}
            </div>

            <div class="hidden text-left leading-tight sm:block">
              <span class="block max-w-[140px] truncate text-xs font-bold text-slate-900">
                {{ currentUser.name || currentUser.email }}
              </span>
              <span class="mt-0.5 block text-[10px] text-slate-500">
                {{ isAdmin ? 'Administrateur' : 'Utilisateur' }}
              </span>
            </div>

            <button type="button"
              class="cursor-pointer rounded p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Se déconnecter" aria-label="Se déconnecter" @click="deconnecter">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs" aria-hidden="true"></i>
            </button>
          </div>
        </template>

        <div v-else class="relative">
          <button type="button"
            class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-950"
            @click.stop="authStore.openLogin()">
            <i class="fa-solid fa-lock text-[10px] text-teal-400" aria-hidden="true"></i>
            Connexion
          </button>

          <Auth :is-open="isLoginOpen" :users="authStore.users" @close="authStore.closeLogin()" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { routeRequiresAuth } from '../session.js'
import Auth from './Auth.vue'

const authStore = useAuthStore()
const { currentUser, isAuthenticated, isAdmin, isLoginOpen } = storeToRefs(authStore)

const route = useRoute()
const router = useRouter()
const adminOpen = ref(false)
const adminMenuRef = ref(null)
const surPageAdmin = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))

function deconnecter() {
  const pageProtegee = routeRequiresAuth(route)
  authStore.logout()
  if (pageProtegee) router.push('/')
}

function closeOnOutsideClick(event) {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target)) {
    adminOpen.value = false
  }
}

function closeOnEscape(event) {
  if (event.key === 'Escape') adminOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', closeOnOutsideClick)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnOutsideClick)
  document.removeEventListener('keydown', closeOnEscape)
})

watch(() => route.fullPath, () => {
  adminOpen.value = false
})
</script>
