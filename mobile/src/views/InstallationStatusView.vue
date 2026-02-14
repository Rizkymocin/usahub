<template>
    <div class="min-h-screen bg-slate-50 relative">
        <!-- Header -->
        <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
            <div class="px-6 py-4 flex items-center justify-between">
                <button @click="router.back()"
                    class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all">
                    <ChevronLeft class="w-6 h-6 text-slate-800" />
                </button>
                <h1 class="text-lg font-bold text-slate-900 tracking-tight">Status Pemasangan</h1>
                <div class="w-10"></div>
            </div>
        </header>

        <main class="pt-24 pb-6 px-4">
            <!-- Summary Card -->
            <div
                class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20 mb-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div class="relative z-10">
                    <p class="text-emerald-100 font-medium mb-1">Total Pendaftaran</p>
                    <h2 class="text-3xl font-black tracking-tight">{{ registrations.length }} Calon</h2>
                    <div class="flex gap-2 mt-3 flex-wrap">
                        <span class="text-xs text-emerald-800 bg-white/90 font-bold px-3 py-1 rounded-full shadow-sm">
                            {{ installedCount }} Terpasang
                        </span>
                        <span class="text-xs text-white bg-white/20 px-3 py-1 rounded-full border border-white/20">
                            {{ approvedCount }} Dalam Proses
                        </span>
                        <span class="text-xs text-white bg-white/20 px-3 py-1 rounded-full border border-white/20">
                            {{ waitingCount }} Menunggu
                        </span>
                    </div>
                </div>
            </div>

            <!-- Search -->
            <div class="mb-6">
                <div class="relative group">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input v-model="searchQuery" type="text" placeholder="Cari nama pelanggan..."
                        class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm" />
                </div>
            </div>

            <!-- Registration List -->
            <div v-if="loading" class="flex justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-emerald-600" />
            </div>

            <div v-else-if="filteredRegistrations.length > 0" class="space-y-4">
                <div v-for="reg in filteredRegistrations" :key="reg.public_id"
                    class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                {{ getInitial(reg.name) }}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 leading-tight">{{ reg.name }}</h3>
                                <p class="text-xs text-slate-500">{{ formatDate(reg.created_at) }}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide"
                            :class="getStatusClass(reg.status)">
                            {{ getStatusLabel(reg.status) }}
                        </span>
                    </div>

                    <div class="space-y-2 border-t border-slate-50 pt-3">
                        <div class="flex items-center gap-2 text-sm text-slate-600">
                            <Phone class="w-4 h-4 text-slate-400" />
                            <span class="font-medium">{{ reg.phone }}</span>
                        </div>
                        <div v-if="reg.address" class="flex items-start gap-1.5 text-slate-500">
                            <MapPin class="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p class="text-xs font-medium leading-snug">{{ reg.address }}</p>
                        </div>
                        <div v-if="reg.admin_note" class="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                            <span class="font-bold">Admin:</span> {{ reg.admin_note }}
                        </div>
                        <div v-if="reg.technician_note" class="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                            <span class="font-bold">Teknisi:</span> {{ reg.technician_note }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-12">
                <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList class="w-10 h-10 text-slate-300" />
                </div>
                <h3 class="font-bold text-slate-900">Belum ada pemasangan</h3>
                <p class="text-slate-500 text-sm mt-1">Daftarkan pelanggan baru untuk memulai.</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRegistrationStore } from '@/stores/registration.store';
import {
    ChevronLeft, Search, Loader2, ClipboardList, MapPin, Phone
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const router = useRouter();
const registrationStore = useRegistrationStore();

const searchQuery = ref('');

const registrations = computed(() => registrationStore.registrations);
const loading = computed(() => registrationStore.loading);

const waitingCount = computed(() => registrations.value.filter(r => r.status === 'waiting').length);
const approvedCount = computed(() => registrations.value.filter(r => r.status === 'approved').length);
const installedCount = computed(() => registrations.value.filter(r => r.status === 'installed' || r.status === 'activated').length);

const filteredRegistrations = computed(() => {
    if (!searchQuery.value) return registrations.value;
    const q = searchQuery.value.toLowerCase();
    return registrations.value.filter(r =>
        r.name.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q)
    );
});

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: idLocale });
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        waiting: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        installed: 'Terpasang',
        installation_rejected: 'Instalasi Ditolak',
        activated: 'Aktif',
    };
    return labels[status] || status;
};

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        waiting: 'bg-yellow-50 text-yellow-600',
        approved: 'bg-blue-50 text-blue-600',
        rejected: 'bg-red-50 text-red-600',
        installed: 'bg-green-50 text-green-600',
        installation_rejected: 'bg-orange-50 text-orange-600',
        activated: 'bg-emerald-50 text-emerald-600',
    };
    return classes[status] || 'bg-slate-50 text-slate-600';
};

onMounted(async () => {
    await registrationStore.fetchRegistrations();
});
</script>
