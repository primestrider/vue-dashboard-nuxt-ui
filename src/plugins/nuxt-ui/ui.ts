import type { NuxtUIOptions } from "@nuxt/ui/vite";

/** Runtime app config — color mapping, icons, and per-component overrides. */
export type AppConfigUi = NonNullable<NuxtUIOptions["ui"]>;

type FieldVariants = {
  slots: {
    root?: string;
  };
  defaultVariants: {
    size: "xl";
    variant: "soft";
  };
};

const defaultFieldVariant: FieldVariants = {
  slots: {
    root: "!w-full",
  },
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

  // Selects — `Select` and `SelectMenu` have no `root` slot (their outer element is `base`),
  // so they only take the shared size/variant defaults.
  select: { defaultVariants: defaultFieldVariant.defaultVariants },
  selectMenu: { defaultVariants: defaultFieldVariant.defaultVariants },
  inputMenu: defaultFieldVariant,

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

  link: {
    variants: {
      active: {
        true: "text-sky-600",
        false: "text-muted text-sky-600",
      },
    },
  },
} satisfies AppConfigUi;
