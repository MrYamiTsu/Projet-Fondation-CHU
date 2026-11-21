import { ref } from 'vue'
import { defineStore } from 'pinia'

const DURATION_MS = 4000

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  let timer = null

  function show(text) {
    clearTimeout(timer)
    message.value = text
    timer = setTimeout(close, DURATION_MS)
  }

  function close() {
    clearTimeout(timer)
    message.value = ''
  }

  return { message, show, close }
})
