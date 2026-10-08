<template>
  <div>
    <Header :hospitals="hospitals" :selected-hospital="selectedHospital" :current-user="currentUser"
      @select-hospital="handleHospitalSelect" @open-auth="isAuthModalOpen = true" @logout="handleLogout" />
  </div>

  <main class="bg-white min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">

      <aside class="lg:sticky lg:top-8">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="aspect-4/3 bg-gray-50 flex items-center justify-center">
            <img v-if="plot?.image" :src="plot.image" :alt="plot.name || 'Image de l\'emplacement'"
              class="w-full h-full object-cover" />
            <div v-else class="flex flex-col items-center gap-2 text-gray-400">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m2.25 15.75 5.16-5.16a2.25 2.25 0 0 1 3.18 0l5.16 5.16m-1.5-1.5 1.41-1.41a2.25 2.25 0 0 1 3.18 0l2.91 2.91M3.75 20.25h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Z" />
              </svg>
              <span class="text-sm">Aucune image disponible</span>
            </div>
          </div>
          <div v-if="plot" class="p-4">
            <p class="text-sm font-medium text-gray-900">{{ plot.name || `Emplacement #${plot.id}` }}</p>
          </div>
        </div>
      </aside>

      <form class="w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6"
        @submit.prevent="onSubmit">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold text-gray-900">Aperçu d'un emplacament</h2>
          <p class="text-sm text-gray-500">Remplis les informations ci-dessous.</p>
        </div>

        <div>
          <label for="nom" class="block mb-2 text-sm font-medium text-gray-900">
            Nom ou phrase à afficher <span class="text-red-500">*</span>
          </label>
          <input type="text" name="nom" id="nom" v-model="form.nom" required placeholder="Ex. : Marie Tremblay"
            class="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg placeholder:text-gray-400 transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
        </div>

        <div>
          <label for="type" class="block mb-2 text-sm font-medium text-gray-900">
            Type de reconnaissance <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select id="type" name="type" v-model="form.type" required
              class="block w-full appearance-none px-3.5 py-2.5 pr-10 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 invalid:text-gray-400">
              <option value="" disabled selected hidden>-- Choisir --</option>
              <option value="NO" class="text-gray-900">Nomination</option>
              <option value="PC" class="text-gray-900">Partenaire corporatif</option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none"
              stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div>
          <label for="file_input" class="block mb-2 text-sm font-medium text-gray-900">
            Téléverser une image
          </label>
          <input id="file_input" name="image" type="file" accept="image/png, image/jpeg, image/webp, image/gif"
            @change="onFileChange"
            class="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer transition focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
               file:mr-4 file:py-2.5 file:px-4 file:border-0 file:border-r file:border-gray-300 file:bg-gray-100 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 file:cursor-pointer" />
          <p class="mt-1.5 text-xs text-gray-500">PNG, JPG, WEBP ou GIF (max. 5 Mo).</p>
          <p v-if="fileError" class="mt-1.5 text-xs text-red-600">{{ fileError }}</p>

          <img v-if="previewUrl" :src="previewUrl" alt="Aperçu de l'image"
            class="mt-3 max-h-40 rounded-lg border border-gray-200 object-contain" />
        </div>

        <div>
          <p class="text-lg text-gray-600">Prix de l'emplacement</p>
          <p class="text-xl">{{ plot?.formattedPrice || "Prix indisponible" }}</p>
        </div>


        <div>
          <span class="block mb-2 text-sm font-medium text-gray-900">
            Période de réservation <span class="text-red-500">*</span>
          </span>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="date-start" class="block mb-1.5 text-xs text-gray-500">Début</label>
              <input id="date-start" name="start" type="date" v-model="form.start" :min="today"
                :max="form.end || undefined" required
                class="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
            </div>

            <div>
              <label for="date-end" class="block mb-1.5 text-xs text-gray-500">Fin</label>
              <input id="date-end" name="end" type="date" v-model="form.end" :min="form.start || today" required
                class="block w-full px-3.5 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg transition focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500" />
            </div>
          </div>

          <p v-if="nbJours" class="mt-2 text-xs text-gray-500">
            Durée : {{ nbJours }} jour{{ nbJours > 1 ? 's' : '' }}
          </p>
        </div>

        <button type="submit"
          class="w-full text-white bg-[#0A1526] hover:bg-[#132238] hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-5 py-2.5 shadow-sm transition focus:outline-none">
          Confirmer réservation
        </button>
      </form>

    </div>
  </main>

</template>

<script setup>
import { reactive, ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockPlots } from '../data/mockData.js'
import Header from '../components/Header.vue'

const MAX_SIZE = 5 * 1024 * 1024 // 5 Mo
const form = reactive({ nom: '', type: '', image: null, start: '', end: '' })
const today = new Date().toLocaleDateString('en-CA')
const fileError = ref('')
const previewUrl = ref('')

function onFileChange(e) {
  const file = e.target.files[0]
  fileError.value = ''

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
  form.image = null

  if (!file) return

  if (!file.type.startsWith('image/')) {
    fileError.value = 'Seules les images sont acceptées.'
    e.target.value = ''
    return
  }
  if (file.size > MAX_SIZE) {
    fileError.value = 'L\'image dépasse 5 Mo.'
    e.target.value = ''
    return
  }

  form.image = file
  previewUrl.value = URL.createObjectURL(file)
}

function onSubmit() {
  console.log('Envoi :', { ...form })
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

})

const route = useRoute()
const router = useRouter()

const plot = ref(null)

onMounted(() => {
  const id = Number(route.params.id)
  plot.value = mockPlots.find((p) => p.id === id) || null
})
watch(() => form.start, (start) => {
  if (form.end && start && form.end < start) form.end = ''
})

const nbJours = computed(() => {
  if (!form.start || !form.end) return 0
  const diff = new Date(form.end) - new Date(form.start)
  return Math.round(diff / 86_400_000) + 1
})
</script>