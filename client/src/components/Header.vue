<template>
  <header
    class="bg-[#0a1526] text-white shadow-2xl relative z-20 border-b border-slate-800 overflow-hidden"
  >
    <div class="max-w-[1700px] mx-auto px-4 lg:px-8 py-3">
      <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div class="flex items-center gap-6 shrink-0">
          <div class="flex items-center gap-3">
            <div class="relative flex items-center justify-center w-12 h-12 text-teal-400">
              <span class="w-full h-full">Logo</span>
            </div>
            <div class="flex flex-col leading-tight border-l border-slate-700/80 pl-3">
              <span class="font-black text-2xl tracking-tight text-white">CHU</span>
              <span class="text-[12px] font-bold tracking-wide text-white">de Québec</span>
              <span class="text-[9px] text-slate-300 tracking-wider">Université Laval</span>
            </div>
          </div>
          <div class="hidden sm:block h-14 w-px bg-slate-700/80"></div>
          <div class="flex flex-col justify-center">
            <h1
              class="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase leading-none"
            >
              PLAN DE PROJET
            </h1>
            <h2
              class="text-teal-300 text-xs lg:text-sm font-bold uppercase tracking-wider mt-1 leading-tight"
            >
              PLATEFORME DE VALORISATION DES ESPACES<br />
              <span class="text-teal-400">TOPONYMIE & VISIBILITÉ</span>
            </h2>
            <p class="text-[11px] lg:text-xs text-slate-300 mt-1 max-w-md font-light leading-snug">
              Transformer nos espaces en opportunités durables pour la santé, la recherche et la
              communauté.
            </p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2.5 h-28 lg:h-32 py-2 p-1">
          <button
            v-for="hospital in hospitals"
            :key="hospital.code"
            @click="$emit('select-hospital', hospital.code)"
            :class="[
              'relative group h-full w-20 sm:w-24 xl:w-28 overflow-hidden rounded-xl border-2 transition-all duration-300 focus:outline-none cursor-pointer shrink-0',
              selectedHospital === hospital.code
                ? 'border-teal-400 ring-2 ring-teal-400/60 ring-inset shadow-[0_0_20px_rgba(45,212,191,0.4)] z-10 brightness-110'
                : 'border-slate-700/80 hover:border-teal-400/50 opacity-75 hover:opacity-100',
            ]"
          >
            <div class="absolute inset-0 w-full h-full">
              <img
                :src="hospital.image || getHospitalImage(hospital.code)"
                :alt="hospital.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
              ></div>
            </div>
            <div class="absolute bottom-2.5 inset-x-0 text-center px-1">
              <span
                class="block text-xs sm:text-sm md:text-base font-black text-white tracking-wider drop-shadow-md"
              >
                {{ hospital.code }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  hospitals: { type: Array, required: true },
  selectedHospital: { type: String, default: '' },
})

defineEmits(['select-hospital'])

const getHospitalImage = (code) => {
  const images = {
    CHUL: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&auto=format&fit=crop',
    HEJ: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop',
    HDQ: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop',
    HSFA: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=500&auto=format&fit=crop',
    HSS: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=500&auto=format&fit=crop',
  }
  return (
    images[code] ||
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop'
  )
}
</script>
