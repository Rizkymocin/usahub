<template>
  <f7-page login-screen>
    <f7-login-screen-title>UsaHub</f7-login-screen-title>
    <f7-list form>
      <f7-list-input
        type="email"
        label="Email"
        placeholder="Your email"
        :value="email"
        @input="email = $event.target.value"
      ></f7-list-input>
      <f7-list-input
        type="password"
        label="Password"
        placeholder="Your password"
        :value="password"
        @input="password = $event.target.value"
      ></f7-list-input>
    </f7-list>
    <f7-list>
      <f7-list-button title="Sign In" @click="handleLogin"></f7-list-button>
      <f7-block-footer>
        <p v-if="authStore.error" class="text-color-red">{{ authStore.error }}</p>
      </f7-block-footer>
    </f7-list>
  </f7-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();

const handleLogin = () => {
  if (!email.value || !password.value) {
    f7.dialog.alert('Please fill in all fields', 'Error');
    return;
  }
  authStore.login(email.value, password.value);
};
</script>
