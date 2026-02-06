<template>
  <div class="min-h-screen bg-slate-50 relative overflow-hidden">
    <!-- Decorative Background Elements -->
    <div class="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none z-0"></div>
    <div class="fixed -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
    <div class="fixed top-40 -left-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

    <!-- Glass Header -->
    <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 transition-all duration-300">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between mb-4">
          <button 
            @click="handleBack" 
            class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all group"
          >
            <ChevronLeft class="w-6 h-6 text-slate-800 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div class="flex flex-col items-center">
            <h1 class="text-base font-bold text-slate-900 tracking-tight">Penjualan Voucher</h1>
            <span class="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-0.5">
              Step {{ currentStep }} of {{ steps.length }}
            </span>
          </div>
          <div class="w-10"></div> <!-- Spacer for balance -->
        </div>

        <!-- Custom Stepper -->
        <div class="flex items-center justify-between px-2 gap-2">
          <div v-for="(_, index) in steps" :key="index" class="flex-1 flex flex-col gap-1.5">
            <div class="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
                :class="[
                  currentStep > index + 1 ? 'w-full' : 
                  currentStep === index + 1 ? 'w-full' : 'w-0'
                ]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="pt-[8.5rem] pb-36 px-6 relative z-10 max-w-lg mx-auto">
      
      <!-- Step 1: Recipient Selection -->
      <section v-if="currentStep === 1" class="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight mb-2">Siapa Pembelinya?</h2>
          <p class="text-slate-500 text-sm leading-relaxed">Pilih tipe penerima untuk melanjutkan transaksi.</p>
        </div>

        <div class="grid grid-cols-1 gap-4 mb-8">
          <button 
            v-for="type in recipientTypes" 
            :key="type.id"
            @click="saleStore.soldToType = type.id as any"
            class="group relative overflow-hidden rounded-3xl transition-all duration-300 border-2 text-left p-1"
            :class="[
              saleStore.soldToType === type.id 
                ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-500/10 scale-[1.02]' 
                : 'border-transparent bg-white hover:bg-slate-50 hover:scale-[1.01] shadow-lg shadow-slate-200/50'
            ]"
          >
            <!-- Card Content -->
            <div class="p-5 flex items-start gap-4">
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 shadow-inner"
                :class="saleStore.soldToType === type.id ? 'bg-indigo-600 text-white' : type.bg + ' ' + type.text"
              >
                <component :is="type.icon" class="w-7 h-7" stroke-width="2" />
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <h3 class="font-bold text-slate-900 text-lg">{{ type.label }}</h3>
                  <div 
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                    :class="saleStore.soldToType === type.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'"
                  >
                    <Check v-if="saleStore.soldToType === type.id" class="w-3.5 h-3.5 text-white" stroke-width="3" />
                  </div>
                </div>
                <p class="text-xs text-slate-500 mt-1 leading-relaxed pr-6">{{ type.description }}</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Dynamic Inputs Area -->
        <div class="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-500">
          
          <!-- End User Form -->
          <div v-if="saleStore.soldToType === 'end_user'" class="space-y-5">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Data Pelanggan</label>
              <div class="relative group">
                <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  v-model="saleStore.customerName"
                  type="text" 
                  placeholder="Nama Lengkap"
                  class="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <div class="relative group">
                <Smartphone class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  v-model="saleStore.customerPhone"
                  type="tel" 
                  placeholder="Nomor WhatsApp (Opsional)"
                  class="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <!-- Outlet/Reseller Search -->
          <div v-else class="space-y-4">
             <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cari {{ saleStore.soldToType }}</label>
             <div class="relative group">
               <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Search class="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               </div>
               <input
                 v-model="searchQuery"
                 type="text"
                 class="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                 :placeholder="`Ketik nama ${saleStore.soldToType}...`"
               />
               <button 
                 v-if="searchQuery" 
                 @click="searchQuery = ''"
                 class="absolute inset-y-0 right-0 pr-3 flex items-center"
               >
                 <div class="bg-slate-100 hover:bg-slate-200 rounded-full p-1 transition-colors">
                   <X class="h-3 w-3 text-slate-500" />
                 </div>
               </button>
             </div>

             <!-- Search Results -->
             <div class="max-h-[16rem] overflow-y-auto pr-1 space-y-2 -mx-2 px-2 custom-scrollbar">
               <button 
                 v-for="item in filteredRecipients" 
                 :key="item.id"
                 @click="saleStore.recipientId = item.id"
                 class="w-full group p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between hover:scale-[1.01]"
                 :class="[
                   saleStore.recipientId === item.id 
                     ? 'bg-indigo-50 border-indigo-600 shadow-sm' 
                     : 'bg-white border-slate-100 hover:border-indigo-200'
                 ]"
               >
                 <div class="flex items-center gap-3 text-left">
                   <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-inner"
                     :class="saleStore.recipientId === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'"
                   >
                     {{ item.name.charAt(0).toUpperCase() }}
                   </div>
                   <div>
                     <p class="font-bold text-slate-900 text-sm leading-tight">{{ item.name }}</p>
                     <p class="text-[10px] text-slate-500 mt-0.5">{{ (item as any).phone || (item as any).reseller_code || 'No details' }}</p>
                   </div>
                 </div>
                 <div v-if="saleStore.recipientId === item.id" class="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transform scale-100 transition-transform">
                    <Check class="w-3 h-3 text-white" stroke-width="3" />
                 </div>
               </button>
               
               <div v-if="filteredRecipients.length === 0 && searchQuery" class="text-center py-6">
                 <p class="text-sm text-slate-400">Tidak ditemukan hasil untuk "{{ searchQuery }}"</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      <!-- Step 2: Voucher Selection -->
      <section v-if="currentStep === 2" class="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div class="flex items-end justify-between mb-6 px-1">
          <div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Pilih Voucher</h2>
            <p class="text-slate-500 text-sm mt-1">Stok yang tersedia.</p>
          </div>
          <div class="bg-indigo-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-indigo-500/20">
            {{ saleStore.items.length }} dipilih
          </div>
        </div>

        <div v-if="stockStore.myStock.length > 0" class="grid grid-cols-1 gap-4">
          <div 
            v-for="item in stockStore.myStock" 
            :key="item.voucher_product_id"
            class="bg-white rounded-3xl p-1 border border-transparent hover:border-indigo-100 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 group"
          >
            <div class="p-4">
              <div class="flex items-start justify-between gap-4 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white group-hover:scale-110 transition-transform duration-300">
                  <Ticket class="w-6 h-6" />
                </div>
                <div class="text-right">
                  <p class="text-lg font-black text-slate-900 tracking-tight">
                    <span class="text-xs font-medium text-slate-400 mr-1">Rp</span>{{ formatCurrency(item.voucher_product.selling_price) }}
                  </p>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 mt-1">
                    Stok: {{ item.qty_available }}
                  </span>
                </div>
              </div>
              
              <div class="mb-4">
                <h3 class="font-bold text-slate-900 leading-tight mb-1 line-clamp-1">{{ item.voucher_product.name }}</h3>
                <p class="text-xs text-slate-500 line-clamp-1">Paket Internet Hotspot</p>
              </div>

              <!-- Quantity Controls -->
              <div v-if="getQtyInCart(item.voucher_product_id) > 0" class="flex items-center justify-between p-1 bg-slate-50 rounded-xl border border-slate-100">
                <button 
                  @click="saleStore.removeFromCart(item.voucher_product_id)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm border border-slate-200 active:scale-90 transition-transform"
                >
                  <Minus class="w-4 h-4" />
                </button>
                <input 
                  type="number" 
                  class="w-12 text-center text-sm font-bold text-slate-900 bg-transparent outline-none p-0"
                  :value="getQtyInCart(item.voucher_product_id)"
                  @input="(e) => saleStore.updateQuantity(item, Number((e.target as HTMLInputElement).value))" 
                />
                <button 
                  @click="saleStore.addToCart(item)"
                  class="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/30 active:scale-90 transition-transform"
                  :disabled="getQtyInCart(item.voucher_product_id) >= item.qty_available"
                >
                   <Plus class="w-4 h-4" />
                </button>
              </div>
              <button 
                v-else
                @click="saleStore.addToCart(item)"
                class="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/20"
                :disabled="item.qty_available === 0"
              >
                <ShoppingBag class="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <Package class="w-10 h-10 text-slate-300" />
          </div>
          <h4 class="font-bold text-slate-900 text-lg">Stok Kosong</h4>
          <p class="text-slate-500 text-sm mt-2 px-10 leading-relaxed">Anda belum memiliki alokasi stok voucher. Hubungi admin untuk restock.</p>
        </div>
      </section>

      <!-- Step 3: Checkout -->
      <section v-if="currentStep === 3" class="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Konfirmasi</h2>
          <p class="text-slate-500 text-sm">Pastikan semua data sudah benar.</p>
        </div>

        <!-- Receipt Card -->
        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative mb-6">
          <!-- Receipt Top Pattern -->
          <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          
          <div class="p-6 pb-8 border-b border-dashed border-slate-200">
             <!-- Recipient -->
             <div class="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <div class="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                 <User class="w-6 h-6 text-indigo-600" />
               </div>
               <div>
                 <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Penerima</p>
                 <h3 class="font-bold text-slate-900 line-clamp-1">{{ getRecipientName }}</h3>
                 <p class="text-xs text-slate-500" v-if="saleStore.soldToType === 'end_user'">{{ saleStore.customerPhone || 'Tanpa No. HP' }}</p>
               </div>
             </div>

             <!-- Items -->
             <div class="space-y-4">
               <div v-for="item in saleStore.items" :key="item.voucher_product_id" class="flex justify-between items-start text-sm group">
                 <div class="flex gap-3">
                   <span class="font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-xs h-fit min-w-[1.5rem] text-center">{{ item.quantity }}x</span>
                   <span class="text-slate-700 font-medium leading-normal">{{ item.name }}</span>
                 </div>
                 <span class="font-bold text-slate-900 whitespace-nowrap group-hover:text-indigo-600 transition-colors">Rp {{ formatCurrency(item.subtotal) }}</span>
               </div>
             </div>
          </div>

          <!-- Total Section -->
          <div class="bg-slate-50 p-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-slate-500 text-sm font-medium">Subtotal</span>
              <span class="text-slate-900 font-bold">Rp {{ formatCurrency(saleStore.totalAmount) }}</span>
            </div>
            <div class="flex justify-between items-center text-lg">
              <span class="text-indigo-900 font-black">Total Bayar</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 font-black text-2xl">Rp {{ formatCurrency(saleStore.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="space-y-4">
          <h3 class="font-bold text-slate-900 px-1">Metode Pembayaran</h3>
          <div class="grid grid-cols-2 gap-3">
            <button 
              v-for="method in paymentMethods" 
              :key="method.id"
              @click="saleStore.paymentMethod = method.id as any"
              class="relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 overflow-hidden group"
              :class="[
                saleStore.paymentMethod === method.id 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              ]"
            >
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="saleStore.paymentMethod === method.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'"
              >
                <component :is="method.icon" class="w-5 h-5" />
              </div>
              <span 
                class="font-bold text-sm transition-colors"
                :class="saleStore.paymentMethod === method.id ? 'text-indigo-900' : 'text-slate-600'"
              >{{ method.label }}</span>
              
              <div v-if="saleStore.paymentMethod === method.id" class="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                <Check class="w-3 h-3 text-white" stroke-width="3" />
              </div>
            </button>
          </div>

          <!-- Paid Amount Input for Credit -->
          <div v-if="saleStore.paymentMethod === 'credit'" class="mt-4 animate-in fade-in slide-in-from-top-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Uang Muka / DP (Opsional)</label>
            <div class="relative group mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">Rp</span>
              <input 
                v-model.number="saleStore.paidAmount"
                type="number" 
                placeholder="0"
                class="w-full pl-10 pr-4 py-4 bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
              />
            </div>
            <p class="text-[10px] text-slate-500 mt-2 px-1">
              Sisa tagihan: <span class="font-bold text-indigo-600">Rp {{ formatCurrency(Math.max(0, saleStore.totalAmount - saleStore.paidAmount)) }}</span>
            </p>
          </div>
        </div>
      </section>

    </main>

    <!-- Bottom Action Bar -->
    <div class="fixed bottom-14 inset-x-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 safe-area-bottom">
       <div class="max-w-lg mx-auto flex gap-3">
         <button 
           v-if="currentStep > 1"
           @click="currentStep--"
           class="px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all text-sm"
           :disabled="saleStore.loading"
         >
           Kembali
         </button>
         
         <button 
           @click="handleNext"
           class="flex-1 py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
           :disabled="!canContinue || saleStore.loading"
         >
           <Loader2 v-if="saleStore.loading" class="w-5 h-5 animate-spin" />
           <span v-else>{{ currentStep === 3 ? 'Bayar & Selesai' : 'Lanjut' }}</span>
           <ArrowRight v-if="currentStep < 3 && !saleStore.loading" class="w-5 h-5" />
         </button>
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
             <Check class="w-10 h-10 text-green-600 relative z-10" stroke-width="4" />
           </div>
           
           <h2 class="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sukses!</h2>
           <p class="text-slate-500 mb-8 leading-relaxed">Transaksi penjualan berhasil disimpan dan stok voucher telah diperbarui.</p>
           
           <button @click="finish" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all">
             Kembali ke Beranda
           </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSaleStore } from '@/stores/sale.store';
