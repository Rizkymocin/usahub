<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- Header -->
    <header class="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-4 py-3 flex items-center gap-3 transition-all">
      <button @click="$router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100/80 active:scale-95 transition-all">
        <ArrowLeft class="w-6 h-6 text-slate-800" />
      </button>
      <h1 class="font-bold text-slate-900 text-lg tracking-tight">Detail Tugas</h1>
    </header>

    <main v-if="issue" class="pt-[4.5rem] p-5 space-y-6">
      <!-- Status Card -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
         <div class="flex justify-between items-start mb-3">
            <span 
              class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              :class="getPriorityClass(issue.priority)"
            >
              {{ issue.priority }}
            </span>
            <span class="text-xs font-medium text-slate-400 capitalize">{{ issue.status.replace('_', ' ') }}</span>
         </div>
         <h2 class="text-xl font-bold text-slate-900 mb-2">{{ issue.title }}</h2>
         <p class="text-sm text-slate-600 leading-relaxed">{{ issue.description || 'Tidak ada deskripsi.' }}</p>
      </div>

      <!-- Location Info -->
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin class="w-4 h-4 text-primary" />
          Lokasi & Kontak
        </h3>
        
        <div class="space-y-3">
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Nama Reseller</p>
            <p class="font-medium text-slate-800">{{ issue.reseller?.name }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 mb-0.5">Alamat</p>
            <p class="text-sm text-slate-700">{{ issue.reseller?.address }}</p>
          </div>
          <div v-if="issue.reseller?.phone">
            <p class="text-xs text-slate-400 mb-0.5">Telepon</p>
            <a :href="`tel:${issue.reseller?.phone}`" class="text-sm text-blue-600 font-medium flex items-center gap-1">
              <Phone class="w-3 h-3" />
              {{ issue.reseller?.phone }}
            </a>
          </div>
        </div>
      </div>

      <!-- Action Form (Only if not resolved) -->
      <div v-if="!['resolved', 'closed'].includes(issue.status)" class="space-y-4">
        <h3 class="font-bold text-slate-900 ml-1">Laporan Pengerjaan</h3>
        
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Tindakan yang Dilakukan</label>
            <textarea 
              v-model="form.action_taken"
              rows="3"
              class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary"
              placeholder="Contoh: Restart modem, crimping ulang kabel..."
            ></textarea>
          </div>

          <div>
             <label class="block text-sm font-medium text-slate-700 mb-1.5">Hasil</label>
             <div class="grid grid-cols-2 gap-3">
               <button 
                 type="button"
                 @click="form.result = 'success'"
                 class="p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all"
                 :class="form.result === 'success' ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200' : 'bg-white border-slate-200 text-slate-500'"
               >
                 <CheckCircle class="w-5 h-5" />
                 <span class="text-xs font-bold">Selesai / Sukses</span>
               </button>
               <button 
                 type="button"
                 @click="form.result = 'pending'"
                 class="p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all"
                 :class="form.result === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-200' : 'bg-white border-slate-200 text-slate-500'"
               >
                 <Clock class="w-5 h-5" />
                 <span class="text-xs font-bold">Butuh Tindak Lanjut</span>
               </button>
             </div>
          </div>

          <!-- Inventory Section -->
          <div>
             <label class="block text-sm font-medium text-slate-700 mb-2">Penggunaan Material / Alat</label>
             
             <div class="space-y-3">
               <div v-for="(usedItem, index) in form.items" :key="index" class="flex gap-2 items-center">
                 <div class="flex-1">
                   <select 
                     v-model="usedItem.item_id"
                     class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary py-2 px-3 bg-white"
                   >
                     <option value="" disabled>Pilih Alat/Bahan</option>
                     <option v-for="item in availableItems" :key="item.id" :value="item.id">
                       {{ item.name }} (Stok: {{ item.stock }} {{ item.unit }})
                     </option>
                   </select>
                 </div>
                 <div class="w-20">
                    <input 
                      v-model="usedItem.quantity" 
                      type="number" 
                      min="1" 
                      placeholder="Qty"
                      class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary py-2 px-3"
                    />
                 </div>
                 <button @click="removeItem(index)" type="button" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 class="w-4 h-4" />
                 </button>
               </div>

               <button 
                  type="button" 
                  @click="addItem" 
                  class="text-sm font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus class="w-4 h-4" />
                  Tambah Material
               </button>
             </div>
          </div>

          <!-- Photos Section -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Dokumentasi (Opsional)</label>
            
            <div class="grid grid-cols-3 gap-2 mb-2">
                <div v-for="(preview, index) in photoPreviews" :key="index" class="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                    <img :src="preview" class="w-full h-full object-cover" />
                    <button @click="removePhoto(index)" type="button" class="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70">
                        <X class="w-3 h-3" />
                    </button>
                </div>
            </div>

            <input 
                ref="fileInput"
                type="file" 
                multiple 
                accept="image/*" 
                class="hidden"
                @change="handleFileChange"
            />
            
            <button 
                type="button" 
                @click="triggerFileInput" 
                class="w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
                <Camera class="w-4 h-4" />
                Tambah Foto
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Catatan Tambahan (Opsional)</label>
            <input 
              v-model="form.notes"
              type="text"
              class="w-full rounded-xl border-slate-200 text-sm focus:border-primary focus:ring-primary"
              placeholder="Catatan..."
            />
          </div>

          <button 
            @click="handleSubmit"
            :disabled="submitting || !form.action_taken"
            class="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {{ submitting ? 'Menyimpan...' : 'Kirim Laporan' }}
          </button>
        </div>
      </div>
    </main>
    
    <!-- Loading Skeleton -->
    <div v-else class="p-6 text-center text-slate-400">
      <Loader2 class="w-8 h-8 animate-spin mx-auto mb-2" />
      Memuat detail...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMaintenanceStore } from '@/stores/maintenance.store';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft, MapPin, Phone, CheckCircle, Clock, Loader2, Plus, Trash2, Camera, X } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = useMaintenanceStore();
const auth = useAuthStore();

const issuePublicId = route.params.id as string;
const submitting = ref(false);

const form = ref({
  action_taken: '',
  result: 'success',
  notes: '',
  items: [] as { item_id: string | number, quantity: number }[],
  photos: [] as File[]
});
const photoPreviews = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const issue = computed(() => store.currentIssue);

onMounted(() => {
  if (auth.user?.business_public_id && issuePublicId) {
    store.fetchIssueDetail(auth.user.business_public_id, issuePublicId);
    store.fetchItems(auth.user.business_public_id);
  }
});

const availableItems = computed(() => store.items);

const addItem = () => {
  form.value.items.push({ item_id: '', quantity: 1 });
};

const removeItem = (index: number) => {
  form.value.items.splice(index, 1);
};

const handleSubmit = async () => {
   if (!form.value.action_taken) return;
   
   submitting.value = true;
   try {
     if (auth.user?.business_public_id) {
       await store.submitLog(auth.user.business_public_id, issuePublicId, form.value);
       router.back();
     }
   } catch (error) {
     console.error(error);
   } finally {
     submitting.value = false;
   }
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

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      if (!file) continue;
      // Basic validation: max 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (Max 10MB)`);
        continue;
      }
      
      form.value.photos.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          photoPreviews.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }
  // Reset input so same file can be selected again if cleared
  if (input.value) input.value = '';
};

const removePhoto = (index: number) => {
  form.value.photos.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};
</script>
