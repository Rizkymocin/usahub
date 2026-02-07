<template>
    <div class="min-h-screen bg-slate-50 relative">
        <!-- Header -->
        <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
            <div class="px-6 py-4 flex items-center justify-between">
                <button @click="router.back()"
                    class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all">
                    <ChevronLeft class="w-6 h-6 text-slate-800" />
                </button>
                <h1 class="text-lg font-bold text-slate-900 tracking-tight">Antrian Pasang</h1>
                <div class="w-10"></div>
            </div>
        </header>

        <main class="pt-24 pb-6 px-4">
            <!-- Summary Card -->
            <div
                class="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 mb-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div class="relative z-10">
                    <p class="text-orange-100 font-medium mb-1">Total Antrian</p>
                    <h2 class="text-3xl font-black tracking-tight">{{ installations.length }}</h2>
                    <p
                        class="text-xs text-orange-200 mt-2 bg-white/10 inline-flex px-3 py-1 rounded-full border border-white/10">
                        {{ pendingInstallations.length }} Menunggu Teknisi
                    </p>
                </div>
            </div>

            <!-- Search -->
            <div class="mb-6">
                <div class="relative group">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input v-model="searchQuery" type="text" placeholder="Cari pelanggan..."
                        class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm" />
                </div>
            </div>

            <!-- Installation List -->
            <div v-if="loading" class="flex justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-orange-600" />
            </div>

            <div v-else-if="filteredInstallations.length > 0" class="space-y-4">
                <div v-for="issue in filteredInstallations" :key="issue.id" @click="openDetail(issue)"
                    class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer active:scale-[0.98]">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                                {{ getInitial(issue.reseller?.name || 'Unknown') }}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 leading-tight">{{ issue.reseller?.name ||
                                    'Pelanggan Umum' }}</h3>
                                <p class="text-xs text-slate-500">{{ formatDate(issue.reported_at) }}</p>
                            </div>
                        </div>
                        <span :class="getStatusColor(issue.status)"
                            class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                            {{ formatStatus(issue.status) }}
                        </span>
                    </div>

                    <div class="space-y-2 border-t border-slate-50 pt-3">
                        <div class="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                            <span class="leading-snug">{{ issue.reseller?.address || 'Alamat tidak tersedia' }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-slate-600">
                            <Phone class="w-4 h-4 text-slate-400" />
                            <span class="font-medium">{{ issue.reseller?.phone || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-12">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 class="w-10 h-10 text-slate-300" />
                </div>
                <h3 class="font-bold text-slate-900">Tidak ada antrian</h3>
                <p class="text-slate-500 text-sm mt-1">Semua pemasangan telah selesai.</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMaintenanceStore, type MaintenanceIssue } from '@/stores/maintenance.store';
import { useAuthStore } from '@/stores/auth.store';
import {
    ChevronLeft, Search, Loader2, CheckCircle2, MapPin, Phone
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const router = useRouter();
const maintenanceStore = useMaintenanceStore();
const authStore = useAuthStore();

const searchQuery = ref('');

const loading = computed(() => maintenanceStore.loading);
const installations = computed(() => maintenanceStore.installations);

const pendingInstallations = computed(() =>
    installations.value.filter(i => i.status === 'pending')
);

const filteredInstallations = computed(() => {
    if (!searchQuery.value) return installations.value;
    const q = searchQuery.value.toLowerCase();
    return installations.value.filter(i =>
        (i.reseller?.name || '').toLowerCase().includes(q) ||
        (i.reseller?.address || '').toLowerCase().includes(q)
    );
});

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id });
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-orange-50 text-orange-600';
        case 'assigned': return 'bg-blue-50 text-blue-600';
        case 'in_progress': return 'bg-yellow-50 text-yellow-600';
        case 'resolved': return 'bg-green-50 text-green-600';
        case 'closed': return 'bg-slate-100 text-slate-600';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const formatStatus = (status: string) => {
    switch (status) {
        case 'pending': return 'Menunggu';
        case 'assigned': return 'Ditugaskan';
        case 'in_progress': return 'Proses';
        case 'resolved': return 'Selesai';
        case 'closed': return 'Ditutup';
        default: return status;
    }
};

const openDetail = (issue: MaintenanceIssue) => {
    router.push({ name: 'maintenance-detail', params: { id: issue.public_id } });
};

onMounted(async () => {
    if (authStore.user?.business_public_id) {
        await maintenanceStore.fetchInstallations(authStore.user.business_public_id);
    }
});
</script>
