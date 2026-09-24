<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-slate-100 text-slate-800 selection:bg-blue-500 selection:text-white"
  >
    <div>
      <AppHeader
        :hospitals="hospitals"
        :selected-hospital="selectedHospital"
        @select-hospital="handleHospitalSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import AppHeader from './components/AppHeader.vue'
</script>
