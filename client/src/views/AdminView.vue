<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
    <!-- Barre de navigation Admin -->
    <header class="bg-[#070f1e] border-b border-slate-800 sticky top-0 z-30 shadow-xl">
      <div class="max-w-[1700px] mx-auto px-4 lg:px-8 py-3.5">
        <div class="flex items-center justify-between gap-4">
          <!-- Logo & Titre Admin -->
          <div class="flex items-center gap-4">
            <router-link to="/" class="flex items-center gap-3 group">
              <div
                class="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/25 transition-all"
              >
                <i class="fa-solid fa-hospital text-lg"></i>
              </div>
              <div class="leading-tight">
                <span class="font-black text-xl text-white tracking-tight">CHU</span>
                <span class="text-xs text-teal-300 ml-1 font-bold">de Québec</span>
              </div>
            </router-link>

            <span class="h-6 w-px bg-slate-800"></span>

            <div class="flex items-center gap-2">
              <span
                class="bg-amber-400/15 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-solid fa-shield-halved text-[10px]"></i>
                Console Admin
              </span>
              <span class="hidden md:inline text-xs text-slate-400 font-medium">
                Plateforme de Valorisation des Espaces
              </span>
            </div>
          </div>

          <!-- Actions de navigation & Utilisateur connecté -->
          <div class="flex items-center gap-3">
            <router-link
              to="/"
              class="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all hover:text-white"
            >
              <i class="fa-solid fa-arrow-left text-xs text-teal-400"></i>
              <span class="hidden sm:inline">Portail public</span>
            </router-link>

            <div
              v-if="authStore.currentUser"
              class="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl"
            >
              <div class="text-right">
                <span class="block text-xs font-bold text-white leading-none">
                  {{ authStore.currentUser.name }}
                </span>
                <span class="block text-[10px] text-teal-400 font-mono">
                  {{ authStore.currentUser.email }}
                </span>
              </div>
              <button
                @click="handleLogout"
                class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                title="Déconnexion"
              >
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Notification Toast -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toastMessage"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold"
        :class="
          toastType === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/90 border-red-500/40 text-red-200'
        "
      >
        <i
          :class="
            toastType === 'success'
              ? 'fa-solid fa-circle-check text-emerald-400'
              : 'fa-solid fa-circle-exclamation text-red-400'
          "
        ></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Contenu Principal -->
    <main class="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
      <!-- En-tête d'accueil -->
      <div
        class="bg-gradient-to-r from-[#0a1526] via-slate-800/80 to-[#0a1526] border border-slate-800 rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl"
      >
        <div>
          <div class="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <i class="fa-solid fa-user-shield"></i>
            <span>Session Administrateur active</span>
          </div>
          <h1 class="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Tableau de bord de gestion des espaces
          </h1>
          <p class="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Supervisez les emplacements de toponymie et de visibilité de l'ensemble des 5 hôpitaux du CHU de Québec, mettez à jour leur disponibilité en temps réel et gérez les accès.
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="openAddModal"
            class="px-4 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 flex items-center gap-2 cursor-pointer border border-teal-300/40"
          >
            <i class="fa-solid fa-plus text-xs"></i>
            <span>Nouvel emplacement</span>
          </button>
        </div>
      </div>

      <!-- KPI Cards (Indicateurs clés) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total des espaces</span>
            <div class="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <i class="fa-solid fa-layer-group text-sm"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-white">{{ plotsStore.totalPlots }}</span>
            <span class="text-xs text-slate-400">référencés</span>
          </div>
        </div>

        <!-- Disponibles -->
        <div class="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibles</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <i class="fa-solid fa-check-circle text-sm"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-emerald-400">{{ plotsStore.availablePlots }}</span>
            <span class="text-xs text-slate-400">
              ({{ plotsStore.totalPlots ? Math.round((plotsStore.availablePlots / plotsStore.totalPlots) * 100) : 0 }}%)
            </span>
          </div>
        </div>

        <!-- Réservés -->
        <div class="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Réservés / Valorises</span>
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i class="fa-solid fa-lock text-sm"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-black text-amber-400">{{ plotsStore.reservedPlots }}</span>
            <span class="text-xs text-slate-400">attribués</span>
          </div>
        </div>

        <!-- Valeur totale -->
        <div class="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Valeur du parc</span>
            <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <i class="fa-solid fa-coins text-sm"></i>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl font-black text-white">
              {{ formatShortPrice(plotsStore.totalValuation) }}
            </span>
            <span class="text-xs text-slate-400">CAD</span>
          </div>
        </div>
      </div>

      <!-- Onglets de la vue admin -->
      <div class="flex border-b border-slate-800 gap-6">
        <button
          @click="activeTab = 'plots'"
          :class="[
            'pb-3 text-xs font-black uppercase tracking-wider border-b-2 -mb-px transition-colors flex items-center gap-2 cursor-pointer',
            activeTab === 'plots'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          <i class="fa-solid fa-map-location-dot"></i>
          <span>Emplacements ({{ plotsStore.totalPlots }})</span>
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'pb-3 text-xs font-black uppercase tracking-wider border-b-2 -mb-px transition-colors flex items-center gap-2 cursor-pointer',
            activeTab === 'users'
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          <i class="fa-solid fa-users"></i>
          <span>Comptes utilisateurs ({{ authStore.users.length }})</span>
        </button>
      </div>

      <!-- ONGLET 1: GESTION DES EMPLACEMENTS -->
      <div v-if="activeTab === 'plots'" class="space-y-4">
        <!-- Filtres & Recherche -->
        <div class="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Recherche texte -->
          <div class="relative w-full md:w-80">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher un espace, secteur..."
              class="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          <!-- Filtres boutons -->
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <!-- Filtre Hôpital -->
            <select
              v-model="filterHospital"
              class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="">Tous les hôpitaux</option>
              <option value="CHUL">CHUL</option>
              <option value="HEJ">Hôpital de l'Enfant-Jésus (HEJ)</option>
              <option value="HDQ">L'Hôtel-Dieu de Québec (HDQ)</option>
              <option value="HSFA">Saint-François d'Assise (HSFA)</option>
              <option value="HSS">Sacré-Cœur (HSS)</option>
              <option value="CRCE">Recherche (CRCE)</option>
            </select>

            <!-- Filtre Statut -->
            <select
              v-model="filterStatus"
              class="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="available">Disponibles uniquement</option>
              <option value="reserved">Réservés uniquement</option>
            </select>

            <button
              @click="resetPlotsData"
              class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer"
              title="Réinitialiser les données d'origine"
            >
              <i class="fa-solid fa-rotate-right mr-1"></i>
              Reset démo
            </button>
          </div>
        </div>

        <!-- Tableau des emplacements -->
        <div class="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th class="py-3.5 px-4">Emplacement</th>
                  <th class="py-3.5 px-4">Hôpital</th>
                  <th class="py-3.5 px-4">Secteur</th>
                  <th class="py-3.5 px-4">Valeur</th>
                  <th class="py-3.5 px-4 text-center">Disponibilité</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr
                  v-for="plot in filteredPlots"
                  :key="plot.id"
                  class="hover:bg-slate-800/60 transition-colors"
                >
                  <!-- Nom et visuel -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="plot.image"
                        :alt="plot.name"
                        class="w-12 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <span class="font-bold text-white block text-sm">{{ plot.name }}</span>
                        <span class="text-[11px] text-slate-400 font-mono">ID: #{{ plot.id }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Hôpital -->
                  <td class="py-3 px-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 border border-teal-500/30 text-teal-300"
                    >
                      {{ plot.hospital }}
                    </span>
                  </td>

                  <!-- Secteur -->
                  <td class="py-3 px-4 text-slate-300 font-medium">
                    {{ plot.sector }}
                  </td>

                  <!-- Prix -->
                  <td class="py-3 px-4 font-bold text-white">
                    {{ plot.formattedPrice }}
                  </td>

                  <!-- Toggle Disponibilité -->
                  <td class="py-3 px-4 text-center">
                    <button
                      @click="toggleAvailability(plot)"
                      :class="[
                        'px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer border',
                        plot.available
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
                      ]"
                    >
                      <i :class="plot.available ? 'fa-solid fa-circle-check' : 'fa-solid fa-lock'"></i>
                      <span>{{ plot.available ? 'Disponible' : 'Réservé' }}</span>
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <router-link
                        :to="`/emplacement/${plot.id}`"
                        class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
                        title="Voir la page publique"
                      >
                        <i class="fa-solid fa-eye text-xs"></i>
                      </router-link>
                      <button
                        @click="openEditModal(plot)"
                        class="w-8 h-8 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 border border-teal-500/30 flex items-center justify-center transition-colors cursor-pointer"
                        title="Modifier cet emplacement"
                      >
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                      <button
                        @click="confirmDeletePlot(plot)"
                        class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 flex items-center justify-center transition-colors cursor-pointer"
                        title="Supprimer cet emplacement"
                      >
                        <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredPlots.length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <i class="fa-solid fa-folder-open text-2xl mb-2 text-slate-600 block"></i>
                    Aucun emplacement ne correspond aux filtres appliqués.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ONGLET 2: GESTION DES UTILISATEURS -->
      <div v-if="activeTab === 'users'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-white">Utilisateurs enregistrés</h2>
            <p class="text-xs text-slate-400">Gérez les comptes autorisés et attribuez les droits administrateur.</p>
          </div>
          <button
            @click="isNewUserModalOpen = true"
            class="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-teal-300/40 flex items-center gap-1.5 cursor-pointer"
          >
            <i class="fa-solid fa-user-plus text-xs"></i>
            <span>Ajouter un utilisateur</span>
          </button>
        </div>

        <div class="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/60 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <tr>
                <th class="py-3.5 px-4">Utilisateur</th>
                <th class="py-3.5 px-4">Email</th>
                <th class="py-3.5 px-4">Rôle</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="user in authStore.users"
                :key="user.email"
                class="hover:bg-slate-800/60 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs border border-slate-600">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="font-bold text-white">{{ user.name }}</span>
                      <span
                        v-if="authStore.currentUser?.email === user.email"
                        class="ml-2 text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-semibold"
                      >
                        Vous
                      </span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-slate-300">{{ user.email }}</td>
                <td class="py-3 px-4">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1',
                      user.admin
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-slate-700/80 text-slate-300 border border-slate-600',
                    ]"
                  >
                    <i :class="user.admin ? 'fa-solid fa-shield-halved text-[9px]' : 'fa-solid fa-user text-[9px]'"></i>
                    <span>{{ user.admin ? 'Administrateur' : 'Utilisateur' }}</span>
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="toggleAdminRole(user)"
                      class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {{ user.admin ? 'Rétrograder en utilisateur' : 'Promouvoir Admin' }}
                    </button>
                    <button
                      @click="deleteUserAccount(user)"
                      :disabled="authStore.currentUser?.email === user.email"
                      :class="[
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors',
                        authStore.currentUser?.email === user.email
                          ? 'opacity-30 cursor-not-allowed text-slate-600'
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer',
                      ]"
                      title="Supprimer ce compte"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL AJOUT / MODIFICATION D'EMPLACEMENT -->
    <div
      v-if="isPlotModalOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-[#0b1629] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm">
              <i :class="editingPlotId ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus'"></i>
            </div>
            <h3 class="text-lg font-black text-white">
              {{ editingPlotId ? 'Modifier l\'emplacement' : 'Ajouter un nouvel emplacement' }}
            </h3>
          </div>
          <button
            @click="isPlotModalOpen = false"
            class="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="savePlot" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Nom -->
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nom de l'espace *
              </label>
              <input
                v-model="plotForm.name"
                type="text"
                required
                placeholder="Ex: Hall Principal & Atrium"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <!-- Hôpital -->
            <div>
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hôpital *
              </label>
              <select
                v-model="plotForm.hospital"
                required
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option value="CHUL">CHUL (Univ. Laval)</option>
                <option value="HEJ">HEJ (Enfant-Jésus)</option>
                <option value="HDQ">HDQ (Hôtel-Dieu)</option>
                <option value="HSFA">HSFA (St-François)</option>
                <option value="HSS">HSS (Sacré-Cœur)</option>
                <option value="CRCE">CRCE (Recherche)</option>
              </select>
            </div>

            <!-- Secteur de soins -->
            <div>
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Secteur de soins *
              </label>
              <input
                v-model="plotForm.sector"
                type="text"
                required
                placeholder="Ex: Pédiatrie, Oncologie, Urgence"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <!-- Prix / Valeur -->
            <div>
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Valeur / Prix ($ CAD) *
              </label>
              <input
                v-model.number="plotForm.price"
                type="number"
                min="0"
                step="5000"
                required
                placeholder="Ex: 250000"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <!-- Statut Disponibilité -->
            <div>
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Statut
              </label>
              <select
                v-model="plotForm.available"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              >
                <option :value="true">Disponible à la valorisation</option>
                <option :value="false">Réservé / Occupé</option>
              </select>
            </div>

            <!-- Image URL -->
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                URL de l'image
              </label>
              <input
                v-model="plotForm.image"
                type="url"
                placeholder="https://images.unsplash.com/..."
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <!-- Description -->
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                v-model="plotForm.description"
                rows="3"
                placeholder="Description du lieu, opportunités de visibilité..."
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
              ></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              @click="isPlotModalOpen = false"
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-teal-300/40 cursor-pointer shadow-lg shadow-teal-500/20"
            >
              {{ editingPlotId ? 'Enregistrer les modifications' : 'Créer l\'emplacement' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL AJOUT UTILISATEUR -->
    <div
      v-if="isNewUserModalOpen"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-[#0b1629] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-black text-white">Ajouter un utilisateur</h3>
          <button
            @click="isNewUserModalOpen = false"
            class="text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="createNewUser" class="space-y-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nom complet
            </label>
            <input
              v-model="newUserForm.name"
              type="text"
              required
              placeholder="Dr. Sophie Martin"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              v-model="newUserForm.email"
              type="email"
              required
              placeholder="sophie.martin@chudequebec.ca"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Mot de passe temporaire
            </label>
            <input
              v-model="newUserForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
            />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <input
              v-model="newUserForm.admin"
              id="isAdminCheckbox"
              type="checkbox"
              class="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-teal-400"
            />
            <label for="isAdminCheckbox" class="text-xs text-slate-300 font-bold cursor-pointer">
              Accorder les droits d'administrateur
            </label>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              @click="isNewUserModalOpen = false"
              class="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Créer le compte
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { usePlotsStore } from '../stores/plots.js'

const router = useRouter()
const authStore = useAuthStore()
const plotsStore = usePlotsStore()

onMounted(() => {
  if (!authStore.isAdmin) {
    router.replace({ path: '/', query: { reason: 'admin_forbidden' } })
  }
})

const activeTab = ref('plots')
const searchQuery = ref('')
const filterHospital = ref('')
const filterStatus = ref('')

const toastMessage = ref('')
const toastType = ref('success')

function showToast(msg, type = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3500)
}

function formatShortPrice(val) {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} M$`
  return `${new Intl.NumberFormat('fr-CA').format(val)} $`
}

const filteredPlots = computed(() => {
  return plotsStore.plots.filter((p) => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const matchName = p.name?.toLowerCase().includes(q)
      const matchSector = p.sector?.toLowerCase().includes(q)
      const matchHospital = p.hospital?.toLowerCase().includes(q)
      if (!matchName && !matchSector && !matchHospital) return false
    }
    if (filterHospital.value && p.hospital !== filterHospital.value) return false
    if (filterStatus.value === 'available' && !p.available) return false
    if (filterStatus.value === 'reserved' && p.available) return false
    return true
  })
})

function handleLogout() {
  authStore.logout()
  router.push('/')
}

// TOGGLE DISPONIBILITÉ
function toggleAvailability(plot) {
  const newStatus = plotsStore.toggleAvailability(plot.id)
  showToast(
    `Statut mis à jour : "${plot.name}" est désormais ${newStatus ? 'Disponible' : 'Réservé'}.`,
  )
}

// SUPPRESSION
function confirmDeletePlot(plot) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'emplacement "${plot.name}" ?`)) {
    plotsStore.deletePlot(plot.id)
    showToast(`Emplacement "${plot.name}" supprimé avec succès.`, 'success')
  }
}

