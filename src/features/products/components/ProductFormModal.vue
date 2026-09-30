<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import { useMutation, useQuery } from "@tanstack/vue-query"
import { computed, reactive, watch } from "vue"

import { translate } from "@/plugins/language"
import { getApiErrorMessage } from "@/shared/helpers/error"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"

import type { ProductCategory } from "../models"
import { productSchema, type ProductFormInput, type ProductPayload } from "../schemas/product.schema"
import {
  createProduct,
  getProduct,
  productQueryKeys,
  updateProduct,
  type ProductWriteResult,
} from "../services/api"

/**
 * Create/edit product modal, opened through `useOverlay`.
 *
 * @remarks
 * Emits `close(result)` with the saved record, or `close(undefined)` when dismissed.
 * In edit mode the full product is fetched first so fields missing from list
 * rows (e.g. description) are not overwritten with blanks.
 */
const { productId, categories } = defineProps<{
  /** Product to edit. Omit to create a new product. */
  productId?: number
  categories: ProductCategory[]
}>()

const emit = defineEmits<{
  close: [result: ProductWriteResult | undefined]
}>()

const isEditing = computed(() => productId !== undefined)
const { showToast } = useAppToast()

const formState = reactive<ProductFormInput>({
  title: "",
  description: "",
  category: "",
  brand: "",
  price: 0,
  discountPercentage: 0,
  stock: 0,
})

const categoryItems = computed(() =>
  categories.map((category) => ({ label: category.name, value: category.slug })),
)

const { data: product, isPending: isLoadingProduct } = useQuery({
  queryKey: computed(() => productQueryKeys.detail(productId ?? 0)),
  queryFn: () => getProduct(productId!),
  enabled: isEditing,
})

watch(
  product,
  (value) => {
    if (!value) return

    Object.assign(formState, {
      title: value.title,
      description: value.description,
      category: value.category,
      brand: value.brand ?? "",
      price: value.price,
      discountPercentage: value.discountPercentage,
      stock: value.stock,
    } satisfies ProductFormInput)
  },
  { immediate: true },
)

const { mutate: saveProduct, isPending: isSaving } = useMutation({
  mutationFn: (payload: ProductPayload) =>
    productId === undefined ? createProduct(payload) : updateProduct({ id: productId, payload }),
  onSuccess: (result) => emit("close", result),
  onError: (error) => {
    showToast.error({
      title: translate("features.products.toast.failed"),
      description: getApiErrorMessage(error),
    })
  },
})

const onSubmit = ({ data }: FormSubmitEvent<ProductPayload>) => saveProduct(data)
</script>

<template>
  <UModal
    :title="isEditing ? translate('features.products.form.edit_title') : translate('features.products.form.create_title')"
    :dismissible="!isSaving"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <div v-if="isEditing && isLoadingProduct" class="space-y-4">
        <USkeleton v-for="index in 4" :key="index" class="h-12 w-full" />
      </div>

      <UForm
        v-else
        id="product-form"
        :schema="productSchema"
        :state="formState"
        :disabled="isSaving"
        class="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-6"
        @submit="onSubmit"
      >
        <UFormField name="title" :label="translate('features.products.form.title')" required class="sm:col-span-6">
          <UInput v-model="formState.title" autofocus />
        </UFormField>

        <UFormField name="category" :label="translate('features.products.form.category')" required class="sm:col-span-3">
          <USelectMenu v-model="formState.category" :items="categoryItems" value-key="value" />
        </UFormField>

        <UFormField name="brand" :label="translate('features.products.form.brand')" class="sm:col-span-3">
          <UInput v-model="formState.brand" />
        </UFormField>

        <UFormField name="price" :label="translate('features.products.form.price')" required class="sm:col-span-2">
          <UInputNumber
            v-model="formState.price"
            :min="0"
            :step="0.01"
            :format-options="{ minimumFractionDigits: 2, maximumFractionDigits: 2 }"
          />
        </UFormField>

        <UFormField name="discountPercentage" :label="translate('features.products.form.discount')" class="sm:col-span-2">
          <UInputNumber v-model="formState.discountPercentage" :min="0" :max="100" :step="0.5" />
        </UFormField>

        <UFormField name="stock" :label="translate('features.products.form.stock')" required class="sm:col-span-2">
          <UInputNumber v-model="formState.stock" :min="0" />
        </UFormField>

        <UFormField name="description" :label="translate('features.products.form.description')" class="sm:col-span-6">
          <UTextarea v-model="formState.description" :rows="3" autoresize :maxrows="6" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          size="lg"
          :label="translate('utils.common.cancel')"
          :disabled="isSaving"
          @click="emit('close', undefined)"
        />
        <UButton
          type="submit"
          form="product-form"
          size="lg"
          :loading="isSaving"
          :disabled="isEditing && isLoadingProduct"
          :label="isEditing ? translate('features.products.form.submit_edit') : translate('features.products.form.submit_create')"
        />
      </div>
    </template>
  </UModal>
</template>
