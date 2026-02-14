<template>
    <div class="min-h-screen bg-slate-50 relative">
        <!-- Header -->
        <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
            <div class="px-6 py-4 flex items-center justify-between">
                <button @click="$router.back()"
                    class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all">
                    <ArrowLeft class="w-6 h-6 text-slate-800" />
                </button>
                <h1 class="text-lg font-bold text-slate-900 tracking-tight">Pasang Baru</h1>
                <div class="w-10"></div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="pt-24 pb-6 px-4">
            <!-- Summary Card -->
            <div
                class="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl shadow-green-500/20 mb-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                <div class="relative z-10">
                    <p class="text-green-100 font-medium mb-1">Total Pendaftar</p>
                    <h2 class="text-3xl font-black tracking-tight">{{ prospects.length }}</h2>
                    <div class="flex gap-2 mt-3 flex-wrap">
                        <span class="text-xs text-white bg-white/20 px-3 py-1 rounded-full border border-white/10">
                            {{ waitingCount }} Menunggu
                        </span>
                        <span class="text-xs text-white bg-white/20 px-3 py-1 rounded-full border border-white/10">
                            {{ approvedCount }} Disetujui
                        </span>
                    </div>
                </div>
            </div>

            <!-- Search/Filter -->
            <div class="mb-6">
                <div class="relative group">
                    <Search
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                    <input type="text" v-model="searchQuery" placeholder="Cari nama atau kode..."
                        class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm" />
                </div>
            </div>

            <!-- Reseller List -->
            <div v-if="loading" class="flex justify-center py-12">
                <Loader2 class="w-8 h-8 animate-spin text-green-600" />
            </div>

            <div v-else-if="filteredProspects.length === 0" class="text-center py-12">
                <div class="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus class="w-10 h-10 text-slate-300" />
                </div>
                <h3 class="font-bold text-slate-900 mb-1">Belum Ada Registrasi</h3>
                <p class="text-slate-500 text-sm">Mulai daftarkan pelanggan baru sekarang.</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="prospect in filteredProspects" :key="prospect.public_id"
                    class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all cursor-pointer active:scale-[0.98]">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">
                                {{ getInitial(prospect.name) }}
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 leading-tight">{{ prospect.name }}</h3>
                                <p class="text-xs text-slate-500 mt-0.5">{{ formatDate(prospect.created_at) }}</p>
                            </div>
                        </div>
                        <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-lg"
                            :class="getStatusClass(prospect.status)">
                            {{ getStatusLabel(prospect.status) }}
                        </span>
                    </div>

                    <div class="space-y-2 border-t border-slate-50 pt-3">
                        <div class="flex items-center gap-2 text-sm text-slate-600">
                            <Phone class="w-4 h-4 text-slate-400" />
                            <span class="font-medium">{{ prospect.phone }}</span>
                        </div>
                        <div v-if="prospect.address" class="flex items-start gap-2 text-sm text-slate-600">
                            <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                            <span class="leading-snug">{{ prospect.address }}</span>
                        </div>
                        <div v-if="prospect.latitude && prospect.longitude"
                            class="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1.5 rounded-lg w-fit mt-1">
                            <MapPin class="w-3.5 h-3.5" />
                            <span>Lokasi Terpin</span>
                        </div>
                        <div v-if="prospect.admin_note" class="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg mt-1">
                            <span class="font-bold">Catatan:</span> {{ prospect.admin_note }}
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- FAB Add -->
        <button @click="openAddModal" class="fixed right-6 bottom-20 w-14 h-14 bg-green-600 text-white rounded-full 
             shadow-lg shadow-green-600/30 flex items-center justify-center 
             active:scale-90 transition-transform z-40 hover:bg-green-700">
            <Plus class="w-7 h-7" />
        </button>

        <!-- Modal Form -->
        <TransitionRoot appear :show="isOpen" as="template">
            <Dialog as="div" @close="closeModal" class="relative z-50">
                <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0"
                    enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100" leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
                            <DialogPanel
                                class="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-xl font-black leading-6 text-slate-900 mb-6">
                                    Registrasi Pelanggan Baru
                                </DialogTitle>

                                <form @submit.prevent="submitForm" class="space-y-5">
                                    <div>
                                        <label
                                            class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Nama
                                            Lengkap <span class="text-red-500">*</span></label>
                                        <input type="text" v-model="form.name" required
                                            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="Nama pelanggan/usaha">
                                    </div>

                                    <div>
                                        <label
                                            class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Nomor
                                            Telepon <span class="text-red-500">*</span></label>
                                        <input type="tel" v-model="form.phone" required
                                            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                            placeholder="08...">
                                    </div>



                                    <div>
                                        <label
                                            class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Outlet
                                            <span class="text-red-500">*</span></label>
                                        <Combobox v-model="selectedOutlet">
                                            <div class="relative">
                                                <div
                                                    class="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left border border-slate-200 focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/10 sm:text-sm transition-all shadow-sm">
                                                    <ComboboxInput
                                                        class="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-slate-900 font-medium focus:ring-0 bg-transparent placeholder:text-slate-400"
                                                        :displayValue="(outlet: any) => outlet?.name"
                                                        @change="outletQuery = $event.target.value"
                                                        placeholder="Cari outlet..." />
                                                    <ComboboxButton
                                                        class="absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronsUpDown class="h-5 w-5 text-gray-400"
                                                            aria-hidden="true" />
                                                    </ComboboxButton>
                                                </div>
                                                <TransitionRoot leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100" leaveTo="opacity-0"
                                                    @after-leave="outletQuery = ''">
                                                    <ComboboxOptions
                                                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                                                        <div v-if="filteredOutletsList.length === 0 && outletQuery !== ''"
                                                            class="relative cursor-default select-none py-2 px-4 text-gray-700">
                                                            Tidak ditemukan.
                                                        </div>

                                                        <ComboboxOption v-for="outlet in filteredOutletsList"
                                                            as="template" :key="outlet.id" :value="outlet"
                                                            v-slot="{ selected, active }">
                                                            <li class="relative cursor-default select-none py-3 pl-10 pr-4"
                                                                :class="{
                                                                    'bg-green-50 text-green-900': active,
                                                                    'text-slate-900': !active,
                                                                }">
                                                                <span class="block truncate"
                                                                    :class="{ 'font-bold': selected, 'font-medium': !selected }">
                                                                    {{ outlet.name }}
                                                                </span>
                                                                <span v-if="selected"
                                                                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                                                    <Check class="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            </li>
                                                        </ComboboxOption>
                                                    </ComboboxOptions>
                                                </TransitionRoot>
                                            </div>
                                        </Combobox>
                                    </div>

                                    <div>
                                        <label
                                            class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Alamat</label>
                                        <textarea v-model="form.address" rows="3"
                                            class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                                            placeholder="Alamat lengkap..."></textarea>
                                    </div>

                                    <!-- Location Capture -->
                                    <div>
                                        <label
                                            class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block">Lokasi
                                            Pemasangan</label>
                                        <div class="flex items-center gap-3">
                                            <div v-if="form.latitude && form.longitude"
                                                class="flex-1 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800 font-medium">
                                                <div class="flex items-center gap-2">
                                                    <MapPin class="w-4 h-4 text-green-600" />
                                                    <span>{{ form.latitude.toFixed(6) }}, {{
                                                        form.longitude.toFixed(6)
                                                        }}</span>
                                                </div>
                                            </div>
                                            <button type="button" @click="getCurrentLocation"
                                                :disabled="gettingLocation"
                                                class="px-5 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm border border-blue-100">
                                                <Loader2 v-if="gettingLocation" class="w-4 h-4 animate-spin" />
                                                <MapPin v-else class="w-4 h-4" />
                                                {{ form.latitude ? 'Update' : 'Ambil Lokasi' }}
                                            </button>
                                        </div>
                                        <p class="text-[10px] uppercase font-bold text-slate-400 mt-1.5 ml-1">Pastikan
                                            berada di lokasi calon pelanggan.</p>
                                    </div>

                                    <div class="pt-4 flex gap-3">
                                        <button type="button" @click="closeModal"
                                            class="flex-1 px-4 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all">
                                            Batal
                                        </button>
                                        <button type="submit" :disabled="submitting"
                                            class="flex-1 px-4 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                                            <Loader2 v-if="submitting" class="w-5 h-5 mr-2 animate-spin" />
                                            {{ submitting ? 'Menyimpan...' : 'Simpan Data' }}
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>

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
                 <Check class="w-10 h-10 text-green-600 relative z-10" stroke-width="4" />
               </div>
               
               <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sukses!</h2>
               <p class="text-slate-500 mb-8 leading-relaxed">
                 Pendaftaran pelanggan baru berhasil disimpan. Data akan segera diproses oleh admin.
               </p>
               
               <button @click="finish" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
                 Tutup
               </button>
            </div>
          </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ArrowLeft, Search, Plus, UserPlus, Phone, MapPin, Loader2, Check, ChevronsUpDown } from 'lucide-vue-next';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild, Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue';