import { useStockStore } from '@/stores/stock.store';
import { useAuthStore } from '@/stores/auth.store';
import { useOutletStore } from '@/stores/outlet.store';
import { useResellerStore } from '@/stores/reseller.store';
import { 
  ChevronLeft, Check, Ticket, User, Store, Users, 
  Search, Plus, Minus, Package, Wallet, CreditCard,
  ArrowRight, Loader2, Smartphone, X, ShoppingBag
} from 'lucide-vue-next';

const router = useRouter();
const saleStore = useSaleStore();
const stockStore = useStockStore();
const auth = useAuthStore();
const outletStore = useOutletStore();
const resellerStore = useResellerStore();

const currentStep = ref(1);
const steps = ['Penerima', 'Voucher', 'Bayar'];
const showSuccess = ref(false);
const searchQuery = ref('');

const recipientTypes = [
  { id: 'end_user', label: 'Pelanggan', description: 'Jual langsung ke pembeli.', icon: User, bg: 'bg-blue-100', text: 'text-blue-600' },
  { id: 'outlet', label: 'Outlet', description: 'Stok ke cabang outlet.', icon: Store, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { id: 'reseller', label: 'Reseller', description: 'Jual ke mitra reseller.', icon: Users, bg: 'bg-violet-100', text: 'text-violet-600' },
];

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: Wallet },
  { id: 'credit', label: 'Hutang / Kasbon', icon: CreditCard },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID').format(value);
};

