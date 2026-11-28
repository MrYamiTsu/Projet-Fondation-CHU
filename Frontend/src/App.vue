<template>
  <Header />
  <router-view />
  <ToastNotification />
</template>

<script setup>
import Header from './components/Header.vue'
import ToastNotification from './components/ToastNotification.vue'
</script>
