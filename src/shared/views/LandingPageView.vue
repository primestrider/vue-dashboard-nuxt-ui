<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-6"
  >
    <div class="text-center max-w-2xl animate-fade-in">
      <h1 class="text-6xl font-extrabold tracking-tight mb-4">
        <span class="text-green-500">Vue</span> Boilerplate
      </h1>

      <p class="text-lg text-gray-300 mb-6 leading-relaxed">
        A clean and scalable starting point built with
        <span class="font-semibold text-green-400">Vue 3 Composition API</span>,
        <span class="font-semibold text-green-400">TypeScript</span>, and
        <span class="font-semibold text-green-400">Tailwind CSS v4</span>.
      </p>

      <div class="flex flex-col gap-2 mb-10 justify-center items-center">
        <p class="text-base text-gray-400">
          💡 You can generate a new feature instantly with:
          <br />
        </p>
        <code class="bg-gray-800 px-3 py-1 rounded-md text-green-400 w-fit">
          npm run create-feature my-feature
        </code>
      </div>

      <RouterLink :to="{ name: ExamplePageName.EXAMPLE }">
        <button
          class="px-8 py-3 bg-green-600 text-white rounded-xl font-medium shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          Check Example Page
        </button>
      </RouterLink>
    </div>

    <footer class="mt-20 text-sm text-gray-500 animate-fade-in-slow">
      <p>© {{ new Date().getFullYear() }} crafted with Vue 3 + Tailwind 4</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ExamplePageName } from "@/features/example/models"

// Static landing page — no extra logic
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-fade-in-slow {
  animation: fade-in 1.5s ease-out;
}
</style>
