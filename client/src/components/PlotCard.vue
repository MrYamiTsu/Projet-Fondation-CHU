<template>
  <div
    @click="$emit('select', plot)"
    class="min-w-[260px] w-72 h-80 flex-shrink-0 bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer hover:border-teal-400/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-sm"
  >
    <div class="relative h-40 w-full overflow-hidden bg-slate-100">
      <img
        :src="
          plot?.image ||
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop'
        "
        :alt="plot?.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
      ></div>
      <div class="absolute top-3 inset-x-3 flex items-center justify-between">
        <span
          class="bg-slate-900/85 backdrop-blur text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-slate-700/80 shadow-xs"
        >
          {{ plot?.hospital }}
        </span>
        <span
          :class="[
            'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs backdrop-blur',
            plot?.available
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800/90 text-slate-300 border border-slate-600',
          ]"
        >
          {{ plot?.available ? 'Disponible' : 'Réservé' }}
        </span>
      </div>
      <div class="absolute bottom-2.5 left-3">
        <span
          class="bg-teal-500/90 backdrop-blur text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1"
        >
          <i class="fa-solid fa-stethoscope text-[9px]"></i>
          <span>{{ plot?.sector }}</span>
        </span>
      </div>
    </div>
    <div class="p-4 flex-1 flex flex-col justify-between">
      <div>
        <h4
          class="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug"
        >
          {{ plot?.name || "Nom de l'espace" }}
        </h4>
        <p class="text-[11px] text-slate-400 mt-1 line-clamp-1">
          Opportunité de toponymie & valorisation
        </p>
      </div>
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
        <div>
          <span class="block text-[9px] uppercase font-bold text-slate-400">Valeur</span>
          <span class="text-xs font-black text-slate-900 font-mono">
            {{ plot?.formattedPrice || `${plot?.price} $ CAD` }}
          </span>
        </div>
        <span
          class="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-teal-500 group-hover:text-slate-950 text-slate-500 flex items-center justify-center text-xs transition-colors"
        >
          <i class="fa-solid fa-arrow-right"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plot: { type: Object, default: () => ({}) },
})
defineEmits(['select'])
</script>