import { useResellerStore } from '@/stores/reseller.store';
import { useRegistrationStore } from '@/stores/registration.store';
import { useOutletStore } from '@/stores/outlet.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'vue-sonner';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const resellerStore = useResellerStore();
const registrationStore = useRegistrationStore();
const outletStore = useOutletStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const isOpen = ref(false);
const showSuccess = ref(false);
const submitting = ref(false);
const gettingLocation = ref(false);
const outletQuery = ref('');
const selectedOutlet = ref<any>(null);


const form = ref<{
    name: string;
    phone: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    outlet_public_id: string | null;
}>({
    name: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    outlet_public_id: null
});

const loading = computed(() => registrationStore.loading);
const prospects = computed(() => registrationStore.registrations);
const outlets = computed(() => outletStore.outlets);

const waitingCount = computed(() => prospects.value.filter(p => p.status === 'waiting').length);
const approvedCount = computed(() => prospects.value.filter(p => p.status === 'approved').length);

const filteredProspects = computed(() => {
    if (!searchQuery.value) return prospects.value;
    const lower = searchQuery.value.toLowerCase();
    return prospects.value.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.phone.toLowerCase().includes(lower)
    );
});

const filteredOutletsList = computed(() => {
    return outletQuery.value === ''
        ? outlets.value
        : outlets.value.filter((outlet) =>
            outlet.name
                .toLowerCase()
                .replace(/\s+/g, '')
                .includes(outletQuery.value.toLowerCase().replace(/\s+/g, ''))
        )
});

