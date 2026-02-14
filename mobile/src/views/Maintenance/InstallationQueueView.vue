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
                                {{ getInitial(issue.name || 'Unknown') }}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 leading-tight">{{ issue.name ||
                                    'Pelanggan Umum' }}</h3>
                                <p class="text-xs text-slate-500">{{ formatDate(issue.created_at) }}</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span :class="getStatusColor(issue.status)"
                                class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                {{ formatStatus(issue) }}
                            </span>
                            <!-- Show readiness count for approved prospects -->
                            <span v-if="issue.status === 'approved' && (issue.readiness_confirmations?.length || 0) > 0"
                                class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600">
                                {{ issue.readiness_confirmations?.length }} teknisi siap
                            </span>
                        </div>
                    </div>

                    <div class="space-y-2 border-t border-slate-50 pt-3">
                        <div class="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                            <span class="leading-snug">{{ issue.address || 'Alamat tidak tersedia' }}</span>
                        </div>
                        <div class="flex items-center gap-2 text-sm text-slate-600">
                            <Phone class="w-4 h-4 text-slate-400" />
                            <span class="font-medium">{{ issue.phone || '-' }}</span>
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

        <!-- Installation Action Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
            <div class="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div class="p-6">
                    <div class="mb-4 flex items-center justify-between">
                        <h3 class="text-lg font-bold text-slate-900">Proses Instalasi</h3>
                        <button @click="closeModal" class="p-1 rounded-full hover:bg-slate-100">
                            <X class="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <div v-if="selectedProspect" class="space-y-4">
                        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                            <h4 class="font-bold text-slate-800">{{ selectedProspect.name }}</h4>
                            <div v-if="selectedProspect.phone" class="flex items-center gap-2 text-sm text-slate-600">
                                <Phone class="w-4 h-4 text-slate-400 shrink-0" />
                                <a :href="'tel:' + selectedProspect.phone" class="hover:text-indigo-600">{{ selectedProspect.phone }}</a>
                            </div>
                            <div v-if="selectedProspect.address" class="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin class="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                <span class="leading-snug">{{ selectedProspect.address }}</span>
                            </div>
                            <a v-if="selectedProspect.latitude && selectedProspect.longitude"
                                :href="`https://www.google.com/maps/search/?api=1&query=${selectedProspect.latitude},${selectedProspect.longitude}`"
                                target="_blank"
                                class="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                                <Navigation class="w-4 h-4 shrink-0" />
                                Buka di Google Maps
                            </a>
                            <p class="text-xs text-slate-400 pt-1 border-t border-slate-200">
                                Tiket: {{ selectedProspect.maintenance_issue?.title || 'Belum ada tiket' }}
                            </p>
                        </div>

                        <div class="grid gap-3">
                            <!-- Case 1: No technician assigned yet → Show Confirm Readiness -->
                            <template v-if="!selectedProspect.assigned_technician_id && selectedProspect.status === 'approved'">
                                <!-- Already confirmed by current user -->
                                <div v-if="hasCurrentUserConfirmed"
                                    class="w-full py-3.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-indigo-100">
                                    <UserCheck class="w-5 h-5" />
                                    Sudah Dikonfirmasi — Menunggu Admin
                                </div>
                                <!-- Not yet confirmed -->
                                <button
                                    v-else
                                    @click="handleConfirmReadiness"
                                    :disabled="confirming"
                                    class="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Loader2 v-if="confirming" class="w-5 h-5 animate-spin" />
                                    <Hand v-else class="w-5 h-5" />
                                    {{ confirming ? 'Mengkonfirmasi...' : 'Konfirmasi Kesiapan' }}
                                </button>

                                <!-- Show how many have confirmed -->
                                <p v-if="(selectedProspect.readiness_confirmations?.length || 0) > 0"
                                    class="text-center text-xs text-slate-500">
                                    {{ selectedProspect.readiness_confirmations?.length }} teknisi sudah konfirmasi kesiapan
                                </p>
                            </template>

                            <!-- Case 2: Assigned to current user → Show Open Ticket -->
                            <template v-else-if="selectedProspect.assigned_technician_id && selectedProspect.assigned_technician_id === currentUserId">
                                <button 
                                    v-if="selectedProspect.maintenance_issue?.public_id"
                                    @click="navigateToInstallation"
                                    class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Wrench class="w-5 h-5" />
                                    Buka Tiket Instalasi
                                </button>
                                <p class="text-center text-xs text-green-600 font-semibold">
                                    ✓ Anda ditugaskan untuk pekerjaan ini
                                </p>
                            </template>

                            <!-- Case 3: Assigned to another technician -->
                            <template v-else-if="selectedProspect.assigned_technician_id && selectedProspect.assigned_technician_id !== currentUserId">
                                <div class="w-full py-3.5 bg-slate-50 text-slate-500 rounded-xl font-semibold text-center border border-slate-200">
                                    Teknisi lain telah ditugaskan
                                </div>
                                <p class="text-center text-xs text-slate-500">
                                    <Wrench class="w-4 h-4 inline mr-1" />
                                    {{ selectedProspect.assigned_technician?.name || 'Teknisi' }}
                                </p>
                            </template>

                            <!-- Case 4: Other statuses (installed, activated, etc) - show ticket if available -->
                            <template v-else-if="['installed', 'activated'].includes(selectedProspect.status)">
                                <button 
                                    v-if="selectedProspect.maintenance_issue?.public_id"
                                    @click="navigateToInstallation"
                                    class="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Wrench class="w-5 h-5" />
                                    Lihat Tiket Instalasi
                                </button>
                            </template>
                            
                            <button 
                                @click="closeModal"
                                class="w-full py-3.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold active:scale-95 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Overlay -->
        <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div v-if="showSuccess" class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
                <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
                    <!-- Confetti-like decoration -->
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
                    <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

                    <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div class="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                        <CheckCircle2 class="w-10 h-10 text-green-600 relative z-10" stroke-width="4" />
                    </div>
                    
                    <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sukses!</h2>
                    <p class="text-slate-500 mb-8 leading-relaxed">
                        Konfirmasi kesiapan berhasil dikirim. Menunggu persetujuan admin untuk penjadwalan.
                    </p>
                    
                    <button @click="closeSuccess" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
                        Kembali ke Antrian
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useRegistrationStore, type Prospect } from '@/stores/registration.store';
import { useAuthStore } from '@/stores/auth.store';
import {
    ChevronLeft, Search, Loader2, CheckCircle2, MapPin, Phone, X, Wrench, Hand, UserCheck, Navigation
} from 'lucide-vue-next';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';

