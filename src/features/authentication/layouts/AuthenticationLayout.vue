<script setup lang="ts">
const highlights = [
  "Real-time dashboard analytics",
  "Role-based team access",
  "Secure session management",
] as const;
</script>

<template>
  <div class="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <aside
      class="relative hidden overflow-hidden border-r border-muted bg-muted lg:flex lg:flex-col lg:justify-between"
    >
      <!-- Minimal geometric accent — left panel only -->
      <svg
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 size-full text-border"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="auth-aside-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="currentColor" stroke-width="0.5" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#auth-aside-grid)" opacity="0.22" />

        <g opacity="0.3" transform="translate(108%, -8%)">
          <circle r="120" fill="none" stroke="currentColor" stroke-width="1" />
          <circle r="168" fill="none" stroke="currentColor" stroke-width="1" />
        </g>
      </svg>

      <div class="relative z-10 p-10 xl:p-14">
        <div class="flex items-center gap-3">
          <img src="@/assets/logo.svg" alt="" class="size-9" />
          <span class="text-lg font-semibold tracking-tight text-highlighted">Vue Dashboard</span>
        </div>
      </div>

      <div class="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
        <div class="mx-auto w-full max-w-md space-y-8">
          <div
            class="flex size-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30"
          >
            <UIcon name="i-lucide-layout-dashboard" class="size-7 text-primary" />
          </div>

          <div class="space-y-3">
            <h1
              class="text-3xl font-semibold tracking-tight text-balance text-highlighted xl:text-4xl"
            >
              Manage your workspace with confidence
            </h1>
            <p class="text-base leading-relaxed text-muted text-pretty">
              A clean dashboard experience to monitor performance, collaborate with your team, and
              stay on top of every project.
            </p>
          </div>

          <ul class="space-y-3">
            <li
              v-for="item in highlights"
              :key="item"
              class="flex items-center gap-3 text-sm text-muted"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 text-primary" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="relative z-10 p-10 text-sm text-dimmed xl:p-14">
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
        <div class="w-full max-w-sm sm:max-w-xl">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>
