<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import { computed, Suspense } from "vue";
import { useHead } from "@unhead/vue";

const colorMode = useColorMode();

const themeColor = computed(() => {
  return colorMode.value === "dark" ? "#1d191a" : "#ffffff";
});

useHead({
  meta: [
    {
      name: "theme-color",
      content: themeColor,
    },
  ],
});
</script>

<template>
  <Suspense>
    <UApp>
      <RouterView />
    </UApp>
  </Suspense>
</template>
