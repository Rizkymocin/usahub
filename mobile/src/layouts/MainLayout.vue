<template>
  <div class="flex flex-col min-h-screen bg-gray-50 pb-20">
    <main class="flex-1 p-4 pb-24">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-lg safe-area-bottom">
      <router-link to="/" class="flex flex-col items-center gap-1 text-gray-400" active-class="text-primary font-medium">
        <Home :size="24" />
        <span class="text-xs">Beranda</span>
      </router-link>
      
      <router-link to="/activity" class="flex flex-col items-center gap-1 text-gray-400" active-class="text-primary font-medium">
        <Activity :size="24" />
        <span class="text-xs">Aktivitas</span>
      </router-link>
      
      <router-link to="/account" class="flex flex-col items-center gap-1 text-gray-400" active-class="text-primary font-medium">
        <User :size="24" />
        <span class="text-xs">Akun</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Home, Activity, User } from 'lucide-vue-next';
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 12px);
}
</style>
