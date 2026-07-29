<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="w-full space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm leading-relaxed text-muted">
        {{ description }}
      </p>
    </header>

    <div>
      <slot />
    </div>
  </div>
</template>
