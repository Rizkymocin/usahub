<template>
  <div class="min-h-screen flex flex-col justify-center px-8 bg-white">
    <div class="mb-10 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store-icon lucide-store text-white"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></svg>
      </div>
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">UsaHub</h1>
      <p class="text-slate-500 mt-2">Masuk untuk mengelola usaha Anda</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
        <div class="relative">
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 placeholder:text-slate-400"
            placeholder="nama@email.com"
          />
          <Mail class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
        <div class="relative">
          <input 
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            required
            class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 placeholder:text-slate-400"
            placeholder="••••••••"
          />
          <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Eye v-if="!showPassword" class="w-5 h-5" />
            <EyeOff v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="pt-4">
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          <span v-if="isLoading" class="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
          <span v-else>Masuk Sekarang</span>
        </button>
      </div>

      <div v-if="error" class="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
        <AlertCircle class="w-5 h-5 flex-shrink-0" />
        {{ error }}
      </div>
    </form>

    <div class="mt-8 text-center">
      <p class="text-sm text-slate-400">Versi 1.0.0 &bull; Build production</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import { Mail, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const error = ref('');

const handleLogin = async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
        await auth.login(email.value, password.value);
        router.push('/');
    } catch (err: any) {
        error.value = err.message || 'Gagal login. Periksa email dan password.';
    } finally {
        isLoading.value = false;
    }
};
</script>
