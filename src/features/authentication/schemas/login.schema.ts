import * as valibot from "valibot";

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
});

export type LoginForm = valibot.InferOutput<typeof loginSchema>;