const router = useRouter();
const registrationStore = useRegistrationStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const showModal = ref(false);
const selectedProspect = ref<Prospect | null>(null);
const confirming = ref(false);


const currentUserId = computed(() => {
    const user = toRaw(authStore.user);
    return user?.id || null;
});

const loading = computed(() => registrationStore.loading);
const installations = computed(() => registrationStore.queue);

const pendingInstallations = computed(() =>
    installations.value.filter(i => i.status === 'approved' && !i.assigned_technician_id)
);

const filteredInstallations = computed(() => {
    let data = installations.value.filter(i => ['approved', 'installed', 'activated', 'installation_rejected'].includes(i.status));

    if (!searchQuery.value) return data;
    const q = searchQuery.value.toLowerCase();
    return data.filter(i =>
        (i.name || '').toLowerCase().includes(q) ||
        (i.address || '').toLowerCase().includes(q)
    );
});

const hasCurrentUserConfirmed = computed(() => {
    if (!selectedProspect.value || !currentUserId.value) return false;
    return (selectedProspect.value.readiness_confirmations || []).some(
        r => r.user_id === currentUserId.value
    );
});

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id });
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return 'bg-orange-50 text-orange-600';
        case 'installed': return 'bg-green-50 text-green-600';
        case 'activated': return 'bg-blue-50 text-blue-600';
        case 'installation_rejected': return 'bg-red-50 text-red-600';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const formatStatus = (prospect: Prospect) => {
    if (prospect.status === 'approved') {
        if (prospect.assigned_technician_id) return 'Ditugaskan';
        return 'Siap Pasang';
    }
    switch (prospect.status) {
        case 'installed': return 'Terpasang';
        case 'activated': return 'Aktif';
        case 'installation_rejected': return 'Batal Pasang';
        default: return prospect.status;
    }
};

const openDetail = (prospect: Prospect) => {
    selectedProspect.value = prospect;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedProspect.value = null;
};

const navigateToInstallation = () => {
    if (selectedProspect.value?.maintenance_issue?.public_id) {
        router.push({ 
            name: 'maintenance-detail', 
            params: { id: selectedProspect.value.maintenance_issue.public_id } 
        });
        closeModal();
    }
};

const showSuccess = ref(false);

const handleConfirmReadiness = async () => {
    if (!selectedProspect.value || !authStore.user?.business_public_id) return;
    confirming.value = true;
    try {
        await registrationStore.confirmReadiness(
            authStore.user.business_public_id,
            selectedProspect.value.public_id
        );
        // Refresh the selected prospect from the updated queue
        const updated = registrationStore.queue.find(p => p.public_id === selectedProspect.value?.public_id);
        if (updated) {
            selectedProspect.value = updated;
        }
        showModal.value = false;
        showSuccess.value = true;
    } catch (err: any) {
        console.error('Failed to confirm readiness:', err);
        alert(err?.response?.data?.message || 'Gagal mengkonfirmasi kesiapan');
    } finally {
        confirming.value = false;
    }
};

const closeSuccess = () => {
    showSuccess.value = false;
    selectedProspect.value = null;
};

onMounted(async () => {
    if (authStore.user?.business_public_id) {
        await registrationStore.fetchQueue(authStore.user.business_public_id);
    }
});
</script>

