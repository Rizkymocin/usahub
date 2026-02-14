<template>
    <section v-if="store.hasAnnouncements || store.loading">
        <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-slate-900 text-lg">Pengumuman</h3>
            <!-- <button class="text-xs text-primary font-medium">Lihat Semua</button> -->
        </div>

        <div v-if="store.loading" class="animate-pulse bg-slate-100 h-32 rounded-2xl"></div>

        <div v-else-if="latest" @click="showDetail = true"
            class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
            <!-- Background decoration -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2">
            </div>

            <div class="relative z-10 flex gap-3">
                <div class="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <Bell class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 class="font-bold text-slate-900 line-clamp-1">{{ latest.title }}</h4>
                        <span v-if="latest.type === 'penting'"
                            class="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                            Penting
                        </span>
                        <span v-else class="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                            Info
                        </span>
                    </div>
                    <p class="text-sm text-slate-700 leading-relaxed mb-2 line-clamp-3">
                        {{ latest.content }}
                    </p>
                    <p class="text-xs text-slate-500">{{ formatDate(latest.created_at) }}</p>
                </div>
            </div>
        </div>

        <!-- Detail Dialog Overlay -->
        <Teleport to="body">
            <div v-if="showDetail && latest" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showDetail = false"></div>

                <!-- Modal Content -->
                <div
                    class="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
                    <!-- Header -->
                    <div class="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                <Bell class="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 class="font-bold text-slate-900 text-lg leading-tight">{{ latest.title }}</h3>
                                <p class="text-xs text-slate-500 mt-0.5">{{ formatDate(latest.created_at) }}</p>
                            </div>
                        </div>
                        <button @click="showDetail = false"
                            class="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Content (Scrollable) -->
                    <div class="p-6 overflow-y-auto">
                        <div class="flex gap-2 mb-4">
                            <span v-if="latest.type === 'penting'"
                                class="px-2.5 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                                Penting
                            </span>
                            <span v-else
                                class="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">
                                Info
                            </span>
                        </div>
                        <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ latest.content }}</p>
                    </div>

                    <!-- Footer -->
                    <div class="p-4 border-t border-slate-100">
                        <button @click="showDetail = false"
                            class="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAnnouncementStore } from '@/stores/announcement.store';
import { Bell, X } from 'lucide-vue-next';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

const props = defineProps<{
    businessId?: string;
}>();

const store = useAnnouncementStore();
const showDetail = ref(false);

const latest = computed(() => store.latestAnnouncement);

onMounted(() => {
    if (props.businessId) {
        store.fetchAnnouncements(props.businessId);
    }
});

const formatDate = (dateString: string) => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: id });
    } catch (e) {
        return dateString;
    }
};
</script>
