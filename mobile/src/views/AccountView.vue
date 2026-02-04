<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Akun Saya</h1>
    </header>

    <!-- Profile Section -->
    <section class="px-6 py-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {{ userInitials }}
          </div>
          <div class="flex-1">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ user?.name || 'User' }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ user?.email || 'email@example.com' }}</p>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="(role, index) in userRoles" :key="index" class="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium rounded-full">
                {{ formatRole(role) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Settings List -->
    <section class="px-6 space-y-3">
      <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pengaturan</h3>
      
      <!-- Change Password -->
      <button @click="showPasswordDialog = true" class="w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-primary/50 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Lock class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="text-left">
            <p class="font-medium text-slate-900 dark:text-white">Ganti Password</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ubah kata sandi akun Anda</p>
          </div>
        </div>
        <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
      </button>

      <!-- Dark Mode Toggle -->
      <div class="w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <Moon v-if="!isDark" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <Sun v-else class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="text-left">
            <p class="font-medium text-slate-900 dark:text-white">Mode Gelap</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ isDark ? 'Aktif' : 'Nonaktif' }}</p>
          </div>
        </div>
        <button @click="themeStore.toggleTheme()" :class="isDark ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'" class="relative w-14 h-8 rounded-full transition-colors">
          <div :class="isDark ? 'translate-x-7' : 'translate-x-1'" class="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform"></div>
        </button>
      </div>

      <!-- App Version -->
      <div class="w-full bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
            <Info class="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div class="text-left">
            <p class="font-medium text-slate-900 dark:text-white">Versi Aplikasi</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">1.0.0 (Build 001)</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Logout Button -->
    <section class="px-6 mt-8">
      <button @click="handleLogout" class="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-xl border border-red-100 dark:border-red-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <LogOut class="w-5 h-5" />
        Keluar
      </button>
    </section>

    <!-- Change Password Dialog -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showPasswordDialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-6" @click.self="showPasswordDialog = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl transform transition-all"
           :class="{ 'translate-y-0 opacity-100': showPasswordDialog, 'translate-y-4 opacity-0': !showPasswordDialog }"
        >
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Ganti Password</h3>
            <button @click="showPasswordDialog = false" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <X class="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password Lama</label>
              <input v-model="passwordForm.oldPassword" type="password" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white" placeholder="••••••••" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password Baru</label>
              <input v-model="passwordForm.newPassword" type="password" required minlength="8" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white" placeholder="••••••••" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Konfirmasi Password Baru</label>
              <input v-model="passwordForm.confirmPassword" type="password" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white" placeholder="••••••••" />
            </div>

            <div v-if="passwordError" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {{ passwordError }}
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="showPasswordDialog = false" class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                Batal
              </button>
              <button type="submit" :disabled="isChangingPassword" class="flex-1 px-4 py-3 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-50 transition-all">
                {{ isChangingPassword ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Logout Confirmation Dialog -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showLogoutConfirm" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" @click.self="showLogoutConfirm = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 text-center shadow-xl transform transition-all"
           :class="{ 'scale-100 opacity-100': showLogoutConfirm, 'scale-95 opacity-0': !showLogoutConfirm }"
        >
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Konfirmasi Keluar</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-6">Apakah Anda yakin ingin keluar dari aplikasi?</p>
          
          <div class="flex gap-3">
            <button @click="showLogoutConfirm = false" class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Batal
            </button>
            <button @click="confirmLogout" class="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
              Ya, Keluar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { Lock, Moon, Sun, Info, LogOut, ChevronRight, X } from 'lucide-vue-next';
import axios from '@/lib/axios';
import { toast } from 'vue-sonner';

const auth = useAuthStore();
const themeStore = useThemeStore();

const user = computed(() => auth.user);
const isDark = computed(() => themeStore.isDark);

const userInitials = computed(() => {
  const name = user.value?.name || 'U';
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
});

const userRoles = computed(() => {
  if (!user.value?.roles || !Array.isArray(user.value.roles)) return [];
  return user.value.roles.map((r: any) => r.name || r);
});

const formatRole = (roleName: string) => {
  if (!roleName) return 'User';
  const roleMap: Record<string, string> = {
    'business_admin': 'Admin Usaha',
    'kasir': 'Kasir',
    'outlet': 'Outlet',
    'teknisi': 'Teknisi',
    'teknisi_maintenance': 'Teknisi Maintenance',
    'teknisi_pasang_baru': 'Teknisi Pasang Baru',
    'finance': 'Finance',
    'sales': 'Sales',
  };
  return roleMap[roleName] || roleName;
};

// Password Change
const showPasswordDialog = ref(false);
const isChangingPassword = ref(false);
const passwordError = ref('');
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleChangePassword = async () => {
  passwordError.value = '';
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Password baru dan konfirmasi tidak cocok';
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Password minimal 8 karakter';
    return;
  }

  isChangingPassword.value = true;
  
  try {
    await axios.post('/user/change-password', {
      old_password: passwordForm.value.oldPassword,
      new_password: passwordForm.value.newPassword,
      new_password_confirmation: passwordForm.value.confirmPassword,
    });
    
    showPasswordDialog.value = false;
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    toast.success('Password berhasil diubah!');
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || 'Gagal mengubah password';
  } finally {
    isChangingPassword.value = false;
  }
};

const handleLogout = () => {
  showLogoutConfirm.value = true;
};

// Logout Confirmation
const showLogoutConfirm = ref(false);

const confirmLogout = () => {
  auth.logout();
  showLogoutConfirm.value = false;
};
</script>
