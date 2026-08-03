<script setup lang="ts">
import { ref } from "vue";

import { DashboardPageName } from "@/features/dashboard/models";
import { useDashboardSearchGroups } from "@/shared/composables/useDashboardSearchGroups"
import { useSidebarNavigation } from "@/shared/composables/useSidebarNavigation"
import AppSidebarFooter from "@/shared/components/AppSidebarFooter.vue"

/** Display name shown next to the logo in the sidebar header. */
const APP_NAME = "Vue Dashboard";

const isSidebarOpen = ref(false);
const { items } = useSidebarNavigation();
const { groups } = useDashboardSearchGroups();
</script>

<template>
  <UDashboardGroup unit="rem" storage="local" storage-key="dashboard_storage">
    <UDashboardSidebar
      v-model="isSidebarOpen"
      collapsible
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div
          class="flex w-full items-center gap-1.5"
          :class="collapsed ? 'justify-center' : 'justify-between'"
        >
          <UTooltip v-if="collapsed" :text="APP_NAME">
            <RouterLink
              :to="{ name: DashboardPageName.DASHBOARD }"
              class="flex size-8 shrink-0 items-center justify-center rounded-md transition hover:bg-elevated"
              aria-label="Go to dashboard"
            >
              <img src="@/assets/logo.svg" alt="" class="size-7" />
            </RouterLink>
          </UTooltip>

          <RouterLink
            v-else
            :to="{ name: DashboardPageName.DASHBOARD }"
            class="flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1 transition hover:bg-elevated"
          >
            <img src="@/assets/logo.svg" alt="" class="size-8 shrink-0" />
            <span class="truncate font-semibold tracking-tight text-highlighted">
              {{ APP_NAME }}
            </span>
          </RouterLink>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          block
          size="sm"
          :collapsed="collapsed"
          class="rounded-lg! bg-transparent ring-default"
        />
        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>

      <template #footer="{ collapsed }">
        <AppSidebarFooter :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <RouterView />

    <UDashboardSearch :groups="groups" />
  </UDashboardGroup>
</template>
