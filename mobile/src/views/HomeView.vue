<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- Header Section -->
    <!-- Header Section -->
    <header class="relative pt-12 pb-24 px-6 z-10 text-primary-foreground">
      <!-- Background & Shapes -->
      <div class="absolute inset-0 bg-gradient-to-r from-primary to-sky-400 rounded-b-[2.5rem] overflow-hidden -z-10">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
      </div>
      
      <div class="relative z-10 flex justify-between items-center mb-6">
        <div>
          <p class="text-primary-foreground/80 text-sm font-medium">Selamat Datang,</p>
          <h1 class="text-2xl font-bold">{{ user?.name || 'Mitra UsaHub' }}</h1>
        </div>
        <button class="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors relative">
          <Bell class="w-6 h-6 text-primary-foreground" />
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
        </button>
      </div>

      <!-- Finance Stock Summary (Floating) -->
      <div v-if="isFinance" class="absolute left-6 right-6 -bottom-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 border border-slate-100 flex flex-col justify-between min-h-[140px]">
        
        <!-- Main: Available Stock -->
        <div class="flex justify-between items-start">
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Voucher Tersedia</p>
            <div v-if="stockStore.loading" class="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
            <h2 v-else class="text-3xl font-bold text-slate-900 leading-none">{{ totalAvailable }} <span class="text-sm font-medium text-slate-500">Pcs</span></h2>
          </div>
          <div class="bg-orange-50 p-2.5 rounded-xl">
            
            <TicketIcon class="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <!-- Sub Stats: Allocation & Sold -->
        <div class="grid grid-cols-2 gap-3 mt-3">
           <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <p class="text-[10px] text-slate-500 font-medium mb-0.5">Total Alokasi</p>
              <p v-if="stockStore.loading" class="h-4 w-12 bg-slate-200 rounded animate-pulse"></p>
              <p v-else class="text-sm font-bold text-slate-700">{{ totalAllocated }}</p>
           </div>
           
           <div class="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <p class="text-[10px] text-slate-500 font-medium mb-0.5">Total Terjual</p>
              <p v-if="stockStore.loading" class="h-4 w-12 bg-slate-200 rounded animate-pulse"></p>
              <p v-else class="text-sm font-bold text-green-600">{{ totalSold }}</p>
           </div>
        </div>

      </div>

      <!-- Balance Card (Floating) for Non-Finance -->
      <div v-else class="absolute left-6 right-6 -bottom-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 flex flex-col gap-4 border border-slate-100">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-slate-500 text-xs font-semibold uppercase tracking-wider">Saldo Deposit</p>
            <h2 class="text-2xl font-bold text-slate-900 mt-1">Rp {{ formatCurrency(0) }}</h2>
          </div>
          <div class="bg-blue-50 p-2 rounded-lg">
            <Wallet class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="h-px bg-slate-100"></div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-slate-500">Poin Member</span>
          <span class="font-semibold text-slate-900 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs">0 Poin</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mt-20 px-6 space-y-8">
      
      <!-- Quick Actions -->
      <section>
        <h3 class="font-bold text-slate-900 mb-4 text-lg">Menu Utama</h3>
        <div class="grid grid-cols-3 gap-4">
          <button v-for="menu in menus" :key="menu.label" @click="handleMenuClick(menu)" class="flex flex-col items-center gap-2 group">
            <div :class="`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-all group-active:scale-95 ${menu.bgClass}`">
              <component :is="menu.icon" :class="`w-6 h-6 ${menu.textClass}`" />
            </div>
            <span class="text-xs font-medium text-slate-600 text-center leading-tight">{{ menu.label }}</span>
          </button>
        </div>
      </section>

      <!-- Pengumuman dari Admin -->
      <section>
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-slate-900 text-lg">Pengumuman</h3>
          <button class="text-xs text-primary font-medium">Lihat Semua</button>
        </div>
        
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div class="relative z-10 flex gap-3">
            <div class="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Bell class="w-5 h-5 text-white" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-bold text-slate-900">Maintenance Server Terjadwal</h4>
                <span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Penting</span>
              </div>
              <p class="text-sm text-slate-700 leading-relaxed mb-2">
                Server akan menjalani maintenance pada <strong>Sabtu, 8 Februari 2026</strong> pukul 01:00 - 05:00 WIB. Mohon maaf atas ketidaknyamanannya.
              </p>
              <p class="text-xs text-slate-500">Diposting 2 hari yang lalu oleh Admin</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-slate-900 text-lg">Aktivitas Terbaru</h3>
          <router-link to="/activity" class="text-sm text-primary font-medium hover:underline">Lihat Semua</router-link>
        </div>
        
        <div class="space-y-3">
          <!-- Skeleton Item (Dummy for now) -->
          <div v-for="i in 3" :key="i" class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Clock class="w-5 h-5 text-slate-400" />
            </div>
            <div class="flex-1">
              <h5 class="font-medium text-slate-900 text-sm">Topup Saldo</h5>
              <p class="text-xs text-slate-500 mt-0.5">24 Jan 2026</p>
            </div>
            <span class="font-bold text-sm text-green-600">+Rp 50.000</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useStockStore } from '@/stores/stock.store';
