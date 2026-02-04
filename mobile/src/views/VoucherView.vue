<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <button @click="$router.back()" class="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft class="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Request Stok Voucher</h1>
      </div>
    </header>

    <!-- Filter Tabs -->
    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3">
      <div class="flex gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="activeTab === tab.value ? 'bg-primary text-primary-foreground' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <main class="px-6 py-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 animate-pulse">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-center">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p class="text-red-600 dark:text-red-400 font-medium">{{ error }}</p>
        <button @click="fetchStockRequests" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="stockRequests.length === 0" class="text-center py-12">
        <Package class="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">Tidak Ada Request</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">Belum ada request stok voucher {{ activeTab }}</p>
      </div>

      <!-- Stock Request List -->
      <div v-else class="space-y-3">
        <div 
          v-for="request in stockRequests" 
          :key="request.id"
          class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="font-bold text-slate-900 dark:text-white mb-1">Request #{{ request.id }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(request.requested_at) }}</p>
            </div>
            <span :class="getStatusBadgeClass(request.status)" class="px-2 py-1 rounded-full text-xs font-semibold">
              {{ getStatusLabel(request.status) }}
            </span>
          </div>

          <!-- Items -->
          <div class="space-y-2 mb-3">
            <div v-for="item in request.items" :key="item.id" class="flex justify-between items-center py-2 border-t border-slate-100 dark:border-slate-700">
              <div class="flex-1">
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ item.voucher_product?.name || 'Produk' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Rp {{ formatCurrency(item.unit_price || 0) }} / pcs</p>
              </div>
              <span class="text-sm font-bold text-slate-900 dark:text-white">{{ item.qty }} pcs</span>
            </div>
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
            <span class="text-lg font-bold text-slate-900 dark:text-white">Rp {{ formatCurrency(request.total_amount || 0) }}</span>
          </div>

          <!-- Rejection Note -->
          <div v-if="request.status === 'rejected' && request.process_note" class="mt-3 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
            <h4 class="text-xs font-bold text-red-800 dark:text-red-300 mb-1">Alasan Penolakan:</h4>
            <p class="text-sm text-red-600 dark:text-red-400">{{ request.process_note }}</p>
          </div>

          <!-- Actions for pending requests -->

        </div>
      </div>
    </main>

    <!-- Floating Action Button -->
    <button 
      @click="showCreateDialog = true"
      class="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center z-20"
    >
      <Plus class="w-6 h-6" />
    </button>

    <!-- Create Stock Request Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white dark:bg-slate-800 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Dialog Header -->
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Request Stok Baru</h2>
          <button @click="closeCreateDialog" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X class="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <!-- Dialog Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Loading Vouchers -->
          <div v-if="loadingVouchers" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Memuat voucher...</p>
          </div>

          <!-- Form -->
          <!-- Form -->
          <div v-else class="space-y-4">
            
            <!-- Vouchers List -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Pilih Produk <span class="text-red-500">*</span>
              </label>
              
              <div v-if="vouchers.length === 0" class="text-center py-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p class="text-sm text-slate-500">Tidak ada data voucher</p>
              </div>

              <div 
                v-for="voucher in vouchers" 
                :key="voucher.public_id"
                class="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                :class="{'ring-2 ring-blue-500/50 border-blue-500': voucher.request_qty > 0}"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <h4 class="font-medium text-slate-900 dark:text-white">{{ voucher.name }}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Harga: Rp {{ formatCurrency(voucher.selling_price) }}
                    </p>
                  </div>
                  <div class="w-24">
                    <input 
                      v-model.number="voucher.request_qty"
                      type="number"
                      min="0"
                      class="w-full px-3 py-1 text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Qty"
                    />
                  </div>
                </div>
                <div v-if="voucher.request_qty > 0" class="text-right border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <span class="text-xs text-slate-500 dark:text-slate-400">Subtotal:</span>
                  <span class="text-sm font-bold text-slate-900 dark:text-white ml-2">
                    Rp {{ formatCurrency(voucher.request_qty * voucher.selling_price) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Total Amount -->
            <div v-if="totalRequestAmount > 0" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-800">
              <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Total Estimasi</span>
              <span class="text-xl font-bold text-blue-900 dark:text-blue-100">
                Rp {{ formatCurrency(totalRequestAmount) }}
              </span>
            </div>

            <!-- Outlet Selection (Optional) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Outlet (Opsional)
              </label>
              <select 
                v-model="formData.selectedOutlet"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option :value="null">-- Pilih Outlet (Opsional) --</option>
                <option v-for="outlet in outlets" :key="outlet.id" :value="outlet">
                  {{ outlet.name }}
                </option>
              </select>
            </div>

            <!-- Request Note (Optional) -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catatan (Opsional)
              </label>
              <textarea 
                v-model="formData.requestNote"
                rows="3"
                placeholder="Tambahkan catatan untuk request ini..."
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Dialog Footer -->
        <div class="px-6 py-4 pb-8 sm:pb-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          <button 
            @click="closeCreateDialog"
            class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Batal
          </button>
          <button 
            @click="submitRequest"
            :disabled="!canSubmit || isSubmitting"
            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? 'Mengirim...' : 'Kirim Request' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Feedback Dialog -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="feedback.show" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-6" @click.self="closeFeedback">
        <div 
          class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl transform transition-all"
          :class="{ 'scale-100 opacity-100': feedback.show, 'scale-95 opacity-0': !feedback.show }"
        >
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            :class="{
              'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': feedback.type === 'success',
              'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': feedback.type === 'error',
              'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': feedback.type === 'warning'
            }"
          >
            <component :is="feedbackIcon" class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ feedback.title }}</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6">{{ feedback.message }}</p>
          
          <button @click="closeFeedback" class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ArrowLeft, AlertCircle, Package, Plus, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth.store';
