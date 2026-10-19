<template>
  <header class="bg-[#0a1526] text-white shadow-2xl relative z-20 border-b border-slate-800">
    <div class="max-w-[1700px] mx-auto px-4 lg:px-8 py-3.5">
      <div class="flex items-center justify-between gap-6">
        <!-- Logo & Titres CHU -->
        <div class="flex items-center gap-6 shrink-0">
          <router-link class="flex items-center gap-3 group" to="/">
            <div
              class="relative flex items-center justify-center w-12 h-12 text-teal-400 bg-teal-500/10 border border-teal-500/30 rounded-xl group-hover:bg-teal-500/20 transition-all shadow-inner"
            >
              <i class="fa-solid fa-hospital text-xl"></i>
            </div>
            <div class="flex flex-col leading-tight border-l border-slate-700/80 pl-3">
              <span class="font-black text-2xl tracking-tight text-white">CHU</span>
              <span class="text-[12px] font-bold tracking-wide text-white">de Québec</span>
              <span class="text-[9px] text-slate-300 tracking-wider">Université Laval</span>
            </div>
          </router-link>

          <div class="hidden md:block h-12 w-px bg-slate-700/80"></div>

          <div class="hidden sm:flex flex-col justify-center">
            <h1
              class="text-xl lg:text-2xl font-black tracking-tight text-white uppercase leading-none"
            >
              PLAN DE PROJET
            </h1>
            <h2
              class="text-teal-300 text-[11px] lg:text-xs font-bold uppercase tracking-wider mt-1 leading-tight"
            >
              PLATEFORME DE VALORISATION DES ESPACES &bull;
              <span class="text-teal-400">TOPONYMIE & VISIBILITÉ</span>
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5 max-w-md font-light leading-snug hidden lg:block">
              Transformer nos espaces en opportunités durables pour la santé, la recherche et la communauté.
            </p>
          </div>
        </div>

        <!-- Section Droite : Utilisateur / Espace Admin / Connexion -->
        <div class="shrink-0 flex items-center gap-3 relative">
          <template v-if="currentUser">
            <!-- Bouton d'accès Admin pour les administrateurs -->
            <router-link
              v-if="currentUser.admin"
              to="/admin"
              class="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all border border-teal-300/40"
              title="Accéder au panneau d'administration"
            >
              <i class="fa-solid fa-gauge-high"></i>
              <span class="hidden sm:inline">Espace Admin</span>
            </router-link>

            <div
              class="flex flex-col items-end gap-1 bg-slate-900/90 border border-slate-700/80 p-2.5 rounded-xl shadow-inner"
            >
              <div class="flex items-center gap-2">
                <span
                  v-if="currentUser.admin"
                  class="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider"
                >
                  Admin
                </span>
                <span class="block text-xs font-bold text-white leading-none">
                  {{ currentUser.name }}
                </span>
              </div>
              <span class="block text-[10px] text-teal-400 font-mono">
                {{ currentUser.email }}
              </span>
              <button
                @click="$emit('logout')"
                class="text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider mt-0.5 cursor-pointer flex items-center gap-1"
              >
                <i class="fa-solid fa-arrow-right-from-bracket text-[9px]"></i>
                <span>Déconnexion</span>
              </button>
            </div>
          </template>

          <template v-else>
            <button
              @click.stop="$emit('open-auth')"
              class="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 flex items-center gap-2 border border-teal-300/40 cursor-pointer"
            >
              <i class="fa-solid fa-user text-xs"></i>
              <span>Connexion</span>
            </button>
            <slot name="auth" />
          </template>
        </div>
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
