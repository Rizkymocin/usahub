<template>
  <div class="min-h-screen bg-slate-50 pb-24 p-5">
    <header class="flex items-center gap-3 mb-6">
      <button @click="$router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 active:scale-95 transition-all">
        <ArrowLeft class="w-6 h-6 text-slate-800" />
      </button>
      <h1 class="text-xl font-bold text-slate-900">Riwayat Aktivitas</h1>
    </header>

    <div v-if="store.loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-20 bg-white rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="store.logs.length === 0" class="text-center py-12">
      <div class="bg-white p-4 rounded-full inline-block mb-3 shadow-sm">
        <Clock class="w-8 h-8 text-slate-300" />
      </div>
      <p class="text-slate-500 text-sm">Belum ada aktivitas tercatat.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="log in store.logs" :key="log.id"
        class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-primary/20 transition-colors">
        <div class="flex items-start gap-3">
          <div class="mt-1 p-2 bg-blue-50 rounded-lg shrink-0">
            <Activity class="w-4 h-4 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-0.5">
              <h3 class="font-bold text-slate-900 text-sm capitalize truncate pr-2">
                {{ log.description }}
              </h3>
              <span class="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                {{ formatDate(log.created_at) }}
              </span>
            </div>
            <!-- Subject info -->
            <p v-if="log.subject_type" class="text-xs text-slate-500 mb-1">
              {{ formatSubject(log.subject_type) }}
            </p>
            <!-- Details (simple preview) -->
            <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
              {{ log.properties?.attributes ? 'Perubahan data: ' + Object.keys(log.properties.attributes).join(', ') :
              'Aktivitas sistem' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useActivityStore } from '@/stores/activity.store';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, Clock, Activity } from 'lucide-vue-next';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const store = useActivityStore();
const auth = useAuthStore();

onMounted(() => {
  if (auth.user?.business_public_id) {
    store.fetchLogs(auth.user.business_public_id);
  }
});

const formatDate = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
  } catch (e) {
    return date;
  }
};

const formatSubject = (type: string) => {
  return type.split('\\').pop() || type;
};
</script>
