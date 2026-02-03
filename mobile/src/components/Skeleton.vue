<template>
  <div 
    class="skeleton-effect-wave"
    :style="{
      width: width,
      height: height,
      borderRadius: borderRadius
    }"
  ></div>
</template>

<script setup lang="ts">
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  borderRadius: { type: String, default: '4px' }
});
</script>

<style scoped>
.skeleton-effect-wave {
  background: linear-gradient(90deg, #eff1f3 25%, #e2e2e2 37%, #eff1f3 63%);
  background-size: 400% 100%;
  animation: skeleton-wave 1.4s ease infinite;
}

@keyframes skeleton-wave {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
