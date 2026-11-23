<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md">
    <div class="h-[2px] w-full bg-teal-700"></div>

    <div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <!-- Identité -->
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

      <!-- Navigation publique -->
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

      <!-- Espace utilisateur -->
      <div class="flex flex-wrap items-center gap-3">
        <template v-if="isAuthenticated && currentUser">
          <nav aria-label="Espace utilisateur" class="flex flex-wrap items-center gap-2">
            <!-- Administration -->
            <!-- Administration (menu déroulant) -->
            <div v-if="isAdmin" ref="adminMenuRef" class="relative">
              <button type="button"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900 transition-colors hover:bg-teal-100"
                :class="{ 'bg-teal-100': adminOpen }" aria-haspopup="menu" :aria-expanded="adminOpen"
                @click="adminOpen = !adminOpen">
                <i class="fa-solid fa-sliders text-teal-700" aria-hidden="true"></i>
                Administration
                <i class="fa-solid fa-chevron-down text-[10px] text-teal-700 transition-transform"
                  :class="{ 'rotate-180': adminOpen }" aria-hidden="true"></i>
              </button>

              <div v-if="adminOpen" role="menu"
                class="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <RouterLink to="/admin" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-sliders w-4 text-teal-700" aria-hidden="true"></i>
                  Tableau de bord
                </RouterLink>

                <RouterLink :to="{ name: 'admin-reservations', query: { statut: 'pending' } }" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-clock w-4 text-teal-700" aria-hidden="true"></i>
                  Réservations en attente
                </RouterLink>

                <RouterLink :to="{ name: 'admin-reservations' }" role="menuitem"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900">
                  <i class="fa-solid fa-list w-4 text-teal-700" aria-hidden="true"></i>
                  Toutes les réservations
                </RouterLink>
              </div>
            </div>

            <!-- Utilisateurs connectés -->
            <RouterLink to="/mes-reservations"
              class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-teal-700">
              Mes réservations
            </RouterLink>

            <RouterLink to="/profil"
              class="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-teal-700">
              Mon profil
            </RouterLink>
          </nav>

          <!-- Identité et déconnexion -->
          <div class="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold text-teal-300"
              aria-hidden="true">
              {{
                (currentUser.name || currentUser.email || 'U')
                  .charAt(0)
                  .toUpperCase()
              }}
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
              title="Se déconnecter" aria-label="Se déconnecter" @click="$emit('logout')">
              <i class="fa-solid fa-arrow-right-from-bracket text-xs" aria-hidden="true"></i>
            </button>
          </div>
        </template>

        <!-- Visiteur -->
        <template v-else>
          <button type="button"
            class="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-slate-800 active:bg-slate-950"
            @click.stop="$emit('open-auth')">
            <i class="fa-solid fa-lock text-[10px] text-teal-400" aria-hidden="true"></i>
            Connexion
          </button>

          <slot name="auth" />
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
})

defineEmits(['open-auth', 'logout'])

const authStore = useAuthStore()
const { isAuthenticated, isAdmin } = storeToRefs(authStore)

// Menu admin
const route = useRoute()
const adminOpen = ref(false)
const adminMenuRef = ref(null)

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

// Ferme le menu après chaque navigation
watch(() => route.fullPath, () => {
  adminOpen.value = false
})
</script>