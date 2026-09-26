<template>
  <div class="min-h-screen bg-slate-100 py-10 px-4 md:px-8">
    <div class="max-w-7xl mx-auto">
      <button
        @click="router.back()"
        class="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <i class="fa-solid fa-arrow-left"></i>
        Retour
      </button>

      <div
        v-if="plot"
        class="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
      >
        <div class="grid grid-cols-1 lg:grid-cols-5">
          <div class="relative h-80 lg:h-[560px] lg:col-span-3">
            <img
              :src="plot.image"
              :alt="plot.name"
              class="w-full h-full object-cover"
            />
            <span
              v-if="plot.available"
              class="absolute top-6 left-6 bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full"
            >
              Disponible
            </span>
            <span
              v-else
              class="absolute top-6 left-6 bg-slate-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full"
            >
              Non disponible
            </span>
          </div>

          <div class="p-10 lg:col-span-2 flex flex-col justify-between">
            <div class="space-y-6">
              <div>
                <p class="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                  {{ plot.hospital }}
                </p>
                <h1 class="text-3xl font-bold text-slate-900 mt-2">
                  {{ plot.name }}
                </h1>
              </div>

              <div>
                <p class="text-sm text-slate-500">Secteur de soins</p>
                <p class="text-lg font-medium text-slate-800">
                  {{ plot.sector }}
                </p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Description</p>
                <p class="text-lg font-medium text-slate-800">
                  {{ plot?.description || 'Aucune description disponible pour cet emplacement.' }}
                </p>
              </div>
            </div>

            <div class="mt-10 border-t border-slate-200 pt-8 space-y-4">
              <div>
                <p class="text-sm text-slate-500">Valeur de l'espace</p>
                <p class="text-4xl font-bold text-slate-900">
                  {{ plot.formattedPrice }}
                </p>
              </div>

              <button
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <i class="fa-solid fa-calendar-check"></i>
                Réserver l'emplacement
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-200 p-10">
          <h2 class="text-xl font-bold text-slate-900 mb-6">
            Détails de l'espace
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-slate-50 rounded-xl p-5">
              <p class="text-sm text-slate-500">Dimensions</p>
              <p class="text-lg font-semibold text-slate-800">
                {{ plot?.dimensions || 'Dimensions non disponibles' }}
              </p>
            </div>
            <div class="bg-slate-50 rounded-xl p-5">
              <p class="text-sm text-slate-500">Valeur totale sur 15 ans</p>
              <p class="text-lg font-semibold text-slate-800">
                {{ plot?.valeur15ans || 'Valeur non disponible' }}
              </p>
            </div>
            <div class="bg-slate-50 rounded-xl p-5">
              <p class="text-sm text-slate-500">Achalandage</p>
              <p class="text-lg font-semibold text-slate-800">
                {{ plot?.achalandage || 'Achalandage non disponible' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 text-center text-slate-500"
      >
        Emplacement introuvable.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockPlots } from '../data/mockData.js'

const route = useRoute()
const router = useRouter()

const plot = ref(null)

onMounted(() => {
  const id = Number(route.params.id)
  plot.value = mockPlots.find((p) => p.id === id) || null
})
</script>