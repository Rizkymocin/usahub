<template>
  <f7-page name="home">
    <!-- Navbar -->
    <f7-navbar large :sliding="false">
      <f7-nav-title sliding>UsaHub</f7-nav-title>
      <f7-nav-title-large>UsaHub</f7-nav-title-large>
    </f7-navbar>

    <!-- Toolbar (Bottom Nav) -->
    <f7-toolbar bottom tabbar labels>
      <f7-link tab-link="#view-home" tab-link-active icon-ios="f7:house" icon-aurora="f7:house" icon-md="material:home" text="Beranda"></f7-link>
      <f7-link tab-link="#view-topup" icon-ios="f7:money_dollar_circle" icon-aurora="f7:money_dollar_circle" icon-md="material:monetization_on" text="Top Up"></f7-link>
      <f7-link tab-link="#view-activity" icon-ios="f7:list_bullet" icon-aurora="f7:list_bullet" icon-md="material:list" text="Aktivitas"></f7-link>
      <f7-link tab-link="#view-account" icon-ios="f7:person" icon-aurora="f7:person" icon-md="material:person" text="Akun"></f7-link>
    </f7-toolbar>

    <!-- Content -->
    <f7-block-title>Dashboard</f7-block-title>
    <f7-block>
      <p>Welcome back, {{ authStore.user?.name }}!</p>
    </f7-block>
    
    <f7-block-title>Quick Actions</f7-block-title>
    <f7-list>
       <f7-list-item title="Outlet Management" link="#"></f7-list-item>
       <f7-list-item title="Reseller Management" link="#"></f7-list-item>
    </f7-list>

  </f7-page>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>