// MODAL GESTION EMPLACEMENT
const isPlotModalOpen = ref(false)
const editingPlotId = ref(null)

const defaultPlotForm = {
  name: '',
  hospital: 'CHUL',
  sector: '',
  price: 150000,
  available: true,
  image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop',
  description: '',
}

const plotForm = reactive({ ...defaultPlotForm })

function openAddModal() {
  editingPlotId.value = null
  Object.assign(plotForm, defaultPlotForm)
  isPlotModalOpen.value = true
}

function openEditModal(plot) {
  editingPlotId.value = plot.id
  Object.assign(plotForm, {
    name: plot.name,
    hospital: plot.hospital,
    sector: plot.sector,
    price: plot.price,
    available: plot.available,
    image: plot.image,
    description: plot.description || '',
  })
  isPlotModalOpen.value = true
}

function savePlot() {
  if (editingPlotId.value) {
    plotsStore.updatePlot(editingPlotId.value, { ...plotForm })
    showToast(`L'emplacement "${plotForm.name}" a été modifié.`)
  } else {
    plotsStore.addPlot({ ...plotForm })
    showToast(`L'emplacement "${plotForm.name}" a été créé.`)
  }
  isPlotModalOpen.value = false
}

function resetPlotsData() {
  if (confirm('Réinitialiser tous les emplacements aux données par défaut ?')) {
    plotsStore.resetToDefault()
    showToast('Données réinitialisées.')
  }
}

// GESTION UTILISATEURS
const isNewUserModalOpen = ref(false)
const newUserForm = reactive({
  name: '',
  email: '',
  password: '',
  admin: false,
})

function toggleAdminRole(user) {
  const res = authStore.toggleUserAdmin(user.email)
  if (res.success) {
    showToast(`Rôle de ${user.name} mis à jour.`)
  } else {
    showToast(res.message, 'error')
  }
}

function deleteUserAccount(user) {
  if (confirm(`Confirmez-vous la suppression du compte de ${user.name} ?`)) {
    const res = authStore.deleteUser(user.email)
    if (res.success) {
      showToast(`Compte supprimé avec succès.`)
    } else {
      showToast(res.message, 'error')
    }
  }
}

function createNewUser() {
  const res = authStore.addUser({ ...newUserForm })
  if (res.success) {
    showToast(`Utilisateur ${newUserForm.name} créé avec succès.`)
    isNewUserModalOpen.value = false
    newUserForm.name = ''
    newUserForm.email = ''
    newUserForm.password = ''
    newUserForm.admin = false
  } else {
    showToast(res.message, 'error')
  }
}
</script>