// Sync selectedOutlet with form.outlet_public_id
watch(selectedOutlet, (newVal) => {
    form.value.outlet_public_id = newVal?.public_id ?? null;
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
    if (authStore.user?.business_public_id) {
        registrationStore.fetchRegistrations();
        await outletStore.fetchOutlets(authStore.user.business_public_id);
    }
});

const openAddModal = () => {
    // Default to first outlet if available
    const _defaultOutlet = outlets.value.length > 0 ? outlets.value[0] : null;
    selectedOutlet.value = _defaultOutlet;

    form.value = {
        name: '',
        phone: '',
        address: '',
        latitude: null,
        longitude: null,
        outlet_public_id: _defaultOutlet?.public_id ?? null
    };
    isOpen.value = true;
};

const closeModal = () => {
    isOpen.value = false;
};

const getCurrentLocation = () => {
    if (!navigator.geolocation) {
        toast.error('Browser tidak mendukung geolokasi');
        return;
    }

    gettingLocation.value = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            form.value.latitude = position.coords.latitude;
            form.value.longitude = position.coords.longitude;
            toast.success('Lokasi berhasil diambil');
            gettingLocation.value = false;
        },
        (error) => {
            console.error(error);
            toast.error('Gagal mengambil lokasi. Pastikan GPS aktif.');
            gettingLocation.value = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

const submitForm = async () => {
    if (!authStore.user?.business_public_id) return;
    if (!form.value.outlet_public_id) {
        toast.error('Pilih outlet terlebih dahulu');
        return;
    }

    submitting.value = true;
    try {
        await resellerStore.createReseller(authStore.user.business_public_id, form.value);
        // toast.success('Pendaftaran berhasil dikirim! Menunggu persetujuan admin.');
        closeModal();
        showSuccess.value = true;
        // Refresh the prospect list
        await registrationStore.fetchRegistrations();
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal mendaftarkan pelanggan');
    } finally {
        submitting.value = false;
    }
};

const finish = () => {
    showSuccess.value = false;
};
</script>
