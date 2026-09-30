<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query"
import { computed, ref } from "vue"

import { translate } from "@/plugins/language"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"

import { getRecipe, recipeQueryKeys } from "../services/api"

/**
 * Recipe detail with a tickable ingredient list, opened through `useOverlay`.
 *
 * @remarks
 * Ticked ingredients live only as long as the modal is open.
 */
const { recipeId } = defineProps<{
  recipeId: number
}>()

const { data: recipe, isPending, error, refetch } = useQuery({
  queryKey: computed(() => recipeQueryKeys.detail(recipeId)),
  queryFn: () => getRecipe(recipeId),
})

const readyIngredients = ref<string[]>([])

const facts = computed(() => {
  if (!recipe.value) return []

  return [
    { label: translate("features.recipes.detail.prep"), value: translate("features.recipes.card.minutes", { count: recipe.value.prepTimeMinutes }) },
    { label: translate("features.recipes.detail.cook"), value: translate("features.recipes.card.minutes", { count: recipe.value.cookTimeMinutes }) },
    { label: translate("features.recipes.detail.servings"), value: String(recipe.value.servings) },
    { label: translate("features.recipes.detail.calories"), value: translate("features.recipes.detail.calories_value", { count: recipe.value.caloriesPerServing }) },
  ]
})
</script>

<template>
  <UModal
    :title="recipe?.name ?? ''"
    :description="recipe ? `${recipe.cuisine}, ${recipe.difficulty}` : undefined"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div v-if="isPending" class="space-y-4">
        <USkeleton class="aspect-[16/7] w-full rounded-lg" />
        <USkeleton class="h-16 w-full" />
        <USkeleton class="h-40 w-full" />
      </div>

      <QueryErrorAlert
        v-else-if="error"
        :title="translate('features.recipes.load_error_title')"
        :error="error"
        @retry="refetch()"
      />

      <div v-else-if="recipe" class="space-y-6">
        <img :src="recipe.image" :alt="recipe.name" class="aspect-[16/7] w-full rounded-lg object-cover" />

        <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-(--ui-border) sm:grid-cols-4">
          <div v-for="fact in facts" :key="fact.label" class="bg-default px-4 py-3">
            <dt class="text-xs text-muted">{{ fact.label }}</dt>
            <dd class="mt-0.5 font-semibold text-highlighted tabular-nums">{{ fact.value }}</dd>
          </div>
        </dl>

        <div class="grid gap-8 md:grid-cols-5">
          <section class="md:col-span-2" aria-labelledby="recipe-ingredients">
            <div class="mb-3 flex items-baseline justify-between gap-2">
              <h3 id="recipe-ingredients" class="font-semibold text-highlighted">
                {{ translate("features.recipes.detail.ingredients") }}
              </h3>
              <span class="text-xs text-muted tabular-nums" aria-live="polite">
                {{
                  translate("features.recipes.detail.ingredients_progress", {
                    done: readyIngredients.length,
                    total: recipe.ingredients.length,
                  })
                }}
              </span>
            </div>

            <UCheckboxGroup
              v-model="readyIngredients"
              :items="recipe.ingredients"
              size="md"
              :ui="{ fieldset: 'gap-2.5', label: 'font-normal', item: 'has-data-[state=checked]:line-through has-data-[state=checked]:text-muted' }"
            />
          </section>

          <section class="md:col-span-3" aria-labelledby="recipe-method">
            <h3 id="recipe-method" class="mb-3 font-semibold text-highlighted">
              {{ translate("features.recipes.detail.instructions") }}
            </h3>

            <ol class="space-y-4">
              <li v-for="(step, index) in recipe.instructions" :key="index" class="flex gap-3">
                <span
                  class="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold text-highlighted tabular-nums"
                  :aria-label="translate('features.recipes.detail.step', { number: index + 1 })"
                >
                  {{ index + 1 }}
                </span>
                <p class="text-sm leading-relaxed text-toned">{{ step }}</p>
              </li>
            </ol>
          </section>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge v-for="tag in recipe.tags" :key="tag" :label="tag" color="neutral" variant="subtle" />
        </div>
      </div>
    </template>
  </UModal>
</template>
