<script setup lang="ts">
const highlights = [
  "Real-time dashboard analytics",
  "Role-based team access",
  "Secure session management",
] as const
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <aside
      class="relative hidden overflow-hidden bg-inverted text-inverted lg:flex lg:flex-col lg:justify-between"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--ui-primary)_0%,transparent_50%)] opacity-20"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--ui-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--ui-border)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-10"
      />

      <div class="relative z-10 p-10 xl:p-14">
        <div class="flex items-center gap-3">
          <img src="@/assets/logo.svg" alt="" class="size-9" />
          <span class="text-lg font-semibold tracking-tight">Vue Dashboard</span>
        </div>
      </div>

      <div class="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
        <div class="mx-auto w-full max-w-md space-y-8">
          <div
            class="flex size-14 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25"
          >
            <UIcon name="i-lucide-layout-dashboard" class="size-7 text-primary" />
          </div>

          <div class="space-y-3">
            <h1 class="text-3xl font-semibold tracking-tight text-balance xl:text-4xl">
              Manage your workspace with confidence
            </h1>
            <p class="text-base leading-relaxed text-inverted/70 text-pretty">
              A clean dashboard experience to monitor performance, collaborate with
              your team, and stay on top of every project.
            </p>
          </div>

          <ul class="space-y-3">
            <li
              v-for="item in highlights"
              :key="item"
              class="flex items-center gap-3 text-sm text-inverted/75"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 text-primary" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="relative z-10 p-10 text-sm text-inverted/50 xl:p-14">
        © {{ new Date().getFullYear() }} Vue Dashboard
      </div>
    </aside>

    <main class="flex min-h-dvh flex-col bg-default">
      <header
        class="flex shrink-0 items-center justify-between border-b border-muted px-4 py-4 sm:px-8 lg:border-none"
      >
        <div class="flex items-center gap-2.5 lg:hidden">
          <img src="@/assets/logo.svg" alt="" class="size-8" />
          <span class="text-base font-semibold text-highlighted">Vue Dashboard</span>
        </div>

        <div class="ms-auto">
          <UColorModeButton color="neutral" variant="ghost" />
        </div>
      </header>

      <div
        class="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12 xl:px-16"
      >
        <div class="w-full max-w-sm sm:max-w-md">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>
