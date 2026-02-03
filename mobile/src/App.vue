<template>
  <f7-app v-bind="f7params">
    <f7-view main class="safe-areas" url="/"></f7-view>
  </f7-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { f7App, f7View } from 'framework7-vue';
import routes from './router/routes'; // We will define this next
import { App } from '@capacitor/app';

const f7params = ref({
  name: 'UsaHub', // App name
  theme: 'auto', // Automatic theme detection
  routes: routes, // App routes
  serviceWorker: {
    path: '/service-worker.js',
  },
});

onMounted(() => {
    // Handle back button for Android
    App.addListener('backButton', () => {
        // Logic to handle back button or exit app
    });
});
</script>
