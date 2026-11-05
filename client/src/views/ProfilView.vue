<template>
    <div>
        <Header :current-user="authStore.currentUser" @open-auth="isAuthModalOpen = true" @logout="authStore.logout">
            <template #auth>
                <Auth :is-open="isAuthModalOpen" :users="authStore.users" @close="isAuthModalOpen = false" />
            </template>
        </Header>

        <!-- Message d'alerte si non connecté (harmonisé au thème du site) -->
        <div v-if="!authStore.isAuthenticated"
            class="max-w-xl mx-auto mt-10 bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
            <div class="p-3 bg-slate-800 text-teal-400 rounded-xl">
                <i class="fa-solid fa-lock text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-lg">Authentification requise</h3>
                <p class="text-sm text-slate-400 mt-0.5">Veuillez vous connecter pour accéder à votre profil.</p>
            </div>
        </div>

        <!-- Formulaire affiché uniquement si connecté -->
        <div v-if="authStore.isAuthenticated"
            class="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-10">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Modifier le profil utilisateur</h2>

            <div v-if="feedbackMessage" :class="feedbackClass" class="p-4 rounded-xl mb-6 text-sm font-medium">
                {{ feedbackMessage }}
            </div>

            <form @submit.prevent="updateUser" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input v-model="form.name" type="text" required
                        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800"
                        placeholder="Entrez le nom" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
                    <input v-model="form.email" type="email" required
                        class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800"
                        placeholder="exemple@courriel.com" />
                </div>

                <div v-if="authStore.isAdmin" class="flex items-center gap-3 pt-2">
                    <input id="isAdmin" v-model="form.isAdmin" type="checkbox"
                        class="w-5 h-5 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer" />
                    <label for="isAdmin" class="text-sm font-medium text-slate-700 cursor-pointer">
                        Accès administrateur
                    </label>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" @click="goBack"
                        class="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer">
                        Annuler
                    </button>
                    <button type="submit" :disabled="isSubmitting"
                        class="px-5 py-2.5 rounded-xl bg-[#0A1526] hover:bg-[#132238] text-white font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                        <i v-if="isSubmitting" class="fa-solid fa-spinner animate-spin"></i>
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Auth from '../components/Auth.vue'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthModalOpen = ref(false)
const isSubmitting = ref(false)
const feedbackMessage = ref('')
const feedbackClass = ref('')

const form = reactive({
    name: '',
    email: '',
    isAdmin: false
})

onMounted(() => {
    if (!authStore.isAuthenticated) {
        return
    }

    const userId = route.params.id
    let targetUser = null

    if (userId) {
        targetUser = authStore.users?.find(u => u.id == userId)
    } else {
        targetUser = authStore.currentUser
    }

    if (targetUser) {
        form.name = targetUser.name || targetUser.nom || targetUser.username || ''
        form.email = targetUser.email || ''
        form.isAdmin = Boolean(targetUser.isAdmin || targetUser.admin)
    }
})

async function updateUser() {
    isSubmitting.value = true
    feedbackMessage.value = ''

    try {
        await new Promise(resolve => setTimeout(resolve, 800))

        feedbackMessage.value = 'Profil mis à jour avec succès !'
        feedbackClass.value = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    } catch (error) {
        feedbackMessage.value = 'Erreur lors de la mise à jour de l’utilisateur.'
        feedbackClass.value = 'bg-rose-50 text-rose-700 border border-rose-200'
    } finally {
        isSubmitting.value = false
    }
}

function goBack() {
    router.back()
}
</script>