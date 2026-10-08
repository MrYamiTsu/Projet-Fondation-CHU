<template>
  <div>
    <Header
        :hospitals="hospitals"
        :selected-hospital="selectedHospital"
        :current-user="currentUser"
        @select-hospital="handleHospitalSelect"
        @open-auth="isAuthModalOpen = true"
        @logout="handleLogout"
      >
      </Header>
  </div>

  <div v-if="plot" class="bg-white min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-8">

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <div class="relative rounded-2xl overflow-hidden h-[380px]">
            <img
              :src="plot.image"
              :alt="plot?.name || 'Image de l\'emplacement non disponible'"
              class="w-full h-full object-cover"
            />
            <span
              v-if="plot.available"
              class="absolute top-4 right-4 bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full"
            >
              Disponible
            </span>
            <span
              v-else
              class="absolute top-4 right-4 bg-slate-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full"
            >
              Non disponible
            </span>
          </div>

          <div>
            <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              {{ plot?.hospital || 'Hôpital non disponible' }}
            </p>
            <h1 class="text-3xl font-bold text-slate-900 mt-1">
              {{ plot?.name || 'Nom de l\'emplacement non disponible' }}
            </h1>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <p class="text-sm text-slate-500">Secteur de soins</p>
              <p class="text-base font-medium text-slate-800">
                {{ plot?.sector || 'Secteur non disponible' }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm text-slate-500">Description</p>
            <p class="text-base text-slate-800 mt-1">
              {{ plot?.description || 'Aucune description disponible pour cet emplacement.' }}
            </p>
          </div>

          <div class="border-t border-slate-200 pt-6">
            <h2 class="text-lg font-bold text-slate-900 mb-4">
              Détails de l'espace
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Dimensions</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.dimensions || 'Dimensions non disponibles' }}
                </p>
              </div>
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Valeur totale sur 15 ans</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.valeur15ans || 'Valeur non disponible' }}
                </p>
              </div>
              <div class="border border-slate-200 rounded-xl p-4">
                <p class="text-sm text-slate-500">Achalandage</p>
                <p class="text-base font-semibold text-slate-800">
                  {{ plot?.achalandage || 'Achalandage non disponible' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="border border-slate-200 rounded-2xl p-6 sticky top-6 space-y-4 shadow-sm">
            <div>
              <p class="text-sm text-slate-500">Valeur de l'espace</p>
              <p class="text-3xl font-bold text-slate-900">
                {{ plot?.formattedPrice || 'Prix non disponible' }}
              </p>
            </div>

           <button @click="openPlotReserver"
                class="w-full bg-[#0A1526] hover:bg-[#132238] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <i class="fa-solid fa-calendar-check"></i>
                Réserver l'emplacement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center text-slate-500">
    Emplacement introuvable.
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockPlots } from '../data/mockData.js'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()

const plot = ref(null)

onMounted(() => {
  const id = Number(route.params.id)
  plot.value = mockPlots.find((p) => p.id === id) || null
})

function openPlotReserver(id) {
  id = route.params.id
  router.push(`/reservation/${id}`)
}
</script>