import * as valibot from "valibot"

import { CUSTOMER_ROLES } from "@/features/customers/models"

import { USER_GENDERS } from "../models"

/**
 * Client-side validation schema for creating and editing a user.
 *
 * @remarks
 * The output is sent as-is to DummyJSON `POST /users/add` and `PUT /users/:id`.
 */
export const userSchema = valibot.object({
  firstName: valibot.pipe(
    valibot.string("First name is required"),
    valibot.trim(),
    valibot.nonEmpty("First name is required"),
    valibot.maxLength(50, "First name must be 50 characters or fewer"),
  ),
  lastName: valibot.pipe(
    valibot.string("Last name is required"),
    valibot.trim(),
    valibot.nonEmpty("Last name is required"),
    valibot.maxLength(50, "Last name must be 50 characters or fewer"),
  ),
  username: valibot.pipe(
    valibot.string("Username is required"),
    valibot.trim(),
    valibot.minLength(3, "Username must be at least 3 characters"),
    valibot.regex(/^[a-z0-9._]+$/i, "Use letters, numbers, dots, or underscores"),
  ),
  email: valibot.pipe(
    valibot.string("Email is required"),
    valibot.trim(),
    valibot.nonEmpty("Email is required"),
    valibot.email("Enter a valid email address"),
  ),
  phone: valibot.pipe(valibot.string(), valibot.trim()),
  age: valibot.pipe(
    valibot.number("Age is required"),
    valibot.integer("Age must be a whole number"),
    valibot.minValue(1, "Age must be at least 1"),
    valibot.maxValue(120, "Age must be 120 or less"),
  ),
  gender: valibot.picklist(USER_GENDERS, "Choose a gender"),
  role: valibot.picklist(CUSTOMER_ROLES, "Choose a role"),
})

export type UserFormInput = valibot.InferInput<typeof userSchema>

export type UserPayload = valibot.InferOutput<typeof userSchema>
