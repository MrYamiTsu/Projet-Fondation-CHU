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
      class="absolute right-0 top-full mt-2.5 z-50 w-88 max-w-[calc(100vw-2rem)] origin-top-right bg-white text-slate-900 border border-slate-200/90 rounded-2xl shadow-xl p-5"
    >
      <!-- Flèche discrète en haut -->
      <span
        class="absolute -top-1.5 right-12 w-3 h-3 rotate-45 bg-white border-l border-t border-slate-200/90"
      ></span>

      <!-- Bouton Fermer -->
      <button
        @click="close"
        aria-label="Fermer"
        class="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
      >
        ✕
      </button>

      <!-- Onglets Connexion / Créer un compte -->
      <div class="flex gap-4 border-b border-slate-200 mb-4 pr-8">
        <button
          @click="switchTab(false)"
          :class="[
            'pb-2.5 text-xs font-bold transition-colors border-b-2 -mb-px cursor-pointer',
            !isSignUp
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          ]"
        >
          Connexion
        </button>
        <button
          @click="switchTab(true)"
          :class="[
            'pb-2.5 text-xs font-bold transition-colors border-b-2 -mb-px cursor-pointer',
            isSignUp
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600',
          ]"
        >
          Créer un compte
        </button>
      </div>

      <!-- Message d'erreur -->
      <div
        v-if="errorMessage"
        class="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2"
      >
        <i class="fa-solid fa-circle-exclamation text-rose-500 text-xs shrink-0"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="submit" class="space-y-3.5">
        <!-- Inscription : Prénom et Nom -->
        <div v-if="isSignUp" class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">
              Prénom
            </label>
            <input
              v-model="form.prenom"
              type="text"
              required
              placeholder="Jean"
              class="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors"
            />
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-700 mb-1">
              Nom
            </label>
            <input
              v-model="form.nom"
              type="text"
              required
              placeholder="Dupont"
              class="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-700 mb-1">
            Adresse courriel
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="exemple@hopital.ca"
            class="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-[11px] font-semibold text-slate-700">
              Mot de passe
            </label>
            <span v-if="isSignUp" class="text-[10px] text-slate-400">min. 8 caractères</span>
          </div>
          <input
            v-model="form.password"
            type="password"
            required
            :minlength="isSignUp ? 8 : 1"
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm bg-slate-50 hover:bg-white text-slate-900 placeholder-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 transition-colors"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer mt-1"
        >
          <i v-if="authStore.isLoading" class="fa-solid fa-spinner fa-spin text-xs"></i>
          <i v-else class="fa-solid fa-lock text-[10px] text-teal-400"></i>
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
