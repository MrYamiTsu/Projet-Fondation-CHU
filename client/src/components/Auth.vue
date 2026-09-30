<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 -translate-y-1 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-1 scale-95"
  >
    <div
      v-if="isOpen"
      ref="panel"
      role="dialog"
      aria-label="Connexion"
      class="absolute right-0 top-full mt-3 z-50 w-80 max-w-[calc(100vw-2rem)] origin-top-right bg-[#0a1526] text-white border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 p-4"
    >
      <span
        class="absolute -top-1.5 right-12 w-3 h-3 rotate-45 bg-[#0a1526] border-l border-t border-slate-700/80"
      ></span>

      <button
        @click="close"
        aria-label="Fermer"
        class="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        ✕
      </button>
      <div class="flex gap-4 border-b border-slate-700/80 mb-4 pr-6">
        <button
          @click="switchTab(false)"
          :class="[
            'pb-2 text-[11px] font-black uppercase tracking-wider transition-colors border-b-2 -mb-px',
            !isSignUp
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          Connexion
        </button>
        <button
          @click="switchTab(true)"
          :class="[
            'pb-2 text-[11px] font-black uppercase tracking-wider transition-colors border-b-2 -mb-px',
            isSignUp
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          Créer un compte
        </button>
      </div>

      <div
        v-if="errorMessage"
        class="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg font-medium"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="submit" class="space-y-3">
        <div v-if="isSignUp">
          <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1"
            >Nom complet</label
          >
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Jean Dupont"
            class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="exemple@hopital.ca"
            class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
          />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1"
            >Mot de passe</label
          >
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 border border-teal-300/40"
        >
          {{ isSignUp ? 'Créer mon compte' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'login', 'signup'])

const panel = ref(null)
const isSignUp = ref(false)
const errorMessage = ref('')

const form = reactive({ name: '', email: '', password: '' })

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
}

function switchTab(toSignUp) {
  isSignUp.value = toSignUp
  errorMessage.value = ''
}

function close() {
  errorMessage.value = ''
  emit('close')
}

function submit() {
  if (isSignUp.value) handleSignUp()
  else handleLogin()
}

function handleLogin() {
  errorMessage.value = ''
  const user = props.users.find((u) => u.email === form.email && u.password === form.password)

  if (!user) {
    errorMessage.value = 'Email ou mot de passe incorrect.'
    return
  }

  emit('login', user)
  resetForm()
  close()
}

function handleSignUp() {
  errorMessage.value = ''
  const exists = props.users.some((u) => u.email === form.email)

  if (exists) {
    errorMessage.value = 'Un compte existe déjà avec cet email.'
    return
  }

  emit('signup', { name: form.name, email: form.email, password: form.password })
  resetForm()
  close()
}

function onDocumentClick(e) {
  if (!props.isOpen || !panel.value) return
  if (!e.composedPath().includes(panel.value)) close()
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>
