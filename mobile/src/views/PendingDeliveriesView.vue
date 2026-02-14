<template>
  <div class="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
    <!-- Decorative Background -->
    <div
      class="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/50 to-transparent pointer-events-none z-0">
    </div>
    <div class="fixed -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

    <!-- Header -->
    <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <button @click="router.back()"
            class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all">
            <ChevronLeft class="w-6 h-6 text-slate-800" />
          </button>
          <div class="text-center">
            <h1 class="text-base font-bold text-slate-900">Pending Pengiriman</h1>
            <span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {{ saleStore.pendingDeliveries.length }} Reserved
            </span>
          </div>
          <div class="w-10"></div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-24 px-6 relative z-10 max-w-lg mx-auto">
      <div v-if="loading" class="flex justify-center py-20">
        <Loader2 class="w-8 h-8 animate-spin text-amber-600" />
      </div>

      <div v-else-if="saleStore.pendingDeliveries.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Package class="w-10 h-10 text-slate-300" />
        </div>
        <h4 class="font-bold text-slate-900 text-lg">Tidak Ada Pengiriman</h4>
        <p class="text-slate-500 text-sm mt-2 px-10 leading-relaxed">Semua penjualan reserved sudah dikirim.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="sale in saleStore.pendingDeliveries" :key="sale.public_id"
          class="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div class="p-5">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <User class="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 line-clamp-1">{{ getRecipientName(sale) }}</h3>
                  <p class="text-xs text-slate-500">{{ formatDate(sale.sold_at) }}</p>
                </div>
              </div>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                Reserved
              </span>
            </div>

            <!-- Items Summary -->
            <div class="bg-slate-50 rounded-2xl p-4 mb-4 space-y-2">
              <div v-for="item in sale.items" :key="item.id" class="flex justify-between text-sm">
                <span class="text-slate-600">
                  <span class="font-bold text-slate-800">{{ item.quantity }}x</span> {{ item.voucher_product?.name }}
                </span>
                <span class="font-bold text-slate-900">Rp {{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>

            <!-- Totals -->
            <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <div>
                <p class="text-xs text-slate-500">Total</p>
                <p class="font-black text-lg text-slate-900">Rp {{ formatCurrency(sale.total_amount) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-500">Dibayar</p>
                <p class="font-bold text-green-600">Rp {{ formatCurrency(sale.paid_amount) }}</p>
              </div>
            </div>

            <!-- Action Button -->
            <button @click="openDeliveryDialog(sale)"
              class="w-full py-3 rounded-2xl bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Truck class="w-4 h-4" />
              <span>Tandai Terkirim</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Delivery Dialog -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showDeliveryDialog"
        class="fixed inset-0 bottom-10 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
        <div
          class="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
          <div
            class="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 rounded-t-[2rem] z-10">
            <div class="flex items-center justify-between">
              <h3 class="font-black text-lg text-slate-900">Konfirmasi Pengiriman</h3>
              <button @click="showDeliveryDialog = false" class="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X class="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p class="text-xs text-slate-500 mt-1">Sesuaikan jumlah yang dikirim</p>
          </div>

          <div class="p-6 space-y-4">
            <!-- Items -->
            <div v-for="(item, idx) in deliveryItems" :key="idx" class="bg-slate-50 rounded-2xl p-4">
              <div class="flex items-start justify-between gap-4 mb-3">
                <div class="flex-1">
                  <p class="font-bold text-sm text-slate-900 line-clamp-1">{{ item.product_name }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">Reserved: {{ item.max_qty }} pcs</p>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="flex items-center justify-between p-1 bg-white rounded-xl border border-slate-200">
                <button @click="decrementDelivery(idx)"
                  class="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 active:scale-90 transition-transform"
                  :disabled="item.delivered_qty <= 0">
                  <Minus class="w-4 h-4" />
                </button>
                <div class="text-center">
                  <input type="number"
                    class="w-16 text-center text-sm font-bold text-slate-900 bg-transparent outline-none"
                    :value="item.delivered_qty"
                    @input="(e) => updateDeliveryQty(idx, Number((e.target as HTMLInputElement).value))"
                    :max="item.max_qty" min="0" />
                  <p class="text-[10px] text-slate-500">Kirim</p>
                </div>
                <button @click="incrementDelivery(idx)"
                  class="w-9 h-9 flex items-center justify-center rounded-lg bg-amber-600 text-white active:scale-90 transition-transform"
                  :disabled="item.delivered_qty >= item.max_qty">
                  <Plus class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Delivery Note -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Catatan (Opsional)</label>
              <textarea v-model="deliveryNote" placeholder="Catatan pengiriman..." rows="2"
                class="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 resize-none"></textarea>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button @click="showDeliveryDialog = false"
                class="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
                Batal
              </button>
              <button @click="confirmDelivery"
                class="flex-1 py-3 rounded-2xl bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                :disabled="submitting">
                <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
                <span v-else>Konfirmasi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Success Overlay -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showSuccess"
        class="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
        <div class="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
          <!-- Confetti-like decoration -->
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div class="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
            <Package class="w-10 h-10 text-green-600 relative z-10" stroke-width="2" />
          </div>

          <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sukses!</h2>
          <p class="text-slate-500 mb-8 leading-relaxed">
            Pengiriman berhasil dikonfirmasi dan stok telah diperbarui.
          </p>

          <button @click="closeSuccess"
            class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
            Kembali
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSaleStore } from '@/stores/sale.store';
import { ChevronLeft, Package, User, Truck, Loader2, X, Minus, Plus } from 'lucide-vue-next';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const router = useRouter();
const saleStore = useSaleStore();

const loading = ref(false);
const showDeliveryDialog = ref(false);
const showSuccess = ref(false);
const selectedSale = ref<any>(null);
const deliveryItems = ref<{ voucher_product_id: number, delivered_qty: number, max_qty: number, product_name: string }[]>([]);
const deliveryNote = ref('');
const submitting = ref(false);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: id });
};

const getRecipientName = (sale: any) => {
  if (sale.outlet) return sale.outlet.name;
  if (sale.reseller) return sale.reseller.name;
  return sale.customer_name || 'Pelanggan';
};

const openDeliveryDialog = (sale: any) => {
  selectedSale.value = sale;
  deliveryItems.value = sale.items.map((item: any) => ({
    voucher_product_id: item.voucher_product_id,
    delivered_qty: item.quantity,
    max_qty: item.quantity,
    product_name: item.voucher_product?.name || `Product #${item.voucher_product_id}`
  }));
  deliveryNote.value = '';
  showDeliveryDialog.value = true;
};

const updateDeliveryQty = (index: number, qty: number) => {
  const item = deliveryItems.value[index];
  if (item) {
    item.delivered_qty = Math.max(0, Math.min(qty, item.max_qty));
  }
};

const incrementDelivery = (index: number) => {
  const item = deliveryItems.value[index];
  if (item && item.delivered_qty < item.max_qty) {
    item.delivered_qty++;
  }
};

const decrementDelivery = (index: number) => {
  const item = deliveryItems.value[index];
  if (item && item.delivered_qty > 0) {
    item.delivered_qty--;
  }
};

const confirmDelivery = async () => {
  if (!selectedSale.value) return;

  submitting.value = true;
  try {
    await saleStore.markAsDelivered(
      selectedSale.value.public_id,
      deliveryItems.value.map(item => ({
        voucher_product_id: item.voucher_product_id,
        delivered_qty: item.delivered_qty
      })),
      deliveryNote.value || undefined
    );

    showDeliveryDialog.value = false;
    selectedSale.value = null;
    showSuccess.value = true;

    // Refresh list
    await saleStore.fetchPendingDeliveries();
  } catch (error) {
    console.error('Failed to mark as delivered:', error);
    alert('Gagal memproses pengiriman');
  } finally {
    submitting.value = false;
  }
};

const closeSuccess = () => {
  showSuccess.value = false;
};

onMounted(async () => {
  loading.value = true;
  await saleStore.fetchPendingDeliveries();
  loading.value = false;
});
</script>

<style scoped>
/* Smooth scrolling for dialog */
.overflow-y-auto {
  scroll-behavior: smooth;
}
</style>
