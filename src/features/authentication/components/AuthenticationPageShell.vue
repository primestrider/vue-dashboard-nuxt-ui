<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <section class="w-full space-y-8">
    <header class="space-y-2">
      <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-highlighted">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm leading-relaxed text-muted">
        {{ description }}
      </p>
    </header>

    <div>
      <slot />
    </div>
  </section>
</template>
