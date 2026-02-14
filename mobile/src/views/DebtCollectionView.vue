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
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Penagihan Hutang</h1>
        <div class="w-10"></div>
      </div>
    </header>

    <main class="pt-24 pb-6 px-4">
      <!-- Summary Card -->
      <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 mb-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
        <div class="relative z-10">
          <p class="text-indigo-100 font-medium mb-1">Total Piutang</p>
          <h2 class="text-3xl font-black tracking-tight">Rp {{ formatCurrency(totalDebt) }}</h2>
          <p class="text-xs text-indigo-200 mt-2 bg-white/10 inline-flex px-3 py-1 rounded-full border border-white/10">
            {{ debts.length }} Transaksi Belum Lunas
          </p>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cari nama pelanggan/outlet..."
            class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      <!-- Debt List -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <div v-else-if="filteredDebts.length > 0" class="space-y-4">
        <div 
          v-for="sale in filteredDebts" 
          :key="sale.id"
          @click="openPaymentModal(sale)"
          class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {{ getInitial(getRecipientName(sale)) }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900 leading-tight">{{ getRecipientName(sale) }}</h3>
                <p class="text-xs text-slate-500">{{ formatDate(sale.sold_at) }}</p>
              </div>
            </div>
            <span class="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide">
              Belum Lunas
            </span>
          </div>

          <div class="flex justify-between items-end border-t border-slate-50 pt-3">
             <div>
               <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Total Belanja</p>
               <p class="text-sm font-bold text-slate-700">Rp {{ formatCurrency(sale.total_amount) }}</p>
             </div>
             <div class="text-right">
               <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">Sisa Hutang</p>
               <p class="text-lg font-black text-slate-900">RP {{ formatCurrency(sale.remaining_amount) }}</p>
             </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 class="w-10 h-10 text-slate-300" />
        </div>
        <h3 class="font-bold text-slate-900">Tidak ada tagihan</h3>
        <p class="text-slate-500 text-sm mt-1">Semua transaksi telah lunas.</p>
      </div>
    </main>

    <!-- Payment Modal -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-black leading-6 text-slate-900 mb-4">
                  Bayar Hutang
                </DialogTitle>
                
                <div v-if="selectedSale" class="space-y-4">
                  <!-- Voucher Items -->
                  <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Item Voucher</p>
                    <div class="space-y-2">
                      <div 
                        v-for="item in selectedSale.items" 
                        :key="item.id"
                        class="flex justify-between items-center text-sm"
                      >
                        <span class="text-slate-600">
                          <span class="font-bold text-slate-800">{{ item.quantity }}x</span> 
                          {{ item.voucher_product?.name || `Voucher #${item.voucher_product_id}` }}
                        </span>
                        <span class="font-bold text-slate-900">Rp {{ formatCurrency(item.subtotal) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p class="text-xs text-indigo-600 font-medium mb-1">Sisa Hutang</p>
                    <p class="text-xl font-black text-indigo-900">Rp {{ formatCurrency(selectedSale.remaining_amount) }}</p>
                  </div>

                  <div>
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Jumlah Pembaran</label>
                    <div class="relative group mt-1.5">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                      <input 
                        v-model.number="paymentAmount"
                        type="number" 
                        class="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                     <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Catatan (Opsional)</label>
                     <textarea 
                        v-model="paymentNote"
                        rows="2"
                        class="w-full mt-1.5 px-4 py-3 bg-white rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                        placeholder="Info transfer bank, dll..."
                     ></textarea>
                  </div>

                  <div class="pt-2">
                    <button
                      @click="submitPayment"
                      :disabled="!isValidPayment || submitting"
                      class="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <Loader2 v-if="submitting" class="w-5 h-5 animate-spin" />
                      <span v-else>Konfirmasi Pembayaran</span>
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSaleStore } from '@/stores/sale.store';
import { 
  ChevronLeft, Search, Loader2, CheckCircle2 
} from 'lucide-vue-next';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const router = useRouter();
const saleStore = useSaleStore();

const loading = ref(true);
const searchQuery = ref('');
const isModalOpen = ref(false);
const selectedSale = ref<any>(null);
const paymentAmount = ref<number>(0);
const paymentNote = ref('');
const submitting = ref(false);

const debts = computed(() => saleStore.debts);
const totalDebt = computed(() => debts.value.reduce((acc, curr) => acc + Number(curr.remaining_amount), 0));

const filteredDebts = computed(() => {
  if (!searchQuery.value) return debts.value;
  const q = searchQuery.value.toLowerCase();
  return debts.value.filter(d => 
    getRecipientName(d).toLowerCase().includes(q)
  );
});

const getRecipientName = (sale: any) => {
  if (sale.customer_name) return sale.customer_name;
  if (sale.outlet) return sale.outlet.name;
  if (sale.reseller) return sale.reseller.name;
  return 'Pelanggan Umum';
};

const getInitial = (name: string) => name.charAt(0).toUpperCase();

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('id-ID').format(Number(val));
};

const formatDate = (date: string) => {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id });
};

const openPaymentModal = (sale: any) => {
  selectedSale.value = sale;
  paymentAmount.value = Number(sale.remaining_amount);
  paymentNote.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedSale.value = null;
};

const isValidPayment = computed(() => {
  if (!selectedSale.value) return false;
  return paymentAmount.value > 0 && paymentAmount.value <= Number(selectedSale.value.remaining_amount);
});

const submitPayment = async () => {
  if (!isValidPayment.value || !selectedSale.value) return;

  submitting.value = true;
  try {
    await saleStore.submitDebtPayment({
      salePublicId: selectedSale.value.public_id,
      amount: paymentAmount.value,
      note: paymentNote.value
    });
    closeModal();
    // Refresh debts
    loading.value = true;
    await saleStore.fetchDebts();
  } catch (error) {
    console.error(error);
    alert('Gagal memproses pembayaran');
  } finally {
    submitting.value = false;
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await saleStore.fetchDebts();
  loading.value = false;
});
</script>
