<script setup lang="ts">
import { ref } from "vue";

const isSidebarOpen = ref<boolean>(false);
</script>

<template>
  <UDashboardGroup unit="rem" storage="local" storage-key="dashboard_storage">
    <UDashboardSidebar v-model="isSidebarOpen"> </UDashboardSidebar>
    <RouterView></RouterView>
  </UDashboardGroup>
</template>
