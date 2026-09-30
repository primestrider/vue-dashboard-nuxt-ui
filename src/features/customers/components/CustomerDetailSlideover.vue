<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui"
import { useQuery } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import { useDateFormatter } from "@/shared/composables/useDateFormatter"
import { formatCurrency } from "@/shared/helpers/number"

import { summarizeOrders } from "@/features/orders/helpers/order-summary"
import { getOrdersByCustomer, orderQueryKeys } from "@/features/orders/services/api"

import { ROLE_BADGE_COLOR } from "../helpers/role"
import { customerQueryKeys, getCustomer } from "../services/api"

/**
 * Customer profile panel with order history, opened through `useOverlay`.
 */
const { customerId } = defineProps<{
  customerId: number
}>()

const { formatDate } = useDateFormatter()

const { data: customer, isPending, error, refetch } = useQuery({
  queryKey: computed(() => customerQueryKeys.detail(customerId)),
  queryFn: () => getCustomer(customerId),
})

const { data: orders, isPending: isLoadingOrders } = useQuery({
  queryKey: computed(() => orderQueryKeys.byCustomer(customerId)),
  queryFn: () => getOrdersByCustomer(customerId),
})

const orderSummary = computed(() => summarizeOrders(orders.value?.carts ?? []))

const fullName = computed(() =>
  customer.value ? `${customer.value.firstName} ${customer.value.lastName}` : "",
)

const profileFields = computed(() => {
  if (!customer.value) return []
  const { email, phone, birthDate, address, company } = customer.value

  return [
    { icon: "i-lucide-mail", label: translate("features.customers.detail.email"), value: email, href: `mailto:${email}` },
    { icon: "i-lucide-phone", label: translate("features.customers.detail.phone"), value: phone, href: `tel:${phone}` },
    { icon: "i-lucide-cake", label: translate("features.customers.detail.birth_date"), value: formatDate(birthDate) },
    {
      icon: "i-lucide-map-pin",
      label: translate("features.customers.detail.address"),
      value: `${address.address}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`,
    },
    {
      icon: "i-lucide-building-2",
      label: translate("features.customers.detail.company"),
      value: `${company.title}, ${company.department} — ${company.name}`,
    },
  ]
})

const tabs = computed<TabsItem[]>(() => [
  { label: translate("features.customers.detail.tab_profile"), slot: "profile" as const, value: "profile" },
  {
    label: translate("features.customers.detail.tab_orders"),
    slot: "orders" as const,
    value: "orders",
    badge: orders.value ? { label: String(orders.value.total), color: "neutral", variant: "subtle" } : undefined,
  },
])
</script>

<template>
  <USlideover
    :title="fullName || translate('features.customers.detail.title')"
    :description="customer ? `@${customer.username}` : undefined"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div v-if="isPending" class="space-y-4">
        <div class="flex items-center gap-4">
          <USkeleton class="size-16 rounded-full" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-5 w-1/2" />
            <USkeleton class="h-4 w-1/3" />
          </div>
        </div>
        <USkeleton v-for="index in 4" :key="index" class="h-10 w-full" />
      </div>

      <QueryErrorAlert
        v-else-if="error"
        :title="translate('features.customers.load_error_title')"
        :error="error"
        @retry="refetch()"
        />

      <div v-else-if="customer" class="space-y-6">
        <div class="flex items-center gap-4">
          <UAvatar :src="customer.image" :alt="fullName" size="3xl" class="bg-elevated" />
          <div class="min-w-0">
            <p class="truncate text-lg font-semibold text-highlighted">{{ fullName }}</p>
            <div class="mt-1 flex items-center gap-2 text-sm text-muted">
              <UBadge
                :label="translate(`features.customers.roles.${customer.role}`)"
                :color="ROLE_BADGE_COLOR[customer.role]"
                variant="subtle"
                size="sm"
              />
              <span class="capitalize">{{ customer.gender }}, {{ customer.age }}</span>
            </div>
          </div>
        </div>

        <UTabs :items="tabs" default-value="profile" variant="link" class="w-full">
          <template #profile>
            <ul class="space-y-4 pt-2">
              <li v-for="field in profileFields" :key="field.label" class="flex gap-3">
                <UIcon :name="field.icon" class="mt-0.5 size-4 shrink-0 text-muted" />
                <div class="min-w-0 text-sm">
                  <p class="text-muted">{{ field.label }}</p>
                  <ULink v-if="field.href" :href="field.href" class="break-all text-default">{{ field.value }}</ULink>
                  <p v-else class="text-default">{{ field.value }}</p>
                </div>
              </li>
            </ul>
          </template>

          <template #orders>
            <div v-if="isLoadingOrders" class="space-y-3 pt-2">
              <USkeleton v-for="index in 3" :key="index" class="h-14 w-full" />
            </div>

            <p v-else-if="!orders?.carts.length" class="pt-2 text-sm text-muted">
              {{ translate("features.customers.detail.no_orders") }}
            </p>

            <template v-else>
              <div class="mb-3 flex items-baseline justify-between rounded-md bg-elevated px-4 py-3">
                <span class="text-sm text-muted">{{ translate("features.customers.detail.lifetime_value") }}</span>
                <span class="text-lg font-semibold text-highlighted tabular-nums">
                  {{ formatCurrency(orderSummary.revenue) }}
                </span>
              </div>

              <ul class="divide-y divide-default">
                <li v-for="order in orders.carts" :key="order.id" class="flex items-center justify-between gap-3 py-3">
                  <div class="flex items-center gap-3">
                    <UAvatarGroup size="sm" :max="3">
                      <UAvatar
                        v-for="line in order.products"
                        :key="line.id"
                        :src="line.thumbnail"
                        :alt="line.title"
                        class="bg-default"
                      />
                    </UAvatarGroup>
                    <div class="text-sm">
                      <p class="font-medium text-highlighted">
                        {{ translate("features.customers.detail.order_label", { id: order.id }) }}
                      </p>
                      <p class="text-muted">
                        {{ translate("features.customers.detail.order_items", { count: order.totalQuantity }) }}
                      </p>
                    </div>
                  </div>
                  <span class="text-sm font-medium text-highlighted tabular-nums">
                    {{ formatCurrency(order.discountedTotal) }}
                  </span>
                </li>
              </ul>
            </template>
          </template>
        </UTabs>
      </div>
    </template>
  </USlideover>
</template>
