<template>
  <RouterView v-slot="{ Component, route }">
    <DashboardLayout v-if="route.meta.requiresAuth">
      <component :is="Component" />
    </DashboardLayout>
    <component v-else :is="Component" />
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
</script>
