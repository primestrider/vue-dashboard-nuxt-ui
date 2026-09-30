<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import { useMutation } from "@tanstack/vue-query"
import { computed, reactive } from "vue"

import { translate } from "@/plugins/language"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"
import { getApiErrorMessage } from "@/shared/helpers/error"

import { CUSTOMER_ROLES } from "@/features/customers/models"

import { USER_GENDERS, type UserGender, type UserListItem } from "../models"
import { userSchema, type UserFormInput, type UserPayload } from "../schemas/user.schema"
import { createUser, updateUser, type UserWriteResult } from "../services/api"

/**
 * Create/edit user modal, opened through `useOverlay`.
 *
 * @remarks
 * Emits `close(result)` with the saved record, or `close(undefined)` when dismissed.
 * Every editable field is part of the list row, so edit mode needs no extra fetch.
 */
const { user } = defineProps<{
  /** User to edit. Omit to create a new user. */
  user?: UserListItem
}>()

const emit = defineEmits<{
  close: [result: UserWriteResult | undefined]
}>()

const { showToast } = useAppToast()

const isKnownGender = (value: string): value is UserGender => (USER_GENDERS as readonly string[]).includes(value)

const formState = reactive<UserFormInput>({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  username: user?.username ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  age: user?.age ?? 18,
  gender: user && isKnownGender(user.gender) ? user.gender : "female",
  role: user?.role ?? "user",
})

const genderItems = computed(() =>
  USER_GENDERS.map((gender) => ({ label: translate(`features.users.genders.${gender}`), value: gender })),
)
const roleItems = computed(() =>
  CUSTOMER_ROLES.map((role) => ({ label: translate(`features.customers.roles.${role}`), value: role })),
)

const { mutate: saveUser, isPending: isSaving } = useMutation({
  mutationFn: (payload: UserPayload) => (user ? updateUser({ id: user.id, payload }) : createUser(payload)),
  onSuccess: (result) => emit("close", result),
  onError: (error) => {
    showToast.error({ title: translate("features.users.toast.failed"), description: getApiErrorMessage(error) })
  },
})

const onSubmit = ({ data }: FormSubmitEvent<UserPayload>) => saveUser(data)
</script>

<template>
  <UModal
    :title="user ? translate('features.users.form.edit_title') : translate('features.users.form.create_title')"
    :dismissible="!isSaving"
    :ui="{ content: 'sm:max-w-xl' }"
  >
    <template #body>
      <UForm
        id="user-form"
        :schema="userSchema"
        :state="formState"
        :disabled="isSaving"
        class="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="firstName" :label="translate('features.users.form.first_name')" required>
          <UInput v-model="formState.firstName" autocomplete="given-name" autofocus />
        </UFormField>

        <UFormField name="lastName" :label="translate('features.users.form.last_name')" required>
          <UInput v-model="formState.lastName" autocomplete="family-name" />
        </UFormField>

        <UFormField name="username" :label="translate('features.users.form.username')" required>
          <UInput v-model="formState.username" autocomplete="off">
            <template #leading><span class="text-muted">@</span></template>
          </UInput>
        </UFormField>

        <UFormField name="email" :label="translate('features.users.form.email')" required>
          <UInput v-model="formState.email" type="email" autocomplete="email" />
        </UFormField>

        <UFormField name="phone" :label="translate('features.users.form.phone')">
          <UInput v-model="formState.phone" type="tel" autocomplete="tel" />
        </UFormField>

        <UFormField name="age" :label="translate('features.users.form.age')" required>
          <UInputNumber v-model="formState.age" :min="1" :max="120" />
        </UFormField>

        <UFormField name="gender" :label="translate('features.users.form.gender')" required>
          <URadioGroup v-model="formState.gender" :items="genderItems" orientation="horizontal" size="md" class="py-2" />
        </UFormField>

        <UFormField name="role" :label="translate('features.users.form.role')" required>
          <USelect v-model="formState.role" :items="roleItems" />
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
          form="user-form"
          size="lg"
          :loading="isSaving"
          :label="user ? translate('features.users.form.submit_edit') : translate('features.users.form.submit_create')"
        />
      </div>
    </template>
  </UModal>
</template>
