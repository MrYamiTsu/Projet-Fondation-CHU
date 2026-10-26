<template>
  <div class="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
        <!-- Barre de navigation Institutionnelle Admin -->
    <header class="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md bg-white/95">
      <!-- Fine ligne de signature institutionnelle en tête (sarcelle officiel du CHU) -->
      <div class="h-[2px] bg-teal-700 w-full"></div>

      <div class="max-w-[1700px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        <!-- Logo & Titre Admin -->
        <router-link to="/" class="flex items-center gap-3.5 group shrink-0">
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
                class="inline-flex items-center text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded tracking-wide"
              >
                Administration
              </span>
            </div>
            <span class="text-xs text-slate-500 font-medium leading-none mt-1">
              Université Laval &bull; <span class="text-slate-400">Panneau de gestion</span>
            </span>
          </div>
        </router-link>

        <!-- Actions de navigation & Utilisateur connecté -->
        <div class="flex items-center gap-3 shrink-0">
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
          >
            <i class="fa-solid fa-arrow-left text-xs text-slate-500"></i>
            <span class="hidden sm:inline">Portail public</span>
          </router-link>

          <div
            v-if="authStore.currentUser"
            class="flex items-center gap-2.5 pl-3 border-l border-slate-200"
          >
            <div
              class="w-8 h-8 rounded-full bg-slate-900 text-teal-300 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0"
            >
              {{ authStore.currentUser.name.charAt(0).toUpperCase() }}
            </div>
            <div class="text-left leading-tight hidden md:block">
              <span class="block text-xs font-bold text-slate-900">
                {{ authStore.currentUser.name }}
              </span>
              <span class="block text-[10px] text-slate-500 mt-0.5">
                {{ authStore.currentUser.email }}
              </span>
            </div>
            <button
              @click="handleLogout"
              class="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
              title="Déconnexion"
              aria-label="Déconnexion"
            >
              <i class="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            </button>
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
        class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold"
        :class="
          toastType === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-600/50'
            : 'bg-red-900 text-red-100 border-red-600/50'
        "
      >
        <i
          :class="
            toastType === 'success'
              ? 'fa-solid fa-circle-check text-emerald-300 text-sm'
              : 'fa-solid fa-circle-exclamation text-red-300 text-sm'
          "
        ></i>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Contenu Principal -->
    <main class="flex-1 max-w-[1700px] w-full mx-auto px-4 lg:px-8 py-8 space-y-6">
      <!-- En-tête de page -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">
            Gestion du parc d'espaces et des accès
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Supervisez les opportunités de toponymie des 5 hôpitaux, gérez la disponibilité en temps réel et les accès autorisés.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            @click="openAddModal"
            class="px-4 py-2.5 bg-[#0a1526] hover:bg-[#132238] text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <i class="fa-solid fa-plus text-xs text-teal-400"></i>
            <span>Ajouter un emplacement</span>
          </button>
        </div>
      </div>

      <!-- KPI Cards (Indicateurs clés - style épuré institutionnel) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total des espaces</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
              <i class="fa-solid fa-layer-group"></i>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">{{ plotsStore.totalPlots }}</span>
            <span class="text-xs text-slate-500">référencés</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Sur l'ensemble des 5 sites hospitaliers</p>
        </div>

        <!-- Disponibles -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponibles</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <i class="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-black text-emerald-700">{{ plotsStore.availablePlots }}</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {{ plotsStore.totalPlots ? Math.round((plotsStore.availablePlots / plotsStore.totalPlots) * 100) : 0 }}% libre
            </span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Prêts pour attribution nominative</p>
        </div>

        <!-- Réservés -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attribués / Réservés</span>
            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
              <i class="fa-solid fa-handshake"></i>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-800">{{ plotsStore.reservedPlots }}</span>
            <span class="text-xs text-slate-500">engagements actifs</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Toponymie durable en cours</p>
        </div>

        <!-- Valeur totale -->
        <div class="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potentiel philanthropique</span>
            <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-black text-slate-900">
              {{ formatShortPrice(plotsStore.totalValuation) }}
            </span>
            <span class="text-xs font-medium text-slate-500">CAD</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Valeur totale cumulée du réseau</p>
        </div>
      </div>

      <!-- Barre d'onglets épurée -->
      <div class="flex border-b border-slate-200 gap-8">
        <button
          @click="activeTab = 'plots'"
          :class="[
            'pb-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer',
            activeTab === 'plots'
              ? 'border-[#0a1526] text-[#0a1526]'
              : 'border-transparent text-slate-400 hover:text-slate-700',
          ]"
        >
          <i class="fa-solid fa-list text-xs"></i>
          <span>Emplacements de valorisation ({{ plotsStore.totalPlots }})</span>
        </button>
        <button
          @click="activeTab = 'users'"
          :class="[
            'pb-3 text-xs font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer',
            activeTab === 'users'
              ? 'border-[#0a1526] text-[#0a1526]'
              : 'border-transparent text-slate-400 hover:text-slate-700',
          ]"
        >
          <i class="fa-solid fa-users text-xs"></i>
          <span>Gestion des utilisateurs ({{ authStore.users.length }})</span>
        </button>
      </div>

      <!-- ONGLET 1: GESTION DES EMPLACEMENTS -->
      <div v-if="activeTab === 'plots'" class="space-y-4">
        <!-- Barre de filtres & recherche -->
        <div class="bg-white border border-slate-200/90 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
          <!-- Recherche texte -->
          <div class="relative w-full md:w-80">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher par nom, secteur..."
              class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <!-- Filtres déroulants -->
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <!-- Filtre Hôpital -->
            <select
              v-model="filterHospital"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="">Tous les hôpitaux</option>
              <option value="CHUL">CHUL (Univ. Laval)</option>
              <option value="HEJ">Hôpital de l'Enfant-Jésus (HEJ)</option>
              <option value="HDQ">L'Hôtel-Dieu de Québec (HDQ)</option>
              <option value="HSFA">Saint-François d'Assise (HSFA)</option>
              <option value="HSS">Sacré-Cœur (HSS)</option>
              <option value="CRCE">Recherche (CRCE)</option>
            </select>

            <!-- Filtre Statut -->
            <select
              v-model="filterStatus"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-teal-600 cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="available">Disponibles uniquement</option>
              <option value="reserved">Réservés uniquement</option>
            </select>

            <span class="text-xs font-semibold text-slate-500 ml-2 hidden lg:inline">
              {{ filteredPlots.length }} résultat{{ filteredPlots.length > 1 ? 's' : '' }}
            </span>

            <button
              @click="resetPlotsData"
              class="ml-auto text-xs text-slate-400 hover:text-slate-600 p-2 transition-colors cursor-pointer"
              title="Restaurer les données initiales de démo"
            >
              <i class="fa-solid fa-rotate text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Tableau des emplacements -->
        <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="py-3.5 px-4">Emplacement</th>
                  <th class="py-3.5 px-4">Site hospitalier</th>
                  <th class="py-3.5 px-4">Secteur de soins</th>
                  <th class="py-3.5 px-4">Valeur nominale</th>
                  <th class="py-3.5 px-4 text-center">Statut d'attribution</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="plot in filteredPlots"
                  :key="plot.id"
                  class="hover:bg-slate-50/70 transition-colors"
                >
                  <!-- Nom et visuel -->
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <img
                        :src="plot.image"
                        :alt="plot.name"
                        class="w-12 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div>
                        <span class="font-bold text-slate-900 block text-sm">{{ plot.name }}</span>
                        <span class="text-[11px] text-slate-400 font-mono">Ref: #{{ plot.id }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Hôpital -->
                  <td class="py-3.5 px-4">
                    <span
                      class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {{ plot.hospital }}
                    </span>
                  </td>

                  <!-- Secteur -->
                  <td class="py-3.5 px-4 text-slate-600 font-medium">
                    {{ plot.sector }}
                  </td>

                  <!-- Prix -->
                  <td class="py-3.5 px-4 font-bold text-slate-900">
                    {{ plot.formattedPrice }}
                  </td>

                  <!-- Toggle Disponibilité -->
                  <td class="py-3.5 px-4 text-center">
                    <button
                      @click="toggleAvailability(plot)"
                      :class="[
                        'px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border',
                        plot.available
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
                      ]"
                      :title="plot.available ? 'Cliquer pour marquer comme attribué' : 'Cliquer pour libérer'"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="plot.available ? 'bg-emerald-500' : 'bg-slate-400'"
                      ></span>
                      <span>{{ plot.available ? 'Disponible' : 'Réservé' }}</span>
                    </button>
                  </td>

                  <!-- Actions -->
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <router-link
                        :to="`/emplacement/${plot.id}`"
                        class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors border border-slate-200"
                        title="Voir la page publique"
                      >
                        <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                      </router-link>
                      <button
                        @click="openEditModal(plot)"
                        class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Modifier cet emplacement"
                      >
                        <i class="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        @click="confirmDeletePlot(plot)"
                        class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Supprimer cet emplacement"
                      >
                        <i class="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredPlots.length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-400">
                    <i class="fa-solid fa-folder-open text-2xl mb-2 text-slate-300 block"></i>
                    Aucun emplacement ne correspond aux critères de recherche.
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
            <h2 class="text-base font-bold text-slate-900">Comptes d'accès autorisés</h2>
            <p class="text-xs text-slate-500">Supervisez les accès administratifs et les gestionnaires de la plateforme.</p>
          </div>
          <button
            @click="isNewUserModalOpen = true"
            class="px-3.5 py-2 bg-[#0a1526] hover:bg-[#132238] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <i class="fa-solid fa-user-plus text-xs text-teal-400"></i>
            <span>Inviter un utilisateur</span>
          </button>
        </div>

        <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/90 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="py-3.5 px-4">Utilisateur</th>
                <th class="py-3.5 px-4">Courriel</th>
                <th class="py-3.5 px-4">Rôle</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="user in authStore.users"
                :key="user.email"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                      {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="font-bold text-slate-900">{{ user.name }}</span>
                      <span
                        v-if="authStore.currentUser?.email === user.email"
                        class="ml-2 text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-semibold"
                      >
                        Votre session
                      </span>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{{ user.email }}</td>
                <td class="py-3.5 px-4">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5',
                      user.admin
                        ? 'bg-[#0a1526] text-teal-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-200',
                    ]"
                  >
                    <i :class="user.admin ? 'fa-solid fa-shield-halved text-[9px]' : 'fa-solid fa-user text-[9px]'"></i>
                    <span>{{ user.admin ? 'Administrateur' : 'Utilisateur' }}</span>
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="toggleAdminRole(user)"
                      class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {{ user.admin ? 'Rétrograder en utilisateur' : 'Promouvoir Administrateur' }}
                    </button>
                    <button
                      @click="deleteUserAccount(user)"
                      :disabled="authStore.currentUser?.email === user.email"
                      :class="[
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors',
                        authStore.currentUser?.email === user.email
                          ? 'opacity-25 cursor-not-allowed text-slate-400'
                          : 'bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 cursor-pointer',
                      ]"
                      title="Supprimer ce compte"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- MODAL AJOUT (TEMPLATE) / MODIFICATION D'EMPLACEMENT -->
    <div
      v-if="isPlotModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-white border border-slate-200 rounded-2xl w-full p-6 shadow-2xl space-y-4 text-slate-800"
        :class="editingPlotId ? 'max-w-2xl max-h-[90vh] overflow-y-auto' : 'max-w-md'"
      >
        <!-- CAS 1 : GABARIT / TEMPLATE D'AJOUT D'EMPLACEMENT (MINIMALISTE) -->
        <template v-if="!editingPlotId">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-base font-bold text-slate-900">
              Ajouter un emplacement
            </h3>
            <button
              @click="isPlotModalOpen = false"
              class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 text-sm"
            >
              ✕
            </button>
          </div>

          <!-- Placeholder template minimaliste -->
          <div
            class="py-12 px-6 flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3"
          >
            <div
              class="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs"
            >
              <i class="fa-solid fa-shapes text-lg"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-slate-700">Section formulaire (Template)</p>
              <p class="text-xs text-slate-400 mt-0.5">
                Gabarit d'ajout d'emplacement
              </p>
            </div>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
            >
              Template
            </span>
          </div>

          <div class="flex items-center justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="isPlotModalOpen = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </template>

        <!-- CAS 2 : MODIFICATION D'UN EMPLACEMENT EXISTANT -->
        <template v-else>
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Modifier l'emplacement
              </h3>
              <p class="text-xs text-slate-500">
                Mise à jour des informations de l'espace sélectionné.
              </p>
            </div>
            <button
              @click="isPlotModalOpen = false"
              class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="savePlot" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Nom -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Nom de l'espace *
                </label>
                <input
                  v-model="plotForm.name"
                  type="text"
                  required
                  placeholder="Ex: Hall Principal & Atrium"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <!-- Hôpital -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Site hospitalier *
                </label>
                <select
                  v-model="plotForm.hospital"
                  required
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                >
                  <option value="CHUL">CHUL (Univ. Laval)</option>
                  <option value="HEJ">HEJ (Enfant-Jésus)</option>
                  <option value="HDQ">HDQ (Hôtel-Dieu)</option>
                  <option value="HSFA">HSFA (St-François d'Assise)</option>
                  <option value="HSS">HSS (Sacré-Cœur)</option>
                  <option value="CRCE">CRCE (Centre de Recherche)</option>
                </select>
              </div>

              <!-- Secteur de soins -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Secteur de soins *
                </label>
                <input
                  v-model="plotForm.sector"
                  type="text"
                  required
                  placeholder="Ex: Pédiatrie, Traumatologie, Urgence"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <!-- Prix / Valeur -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Valeur philanthropique ($ CAD) *
                </label>
                <input
                  v-model.number="plotForm.price"
                  type="number"
                  min="0"
                  step="5000"
                  required
                  placeholder="Ex: 250000"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <!-- Statut Disponibilité -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Statut
                </label>
                <select
                  v-model="plotForm.available"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                >
                  <option :value="true">Disponible à l'attribution</option>
                  <option :value="false">Réservé / Attribué</option>
                </select>
              </div>

              <!-- Image URL -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  URL de l'image
                </label>
                <input
                  v-model="plotForm.image"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                />
              </div>

              <!-- Description -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  v-model="plotForm.description"
                  rows="3"
                  placeholder="Description du lieu, visibilité offerte, flux de circulation..."
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
                ></textarea>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                @click="isPlotModalOpen = false"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="px-5 py-2 bg-[#0a1526] hover:bg-[#132238] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>

    <!-- MODAL AJOUT UTILISATEUR -->
    <div
      v-if="isNewUserModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-800"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-base font-bold text-slate-900">Inviter un utilisateur</h3>
            <p class="text-xs text-slate-500">Ajoutez un accès à l'équipe de la Fondation.</p>
          </div>
          <button
            @click="isNewUserModalOpen = false"
            class="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="createNewUser" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Nom complet
            </label>
            <input
              v-model="newUserForm.name"
              type="text"
              required
              placeholder="Dr. Sophie Martin"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Courriel professionnel
            </label>
            <input
              v-model="newUserForm.email"
              type="email"
              required
              placeholder="sophie.martin@chudequebec.ca"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Mot de passe initial
            </label>
            <input
              v-model="newUserForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-600"
            />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <input
              v-model="newUserForm.admin"
              id="isAdminCheckbox"
              type="checkbox"
              class="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label for="isAdminCheckbox" class="text-xs text-slate-700 font-semibold cursor-pointer">
              Accorder les droits d'administrateur
            </label>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isNewUserModalOpen = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-5 py-2 bg-[#0a1526] hover:bg-[#132238] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
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
  plotsStore.getPlots()
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
  if (val >= 1000000) return `${(val / 1000000).toFixed(2).replace('.', ',')} M$`
  return `${new Intl.NumberFormat('fr-CA').format(val)} $`
}

const filteredPlots = computed(() => {
  return plotsStore.plots.filter((p) => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
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
  name: 'Atrium Philanthropique & Espace Famille (Template)',
  hospital: 'HEJ',
  sector: 'Traumatologie & Neurologie',
  price: 250000,
  available: true,
  image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop',
  description:
    'Espace stratégique à fort achalandage offrant une reconnaissance durable pour un donateur majeur au sein du CHU de Québec.',
}

const plotForm = reactive({ ...defaultPlotForm })

function openAddModal() {
  editingPlotId.value = null
  Object.assign(plotForm, defaultPlotForm)
  isPlotModalOpen.value = true
}

function saveTemplatePlot() {
  showToast("Modèle d'emplacement validé en mode démonstration (Template).")
  isPlotModalOpen.value = false
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
