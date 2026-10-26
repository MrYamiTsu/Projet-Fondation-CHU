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
      class="absolute right-0 top-full mt-3 z-50 w-88 max-w-[calc(100vw-2rem)] origin-top-right bg-[#0a1526] text-white border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 p-4"
    >
      <span
        class="absolute -top-1.5 right-12 w-3 h-3 rotate-45 bg-[#0a1526] border-l border-t border-slate-700/80"
      ></span>

      <button
        @click="close"
        aria-label="Fermer"
        class="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        ✕
      </button>

      <div class="flex gap-4 border-b border-slate-700/80 mb-4 pr-6">
        <button
          @click="switchTab(false)"
          :class="[
            'pb-2 text-[11px] font-black uppercase tracking-wider transition-colors border-b-2 -mb-px cursor-pointer',
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
            'pb-2 text-[11px] font-black uppercase tracking-wider transition-colors border-b-2 -mb-px cursor-pointer',
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
        class="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg font-medium flex items-center gap-2"
      >
        <i class="fa-solid fa-circle-exclamation text-red-400 text-xs shrink-0"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="submit" class="space-y-3">
        <!-- Inscription : Prénom et Nom -->
        <div v-if="isSignUp" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Prénom
            </label>
            <input
              v-model="form.prenom"
              type="text"
              required
              placeholder="Jean"
              class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
            />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nom
            </label>
            <input
              v-model="form.nom"
              type="text"
              required
              placeholder="Dupont"
              class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="exemple@hopital.ca"
            class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Mot de passe
            <span v-if="isSignUp" class="text-[9px] text-slate-400 font-normal lowercase">(min. 8 car.)</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            :minlength="isSignUp ? 8 : 1"
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm bg-slate-900/80 text-white placeholder-slate-500 border border-slate-700/80 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 transition-colors"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 border border-teal-300/40 cursor-pointer flex items-center justify-center gap-2"
        >
          <i v-if="authStore.isLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
          <span>{{ authStore.isLoading ? 'Patientez...' : isSignUp ? 'Créer mon compte' : 'Se connecter' }}</span>
        </button>
      </form>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'login', 'signup'])

const authStore = useAuthStore()

const panel = ref(null)
const isSignUp = ref(false)
const errorMessage = ref('')

const form = reactive({ prenom: '', nom: '', email: '', password: '' })

function resetForm() {
  form.prenom = ''
  form.nom = ''
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

async function handleLogin() {
  errorMessage.value = ''
  const result = await authStore.login(form.email, form.password)

  if (!result.success) {
    errorMessage.value = result.message || 'Email ou mot de passe incorrect.'
    return
  }

  emit('login', result.user)
  resetForm()
  close()
}

async function handleSignUp() {
  errorMessage.value = ''
  const result = await authStore.signup({
    prenom: form.prenom,
    nom: form.nom,
    email: form.email,
    password: form.password,
  })

  if (!result.success) {
    errorMessage.value = result.message || 'Erreur lors de la création du compte.'
    return
  }

  emit('signup', result.user)
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