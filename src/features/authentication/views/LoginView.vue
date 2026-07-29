<script setup lang="ts">
import * as v from "valibot";
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

import AuthenticationPageShell from "../components/AuthenticationPageShell.vue";
import { translate } from "@/plugins/language/index.ts";

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "remember",
    label: "Remember me",
    type: "checkbox",
  },
];

const schema = v.object({
  email: v.pipe(
    v.string("Email is required"),
    v.nonEmpty("Email is required"),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.nonEmpty("Password is required"),
    v.minLength(8, "Password must be at least 8 characters"),
  ),
});

type Schema = v.InferOutput<typeof schema>;

function onSubmit(event: FormSubmitEvent<Schema>) {
  // TODO: connect to authentication API
  console.log(event.data);
}
</script>

<template>
  <AuthenticationPageShell
    :title="translate('features.authentication.login.page_title')"
    :description="translate('features.authentication.login.page_description')"
  >
    <UAuthForm
      :schema="schema"
      :fields="fields"
      :submit="{ label: 'Sign in', block: true }"
      @submit="onSubmit"
    >
      <template #password-hint>
        <ULink to="/authentication/password/forget" class="text-sm font-medium text-primary">
          Forgot password?
        </ULink>
      </template>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Don't have an account?
          <ULink to="#" class="font-medium text-primary">Contact admin</ULink>
        </p>
      </template>
    </UAuthForm>
  </AuthenticationPageShell>
</template>