// Check quantity in store items for specific product
const getQtyInCart = (productId: number) => {
  const item = saleStore.items.find(i => i.voucher_product_id === productId);
  return item ? item.quantity : 0;
};

// Search filtering for Outlet/Reseller
const filteredRecipients = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.toLowerCase();
  if (saleStore.soldToType === 'outlet') {
    return outletStore.outlets.filter((o: any) => 
      o.name.toLowerCase().includes(query)
    );
  } else if (saleStore.soldToType === 'reseller') {
    return resellerStore.resellers.filter((r: any) => 
      r.name.toLowerCase().includes(query)
    );
  }
  return [];
});

// Reset selection when type changes to avoid invalid state
watch(() => saleStore.soldToType, () => {
  saleStore.recipientId = null;
  saleStore.customerName = '';
  saleStore.customerPhone = '';
  searchQuery.value = '';
});

// Update paid amount based on payment method
watch([() => saleStore.paymentMethod, () => saleStore.totalAmount], ([method, total], [oldMethod]) => {
  if (method === 'cash') {
    saleStore.paidAmount = total;
  } else if (method === 'credit' && method !== oldMethod) {
    saleStore.paidAmount = 0;
  }
}, { immediate: true });


// Helper for UI display
const getRecipientName = computed(() => {
  if (saleStore.soldToType === 'end_user') return saleStore.customerName || 'Pelanggan Umum';
  if (saleStore.soldToType === 'outlet') {
    const outlet = outletStore.outlets.find((o: any) => o.id === saleStore.recipientId);
    return outlet?.name || 'Penerima Terpilih';
  }
  if (saleStore.soldToType === 'reseller') {
    const reseller = resellerStore.resellers.find((r: any) => r.id === saleStore.recipientId);
    return reseller?.name || 'Penerima Terpilih';
  }
  return 'Penerima';
});

// Step validation
const canContinue = computed(() => {
  const step = currentStep.value;
  const type = saleStore.soldToType;
  
  if (step === 1) {
    if (type === 'end_user') {
      return !!saleStore.customerName && saleStore.customerName.trim().length > 0;
    }
    // Handle outlet or reseller
    return saleStore.recipientId !== null && saleStore.recipientId !== undefined;
  }
  
  if (step === 2) {
    return saleStore.items.length > 0;
  }
  
  return true;
});

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    router.back();
  }
};

const handleNext = async () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    try {
      await saleStore.submitSale();
      showSuccess.value = true;
    } catch (error) {
      console.error('Failed to submit sale:', error);
      // Optional: Add toast error handling here
    }
  }
};

const finish = () => {
  saleStore.clearCart();
  router.push('/');
};

onMounted(async () => {
  if (auth.user?.business_public_id) {
    await Promise.all([
      stockStore.fetchMyStock(auth.user.business_public_id),
      outletStore.fetchOutlets(auth.user.business_public_id),
      resellerStore.fetchResellers(auth.user.business_public_id)
    ]);
  }
});
</script>

<style scoped>
/* Custom scrollbar for search results */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
