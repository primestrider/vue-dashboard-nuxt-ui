<script setup lang="ts">
import { reactive, useTemplateRef } from "vue";

import type { FormSubmitEvent } from "@nuxt/ui";

import AuthenticationPageShell from "../components/AuthenticationPageShell.vue";
import { translate } from "@/plugins/language";
import { loginSchema, type LoginForm } from "../schemas/login.schema.ts";
import { AuthenticationPageName } from "../models/index.ts";
import { usePasswordVisibility } from "@/shared/composables/usePasswordVisibility.ts";
import { useMutation } from "@tanstack/vue-query";
import { requestLogin } from "../services/api.ts";

/** Reference to the Nuxt UI form instance for programmatic error handling. */
const loginFormRef = useTemplateRef("loginFormRef");

/** Reactive form state validated by {@link loginSchema}. */
const loginForm = reactive<LoginForm>({
  email: "",
  password: "",
  remember: false,
});

/** Toggle state for the password field visibility button. */
const passwordVisibility = usePasswordVisibility();

/** Login mutation — wire `onSuccess` to persist tokens and redirect. */
const { mutate: mutateLogin, isPending } = useMutation({
  mutationFn: requestLogin,
  onSuccess: () => {},
  onError: () => {
    // loginFormRef.value?.setErrors([
    //   {
    //     name: "password",
    //     message: "Invalid",
    //   },
    // ]);
  },
});

/**
 * Handles validated form submission from `UForm`.
 *
 * @param payload - Validated form data emitted only when schema checks pass.
 */
const onSubmitLogin = ({ data }: FormSubmitEvent<LoginForm>) => {
  // mutateLogin(data);
  console.log(data);
};
</script>

<template>
  <AuthenticationPageShell
    :title="translate('features.authentication.login.page_title')"
    :description="translate('features.authentication.login.page_description')"
  >
    <UForm
      :schema="loginSchema"
      :state="loginForm"
      ref="loginFormRef"
      :disabled="isPending"
      class="space-y-4"
      @submit="onSubmitLogin"
    >
      <UFormField
        name="email"
        :label="translate('features.authentication.login.form.email.label')"
        required
      >
        <UInput
          v-model="loginForm.email"
          type="email"
          :placeholder="translate('features.authentication.login.form.email.placeholder')"
        />
      </UFormField>

      <UFormField name="password" label="Password" required>
        <template #hint>
          <ULink :to="{ name: AuthenticationPageName.FORGET_PASSWORD }">{{
            translate("features.authentication.login.form.forget_password_link")
          }}</ULink>
        </template>

        <UInput
          v-model="loginForm.password"
          :type="passwordVisibility.type"
          placeholder="Enter your password"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="passwordVisibility.icon"
              :aria-label="passwordVisibility.ariaLabel"
              :aria-pressed="passwordVisibility.visible"
              aria-controls="password"
              @click="passwordVisibility.toggle"
            /> </template
        ></UInput>
      </UFormField>

      <UCheckbox
        v-model="loginForm.remember"
        :label="translate('features.authentication.login.form.remember_me')"
      />

      <UButton
        class="mt-2"
        type="submit"
        block
        :label="translate('features.authentication.login.form.button_login')"
        :loading="isPending"
      />
    </UForm>
  </AuthenticationPageShell>
</template>
