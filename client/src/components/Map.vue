<template>
  <section
    class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-6"
  >
    <!-- En-tête de la section Carte -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600"
          >
            <i class="fa-solid fa-map-location-dot text-sm"></i>
          </div>
          <div>
            <h3 class="text-lg font-black text-slate-900 tracking-tight">
              CARTE DES SITES HOSPITALIERS
            </h3>
            <p class="text-xs text-slate-500">
              Réseau du CHU de Québec &bull; Université Laval
            </p>
          </div>
        </div>
      </div>

      <!-- Contrôle du filtre actif -->
      <div class="flex items-center gap-2">
        <template v-if="activeHospital">
          <div
            class="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-900 px-3 py-1.5 rounded-xl text-xs font-semibold"
          >
            <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Hôpital filtré : <strong class="text-teal-950 font-black">{{ activeHospital }}</strong></span>
            <button
              @click="$emit('select-hospital', '')"
              class="ml-1 text-teal-700 hover:text-teal-950 hover:bg-teal-100 p-1 rounded-md transition-colors cursor-pointer text-xs"
              title="Voir tous les hôpitaux"
            >
              ✕
            </button>
          </div>
          <button
            @click="$emit('select-hospital', '')"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Tous les sites
          </button>
        </template>
        <template v-else>
          <span
            class="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl"
          >
            5 sites affichés
          </span>
        </template>
      </div>
    </div>

    <!-- Carte interactive avec pins -->
    <div
      class="bg-gradient-to-b from-slate-100 to-slate-200/70 rounded-2xl relative map-grid flex flex-col justify-between p-4 min-h-[300px] border border-slate-200/80 shadow-inner overflow-hidden"
    >
      <!-- Barre de recherche au-dessus de la carte -->
      <div class="flex flex-col sm:flex-row gap-2 z-10">
        <div
          class="bg-white/95 backdrop-blur shadow-sm border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 flex-1 max-w-md"
        >
          <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', $event.target.value)"
            type="text"
            placeholder="Rechercher un établissement, un espace ou un secteur..."
            class="bg-transparent border-none text-xs outline-none w-full text-slate-800 placeholder-slate-400 font-medium"
          />
          <button
            v-if="searchQuery"
            @click="$emit('update:searchQuery', '')"
            class="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Zone de la carte avec les marqueurs -->
      <div class="relative flex-1 my-6 min-h-[190px]">
        <div
          v-for="pin in pins"
          :key="pin.code"
          @click="$emit('select-hospital', activeHospital === pin.code ? '' : pin.code)"
          :style="{ top: pin.top, left: pin.left }"
          :class="[
            'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex items-center gap-2 z-20 group select-none',
            activeHospital === pin.code ? 'scale-125 z-30' : 'hover:scale-110',
          ]"
        >
          <div class="relative">
            <!-- Halo lumineux pour le pin actif -->
            <span
              v-if="activeHospital === pin.code"
              class="absolute -inset-1 rounded-full bg-teal-400/50 animate-ping"
            ></span>
            <div
              :class="[
                'w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-bold transition-all',
                activeHospital === pin.code
                  ? 'bg-teal-500 ring-4 ring-teal-300/60 shadow-teal-500/40'
                  : 'bg-slate-800 group-hover:bg-teal-600',
              ]"
            >
              <i class="fa-solid fa-hospital text-[9px]"></i>
            </div>
          </div>

          <span
            :class="[
              'text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-md transition-all border',
              activeHospital === pin.code
                ? 'bg-slate-950 text-teal-300 border-teal-400/60 shadow-teal-500/20'
                : 'bg-white/95 text-slate-800 border-slate-200 group-hover:bg-slate-900 group-hover:text-white',
            ]"
          >
            {{ pin.code }}
          </span>
        </div>
      </div>

      <!-- Pied de carte avec aide -->
      <div
        class="text-[11px] text-slate-600 font-medium bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-200 self-start z-10 flex items-center gap-2 shadow-xs"
      >
        <i class="fa-solid fa-arrow-pointer text-teal-600 text-xs"></i>
        <span>Cliquez sur un marqueur ou sur l'une des cartes d'hôpitaux ci-dessous pour filtrer</span>
      </div>
    </div>

    <!-- NOUVELLE SECTION DES CARTES D'HÔPITAUX REHAUSSÉES -->
    <div>
      <div class="flex items-center justify-between mb-3.5">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <i class="fa-solid fa-square-h text-teal-600 text-sm"></i>
            <span>Établissements hospitaliers</span>
          </span>
          <span class="text-[11px] text-slate-400 font-medium">({{ hospitals.length }} sites)</span>
        </div>

        <button
          v-if="activeHospital"
          @click="$emit('select-hospital', '')"
          class="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer flex items-center gap-1"
        >
          <i class="fa-solid fa-rotate-left text-[10px]"></i>
          <span>Réinitialiser la sélection</span>
        </button>
      </div>

      <!-- Grille des superbes cartes d'hôpitaux -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <button
          v-for="hospital in hospitals"
          :key="hospital.code"
          @click="$emit('select-hospital', activeHospital === hospital.code ? '' : hospital.code)"
          :class="[
            'group relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-300 focus:outline-none cursor-pointer flex flex-col justify-between p-3.5 h-48 shadow-sm',
            activeHospital === hospital.code
              ? 'border-teal-400 ring-4 ring-teal-400/40 shadow-xl shadow-teal-500/25 brightness-105 z-10'
              : activeHospital
                ? 'border-slate-200/80 hover:border-teal-400/50 opacity-60 hover:opacity-100 hover:-translate-y-1 hover:shadow-lg'
                : 'border-slate-200/80 hover:border-teal-400/60 hover:-translate-y-1 hover:shadow-xl',
          ]"
        >
          <!-- Image de fond avec transition et dégradé -->
          <div class="absolute inset-0 w-full h-full">
            <img
              :src="hospital.image"
              :alt="hospital.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-black/35 group-hover:via-slate-950/45 transition-colors"
            ></div>
          </div>

          <!-- Haut de la carte : Code + Icône + Badge sélectionné -->
          <div class="relative z-10 flex items-center justify-between gap-2 w-full">
            <div class="flex items-center gap-1.5">
              <span
                :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-md backdrop-blur-md transition-colors',
                  activeHospital === hospital.code
                    ? 'bg-teal-400 text-slate-950 font-black'
                    : 'bg-slate-900/85 text-white border border-slate-700/80',
                ]"
              >
                {{ hospital.code }}
              </span>

              <div
                class="w-6 h-6 rounded-md bg-white/20 backdrop-blur-md text-teal-300 flex items-center justify-center text-[10px] border border-white/20"
                :title="hospital.specialty"
              >
                <i :class="hospital.icon"></i>
              </div>
            </div>

            <!-- Badge Actif -->
            <span
              v-if="activeHospital === hospital.code"
              class="bg-teal-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse"
            >
              <i class="fa-solid fa-check text-[8px]"></i>
              <span>Sélectionné</span>
            </span>
          </div>

          <!-- Bas de la carte : Nom + Spécialité + Compteur d'espaces -->
          <div class="relative z-10 space-y-1">
            <h4
              class="text-xs sm:text-sm font-black text-white leading-tight drop-shadow-md group-hover:text-teal-200 transition-colors line-clamp-2"
            >
              {{ hospital.shortName || hospital.name }}
            </h4>
            <p class="text-[10px] text-teal-300 font-medium line-clamp-1 drop-shadow-xs">
              {{ hospital.specialty }}
            </p>
            <div class="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
              <span class="text-[9px] text-slate-300 font-medium">
                {{ hospital.city }}
              </span>
              <span
                class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur border border-slate-700 text-emerald-300 flex items-center gap-1 shadow-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ getPlotsCount(hospital.code) }} espaces</span>
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { usePlotsStore } from '../stores/plots.js'

const props = defineProps({
  hospitals: { type: Array, required: true },
  pins: { type: Array, required: true },
  activeHospital: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
})

defineEmits(['select-hospital', 'update:searchQuery'])

const plotsStore = usePlotsStore()

function getPlotsCount(code) {
  if (!plotsStore.plots) return 0
  return plotsStore.plots.filter((p) => p.hospital === code).length
}
</script>
