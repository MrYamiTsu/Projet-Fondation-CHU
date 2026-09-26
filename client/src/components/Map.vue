<template>
  <section
    class="xl:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between"
  >
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900">CARTE</h3>
      </div>
      <div
        class="bg-slate-100 rounded-xl relative map-grid flex flex-col justify-between p-4 min-h-[340px] border border-slate-200/80"
      >
        <div class="flex flex-col sm:flex-row gap-2 z-10">
          <div
            class="bg-white/95 backdrop-blur shadow-sm border border-slate-200 rounded-lg p-2 flex items-center gap-2 flex-1"
          >
            <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="Rechercher un espace, un secteur, un hôpital..."
              class="bg-transparent border-none text-xs outline-none w-full text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
        <div class="relative flex-1 my-4 min-h-[200px]">
          <div
            v-for="pin in pins"
            :key="pin.code"
            @click="$emit('select-pin', pin.code)"
            :style="{ top: pin.top, left: pin.left }"
            :class="[
              'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex items-center gap-1.5 z-20 group',
              activeHospital === pin.code ? 'scale-125 z-30' : 'hover:scale-110',
            ]"
          >
            <div class="relative">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-bold',
                  activeHospital === pin.code
                    ? 'bg-teal-500 ring-4 ring-teal-300/50'
                    : 'bg-blue-600',
                ]"
              >
                <i class="fa-solid fa-location-dot text-[9px]"></i>
              </div>
            </div>
            <span
              :class="[
                'text-[11px] font-black px-2 py-0.5 rounded shadow-md transition-colors',
                activeHospital === pin.code
                  ? 'bg-slate-900 text-teal-300'
                  : 'bg-white text-slate-800 group-hover:bg-blue-50',
              ]"
            >
              {{ pin.code }}
            </span>
          </div>
        </div>

        <div
          class="text-[10px] text-slate-500 font-medium bg-white/80 backdrop-blur px-2.5 py-1 rounded border border-slate-200 self-start z-10"
        >
          <i class="fa-solid fa-info-circle text-blue-500 mr-1"></i> Cliquez sur un marqueur pour
          consulter l'hôpital
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  pins: { type: Array, required: true },
  activeHospital: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
})

defineEmits(['select-pin', 'update:searchQuery'])
</script>
