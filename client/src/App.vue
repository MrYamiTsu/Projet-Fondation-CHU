<template>
  <div class="main-layout">
    <Navbar />

    <main class="main-content">
      <aside class="sidebar">
        <HospitalSelector />
        <FilterSection />
      </aside>

      <MapViewer />
    </main>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import HospitalSelector from '@/components/HospitalSelector.vue'
import FilterSection from '@/components/FilterSection.vue'
import MapViewer from '@/components/MapViewer.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;
}

.main-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  flex: 1;
  width: 100%;
  background: var(--color-background-soft);
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
</style>
