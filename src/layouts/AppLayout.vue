<script setup lang="ts">
import { ref } from "vue";

import { useDashboardSearchGroups } from "@/shared/composables/useDashboardSearchGroups";
import { useSidebarNavigation } from "@/shared/composables/useSidebarNavigation";

const isSidebarOpen = ref(false);
const { items } = useSidebarNavigation();
const { groups } = useDashboardSearchGroups();
</script>

<template>
  <UDashboardGroup unit="rem" storage="local" storage-key="dashboard_storage">
    <UDashboardSidebar v-model="isSidebarOpen" collapsible>
      <template #header="{ collapsed }">
        <UDashboardSearchButton
          block
          size="sm"
          :collapsed="collapsed"
          class="bg-transparent ring-default rounded-lg!"
        />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>
    </UDashboardSidebar>

    <RouterView />

    <UDashboardSearch :groups="groups" />
  </UDashboardGroup>
</template>
