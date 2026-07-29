import type { NuxtUIOptions } from "@nuxt/ui/vite";

/** Runtime app config — color mapping, icons, and per-component overrides. */
export type AppConfigUi = NonNullable<NuxtUIOptions["ui"]>;

type Variants = {
  defaultVariants: {
    size: "xl";
    variant: "soft";
  };
};

const defaultFieldVariant: Variants = {
  defaultVariants: {
    size: "xl",
    variant: "soft",
  },
};

export const nuxtConfigUi = {
  colors: {
    primary: "slate",
    neutral: "mist",
  },

  // Text input
  input: defaultFieldVariant,
  textarea: defaultFieldVariant,
  inputNumber: defaultFieldVariant,

  // Selects
  select: defaultFieldVariant,
  selectMenu: defaultFieldVariant,
  inputMenu: defaultFieldVariant,

  // Date & time
  datePicker: defaultFieldVariant,

  // Choice inputs
  checkbox: defaultFieldVariant,
  radioGroup: defaultFieldVariant,
  switch: defaultFieldVariant,

  // File upload
  fileUpload: defaultFieldVariant,

  button: {
    slots: {
      base: "!rounded-full cursor-pointer",
    },
    defaultVariants: {
      color: "primary",
      variant: "solid",
      size: "xl",
    },
  },

  // Reserve one line below inputs for validation errors so fields don't shift.
  formField: {
    slots: {
      container: "relative pb-5",
      error: "absolute inset-x-0 bottom-0 text-error animate-form-field-message-in",
      help: "absolute inset-x-0 bottom-0 text-muted animate-form-field-message-in",
    },
  },
} satisfies AppConfigUi;
