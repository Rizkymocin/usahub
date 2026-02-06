<template>
  <div class="min-h-screen bg-slate-50 relative">
    <!-- Header -->
    <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div class="px-6 py-4 flex items-center justify-between">
        <button 
          @click="router.back()" 
          class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all"
        >
          <ChevronLeft class="w-6 h-6 text-slate-800" />
        </button>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Pemeliharaan</h1>
        <div class="w-10"></div>
      </div>
      
      <!-- Tabs (Sticky inside header) -->
      <div class="flex px-6 gap-8">
        <button 
          @click="activeTab = 'tasks'"
          class="pb-3 text-sm font-bold relative transition-colors"
          :class="activeTab === 'tasks' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'"
        >
          Tugas
          <span v-if="activeTab === 'tasks'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
        </button>
        <button 
          @click="activeTab = 'history'"
          class="pb-3 text-sm font-bold relative transition-colors"
          :class="activeTab === 'history' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'"
        >
          Riwayat
          <span v-if="activeTab === 'history'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
        </button>
      </div>
    </header>

    <main class="pt-[8.5rem] pb-6 px-4">
      <!-- Summary Card -->
      <div class="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 mb-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div class="relative z-10">
          <p class="text-blue-100 font-medium mb-1">Tugas Saya</p>
          <h2 class="text-3xl font-black tracking-tight">{{ tasks.length }} Pending</h2>
          <p class="text-xs text-blue-100 mt-2 bg-white/10 inline-flex px-3 py-1 rounded-full border border-white/10">
             {{ history.length }} Selesai
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <!-- Tasks Tab -->
      <div v-else-if="activeTab === 'tasks'" class="space-y-4">
        <div v-if="tasks.length === 0" class="text-center py-10">
          <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 class="w-10 h-10 text-slate-300" />
          </div>
          <p class="text-slate-500 text-sm">Tidak ada tugas pemeliharaan saat ini.</p>
        </div>

        <div 
          v-for="task in tasks" 
          :key="task.public_id"
          @click="goToDetail(task.public_id)"
          class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div class="flex justify-between items-start mb-3">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <Wrench class="w-5 h-5" />
               </div>
               <div>
                 <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-1 inline-block"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
                 <h3 class="font-bold text-slate-900 leading-tight line-clamp-1">{{ task.title }}</h3>
               </div>
             </div>
             <span class="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
               {{ formatDateSimple(task.reported_at) }}
             </span>
          </div>
          
          <div class="pl-[3.25rem]">
            <div class="flex items-start gap-2 text-slate-500">
               <MapPin class="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
               <p class="text-xs line-clamp-2 leading-relaxed">
                 <span class="font-bold text-slate-700">{{ task.reseller?.name }}</span> • {{ task.reseller?.address }}
               </p>
            </div>
          </div>
        </div>
      </div>

      <!-- History Tab -->
      <div v-else class="space-y-4">
        <div v-if="history.length === 0" class="text-center py-10">
          <Clock class="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p class="text-slate-500 text-sm">Belum ada riwayat pemeliharaan.</p>
        </div>

        <div 
          v-for="item in history" 
          :key="item.public_id"
          @click="goToDetail(item.public_id)"
          class="bg-white/80 rounded-2xl p-5 border border-slate-100"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3" />
              Selesai
            </span>
            <span class="text-xs text-slate-400">{{ formatDate(item.reported_at) }}</span>
          </div>
          
          <h3 class="font-bold text-slate-800 mb-1 opacity-80 mt-2">{{ item.title }}</h3>
          <p class="text-xs text-slate-500">{{ item.reseller?.name }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMaintenanceStore } from '@/stores/maintenance.store';
import { useAuthStore } from '@/stores/auth.store';
import { Wrench, MapPin, Clock, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-vue-next';

const router = useRouter();
const store = useMaintenanceStore();
const auth = useAuthStore();

const activeTab = ref<'tasks' | 'history'>('tasks');

const loading = computed(() => store.loading);
const tasks = computed(() => store.tasks);
const history = computed(() => store.history);

onMounted(() => {
  if (auth.user?.business_public_id) {
    store.fetchAssignments(auth.user.business_public_id);
  }
});

const goToDetail = (id: string) => {
  router.push(`/maintenance/${id}`);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

const formatDateSimple = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    
    if (isToday) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit'});
    }
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short'});
};

const getPriorityClass = (priority: string) => {
  switch(priority) {
    case 'critical': return 'bg-red-100 text-red-600';
    case 'high': return 'bg-orange-100 text-orange-600';
    case 'medium': return 'bg-blue-100 text-blue-600';
    case 'low': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};
</script>
