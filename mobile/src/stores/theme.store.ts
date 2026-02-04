import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('theme', () => {
    const isDark = ref<boolean>(localStorage.getItem('theme') === 'dark');

    function toggleTheme() {
        isDark.value = !isDark.value;
    }

    function setTheme(dark: boolean) {
        isDark.value = dark;
    }

    // Watch and apply theme to document
    watch(isDark, (dark) => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, { immediate: true });

    return { isDark, toggleTheme, setTheme };
});
