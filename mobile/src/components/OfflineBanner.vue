<template>
  <div v-if="!isConnected" class="offline-banner">
    You are offline. Please check your connection.
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useNetworkStore } from '../stores/network';

const networkStore = useNetworkStore();
const isConnected = computed(() => networkStore.status.connected);

onMounted(() => {
  networkStore.initListener();
});
</script>

<style scoped>
.offline-banner {
  background-color: #ff3b30;
  color: white;
  text-align: center;
  padding: 8px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  font-weight: 500;
  font-size: 14px;
}
</style>
