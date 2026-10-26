<template>
  <header class="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/95">
    <!-- Fine ligne de signature institutionnelle en tête (sarcelle officiel du CHU) -->
    <div class="h-[2px] bg-teal-700 w-full"></div>

    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">
      <!-- Identité institutionnelle recherchée -->
      <router-link to="/" class="flex items-center gap-3.5 group shrink-0">
        <!-- Monogramme architectural soigné -->
        <div
          class="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors border border-slate-800"
        >
          CHU
        </div>

        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              CHU de Québec
            </span>
            <span
              class="hidden md:inline-flex items-center text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded tracking-wide"
            >
              Fondation
            </span>
          </div>
          <span class="text-xs text-slate-500 font-medium leading-none mt-1">
            Université Laval &bull; <span class="text-slate-400">Espaces &amp; Commandites</span>
          </span>
        </div>
      </router-link>

      <!-- Navigation contextuelle sobre (dans les tons du site) -->
      <nav class="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
        <router-link
          to="/"
          class="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
        >
          Accueil
        </router-link>
        <router-link
          to="/#emplacements"
          class="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
          <span>Explorer les emplacements</span>
        </router-link>
      </nav>

      <!-- Section Actions / Utilisateur -->
      <div class="flex items-center gap-3 shrink-0">
        <template v-if="currentUser">
          <div class="flex items-center gap-3">
            <!-- Bouton d'accès Administration pour les administrateurs -->
            <router-link
              v-if="currentUser.admin"
              to="/admin"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-bold rounded-lg border border-teal-200 transition-colors shadow-2xs"
            >
              <i class="fa-solid fa-sliders text-teal-700 text-xs"></i>
              <span class="hidden sm:inline">Administration</span>
            </router-link>

            <!-- Profil connecté sobre -->
            <div class="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div
                class="w-8 h-8 rounded-full bg-slate-900 text-teal-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0"
              >
                {{ (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase() }}
              </div>

              <div class="text-left leading-tight hidden sm:block">
                <span class="block text-xs font-bold text-slate-900 max-w-[140px] truncate">
                  {{ currentUser.name || currentUser.email }}
                </span>
                <span class="block text-[10px] text-slate-500 mt-0.5">
                  {{ currentUser.admin ? 'Administrateur' : 'Utilisateur' }}
                </span>
              </div>

              <button
                @click="$emit('logout')"
                class="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                title="Se déconnecter"
                aria-label="Déconnexion"
              >
                <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Bouton Connexion : Ardoise noble, accent sarcelle discret -->
          <button
            @click.stop="$emit('open-auth')"
            class="bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold px-4 py-2 rounded-lg border border-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <i class="fa-solid fa-lock text-[10px] text-teal-400"></i>
            <span>Connexion</span>
          </button>
          <slot name="auth" />
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentUser: { type: Object, default: null },
})

defineEmits(['open-auth', 'logout'])
</script>
