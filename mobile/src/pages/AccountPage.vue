<template>
  <f7-page name="account">
    <f7-navbar title="Akun" back-link="Back"></f7-navbar>
    <f7-block>
        <f7-button fill color="red" @click="authStore.logout">Logout</f7-button>
    </f7-block>
  </f7-page>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
</script>