import { useRouter } from 'vue-router';
import { 
  Bell, Wallet, Ticket, Clock, 
  FileText, Wrench, UserPlus, ClipboardList, 
  AlertCircle, Settings, CheckCircle, 
  TicketIcon
} from 'lucide-vue-next';

const auth = useAuthStore();
const stockStore = useStockStore();
const router = useRouter();
const user = computed(() => auth.user);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

// Get user roles
const userRoles = computed(() => {
  if (!user.value?.roles || !Array.isArray(user.value.roles)) return [];
  return user.value.roles.map((r: any) => r.name || r);
});

const isFinance = computed(() => userRoles.value.includes('finance'));

const totalAllocated = computed(() => {
  return stockStore.myStock.reduce((acc, item) => acc + Number(item.total_allocated), 0);
});

const totalSold = computed(() => {
  return stockStore.myStock.reduce((acc, item) => acc + Number(item.total_sold), 0);
});

const totalAvailable = computed(() => {
  return totalAllocated.value - totalSold.value;
});

watchEffect(async () => {
  if (isFinance.value && user.value?.business_public_id) {
    try {
      await stockStore.fetchMyStock(user.value.business_public_id);
    } catch (error) {
      console.error('HomeView: Failed to fetch stock summary:', error);
    }
  }
});

// Role-based menu configuration
const roleMenus: Record<string, Array<{ label: string; icon: any; bgClass: string; textClass: string; route?: string }>> = {
  finance: [
    { label: 'Voucher', icon: Ticket, bgClass: 'bg-orange-50', textClass: 'text-orange-600', route: '/voucher' },
    { label: 'Penjualan', icon: FileText, bgClass: 'bg-green-50', textClass: 'text-green-600', route: '/sales' },
    { label: 'Penagihan', icon: ClipboardList, bgClass: 'bg-blue-50', textClass: 'text-blue-600', route: '/debt-collection' },
  ],
  teknisi_maintenance: [
    { label: 'Pemeliharaan', icon: Wrench, bgClass: 'bg-purple-50', textClass: 'text-purple-600', route: '/maintenance' },
  ],
  teknisi_pasang_baru: [
    { label: 'Calon Pelanggan', icon: UserPlus, bgClass: 'bg-cyan-50', textClass: 'text-cyan-600', route: '/prospects' },
    { label: 'Pemasangan', icon: Settings, bgClass: 'bg-indigo-50', textClass: 'text-indigo-600', route: '/installation' },
  ],
  sales: [
    { label: 'Pendaftaran', icon: UserPlus, bgClass: 'bg-green-50', textClass: 'text-green-600', route: '/registration' },
    { label: 'Status Pemasangan', icon: CheckCircle, bgClass: 'bg-blue-50', textClass: 'text-blue-600', route: '/installation-status' },
  ],
};

// Compute menu based on user roles
const menus = computed(() => {
  const allMenus: Array<{ label: string; icon: any; bgClass: string; textClass: string; route?: string }> = [];
  const seen = new Set<string>();

  userRoles.value.forEach((role: string) => {
    const roleMenu = roleMenus[role];
    if (roleMenu) {
      roleMenu.forEach(menu => {
        if (!seen.has(menu.label)) {
          allMenus.push(menu);
          seen.add(menu.label);
        }
      });
    }
  });

  // Default menu if no role-specific menu found
  if (allMenus.length === 0) {
    return [
      { label: 'Dashboard', icon: Wallet, bgClass: 'bg-slate-50', textClass: 'text-slate-600' },
    ];
  }

  return allMenus;
});

const handleMenuClick = (menu: any) => {
  if (menu.route) {
    router.push(menu.route);
  }
};
</script>
