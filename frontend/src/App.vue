<template>
  <RouterView v-slot="{ Component, route }">
    <DashboardLayout v-if="route.meta.requiresAuth">
      <component :is="Component" />
    </DashboardLayout>
    <component v-else :is="Component" />
  </RouterView>

  <!-- PWA 安裝提示 -->
  <PwaInstallPrompt />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue'
</script>