import { useStockStore } from '@/stores/stock.store';
import axios from '@/lib/axios';

const auth = useAuthStore();
const stockStore = useStockStore();

const activeTab = ref('pending');

const tabs = [
  { label: 'Pending', value: 'pending' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
];

const businessPublicId = computed(() => {
  // Get business public_id from user data
  return auth.user?.business?.public_id || auth.user?.public_id;
});

const stockRequests = computed(() => {
  return stockStore.requests.filter(req => req.status === activeTab.value);
});
const isLoading = computed(() => stockStore.loading);
const error = computed(() => stockStore.error);

// Feedback State
const feedback = ref({
  show: false,
  type: 'success' as 'success' | 'error' | 'warning',
  title: '',
  message: '',
});

const feedbackIcon = computed(() => {
  switch (feedback.value.type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertTriangle;
    default: return CheckCircle;
  }
});

const showFeedback = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
  feedback.value = { show: true, type, title, message };
};

const closeFeedback = () => {
  feedback.value.show = false;
};

// Dialog state
const showCreateDialog = ref(false);
const loadingVouchers = ref(false);
const isSubmitting = ref(false);
const vouchers = ref<any[]>([]);
const outlets = ref<any[]>([]);

// Form data
const formData = ref({
  selectedOutlet: null as any,
  requestNote: '',
});

const canSubmit = computed(() => {
  return vouchers.value.some(v => v.request_qty > 0);
});

const fetchStockRequests = async () => {
  if (!businessPublicId.value) {
    return;
  }

  try {
    // Fetch all requests (no status filter)
    await stockStore.fetchRequests(businessPublicId.value);
  } catch (err) {
    // Error is already handled by the store
  }
};

const fetchVouchers = async () => {
  if (!businessPublicId.value) return;

  loadingVouchers.value = true;
  try {
    // Fetch both vouchers and outlets concurrently
    const [vouchersResponse, outletsResponse] = await Promise.all([
      axios.get(`/businesses/${businessPublicId.value}/vouchers`),
      axios.get(`/businesses/${businessPublicId.value}/outlets`)
    ]);
    
      if (vouchersResponse.data.success) {
      // Map vouchers to include reactive request_qty
      vouchers.value = vouchersResponse.data.data.map((v: any) => ({
        ...v,
        request_qty: 0
      }));
    }
    
    if (outletsResponse.data.success) {
      outlets.value = outletsResponse.data.data;
    }
  } catch (err: any) {
    showFeedback('error', 'Gagal', err.response?.data?.message || 'Gagal memuat data');
  } finally {
    loadingVouchers.value = false;
  }
};

const totalRequestAmount = computed(() => {
  return vouchers.value.reduce((total, v) => {
    return total + (v.request_qty * v.selling_price);
  }, 0);
});

const closeCreateDialog = () => {
  showCreateDialog.value = false;
  // Reset form
  formData.value = {
    selectedOutlet: null,
    requestNote: '',
  };
  // Reset voucher quantities
  vouchers.value.forEach(v => v.request_qty = 0);
};

const submitRequest = async () => {
  // Filter vouchers with qty > 0
  const selectedItems = vouchers.value.filter(v => v.request_qty > 0);

  if (selectedItems.length === 0) {
    showFeedback('warning', 'Perhatian', 'Pilih minimal 1 voucher dengan mengisi jumlah (Qty)');
    return;
  }

  isSubmitting.value = true;
  try {
    const requestData: any = {
      items: selectedItems.map(item => ({
        voucher_product_id: item.public_id,
        qty: item.request_qty,
        unit_price: item.selling_price,
      })),
      request_note: formData.value.requestNote || undefined,
    };

    // Add outlet_id if selected
    if (formData.value.selectedOutlet) {
      requestData.outlet_id = formData.value.selectedOutlet.public_id;
    }

    await stockStore.createRequest(businessPublicId.value, requestData);
    closeCreateDialog();
    showFeedback('success', 'Berhasil', 'Request stok voucher berhasil dibuat!');
    
    // Refresh the list
    fetchStockRequests();
  } catch (err: any) {
    showFeedback('error', 'Gagal', err.response?.data?.message || 'Gagal membuat request');
  } finally {
    isSubmitting.value = false;
  }
};



const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return classes[status] || 'bg-slate-100 text-slate-700';
};

// Watch for dialog open to fetch vouchers
watch(showCreateDialog, (newValue) => {
  if (newValue) {
    fetchVouchers();
  }
});

// Remove watcher for activeTab to prevent re-fetching
/*
watch(activeTab, () => {
  fetchStockRequests();
});
*/

onMounted(() => {
  fetchStockRequests();
});
</script>
