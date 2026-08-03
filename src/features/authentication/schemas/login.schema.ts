import * as valibot from "valibot"

/**
 * Client-side validation schema for the login form.
 *
 * @remarks
 * Used by `UForm` via the Standard Schema protocol.
 * Field names must match the reactive form state in {@link LoginView}.
 */
export const loginSchema = valibot.object({
  email: valibot.pipe(
    valibot.string("Email is required"),
    valibot.nonEmpty("Email is required"),
    valibot.email("Invalid email address"),
  ),
  password: valibot.pipe(
    valibot.string("Password is required"),
    valibot.nonEmpty("Password is required"),
    valibot.minLength(8, "Password must be at least 8 characters"),
  ),
  remember: valibot.optional(valibot.boolean()),
})

/** Inferred output type of {@link loginSchema}. */
export type LoginForm = valibot.InferOutput<typeof loginSchema>
