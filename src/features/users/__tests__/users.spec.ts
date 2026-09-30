import * as valibot from "valibot"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestDummyJson } from "@/shared/services/dummyjson"

import { toUserListItem } from "../helpers/user-list"
import { userSchema, type UserFormInput } from "../schemas/user.schema"
import { deleteUsers, getUsers, setTodoCompleted } from "../services/api"

vi.mock("@/shared/services/dummyjson", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/services/dummyjson")>()),
  requestDummyJson: vi.fn<typeof requestDummyJson>(),
}))

const request = vi.mocked(requestDummyJson)

const validUser: UserFormInput = {
  firstName: " Emily ",
  lastName: "Johnson",
  username: "emilys",
  email: "emily@example.com",
  phone: "",
  age: 29,
  gender: "female",
  role: "admin",
}

const issuesFor = (input: Partial<Record<keyof UserFormInput, unknown>>) => {
  const result = valibot.safeParse(userSchema, { ...validUser, ...input })
  return result.success ? [] : result.issues.map((issue) => issue.message)
}

describe("userSchema", () => {
  it("accepts a valid user and trims names", () => {
    expect(valibot.parse(userSchema, validUser).firstName).toBe("Emily")
  })

  it("validates identity fields", () => {
    expect(issuesFor({ lastName: " " })).toContain("Last name is required")
    expect(issuesFor({ username: "ab" })).toContain("Username must be at least 3 characters")
    expect(issuesFor({ username: "emily s" })).toContain("Use letters, numbers, dots, or underscores")
    expect(issuesFor({ email: "not-an-email" })).toContain("Enter a valid email address")
  })

  it("keeps age a whole number between 1 and 120", () => {
    expect(issuesFor({ age: 0 })).toContain("Age must be at least 1")
    expect(issuesFor({ age: 121 })).toContain("Age must be 120 or less")
    expect(issuesFor({ age: 30.5 })).toContain("Age must be a whole number")
  })

  it("only accepts known genders and roles", () => {
    expect(issuesFor({ gender: "other" })).toContain("Choose a gender")
    expect(issuesFor({ role: "owner" })).toContain("Choose a role")
  })
})

describe("users service", () => {
  beforeEach(() => {
    request.mockReset()
  })

  it("lists users without a search term", async () => {
    request.mockResolvedValue({})

    await getUsers({ page: 1, limit: 10, search: " ", sortBy: "firstName", order: "asc" })

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/users", params: expect.not.objectContaining({ q: expect.anything() }) }),
    )
  })

  it("searches with a trimmed term", async () => {
    request.mockResolvedValue({})

    await getUsers({ page: 2, limit: 10, search: " emily ", sortBy: "age", order: "desc" })

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/users/search",
        params: expect.objectContaining({ q: "emily", skip: 10, sortBy: "age", order: "desc" }),
      }),
    )
  })

  it("reports which bulk deletes succeeded and which failed", async () => {
    request.mockImplementation(async (config) => {
      if (config.url === "/users/2") throw { message: "Not found", status: 404 }
      return {}
    })

    await expect(deleteUsers([1, 2, 3])).resolves.toEqual({ deleted: [1, 3], failed: [2] })
    expect(request).toHaveBeenCalledTimes(3)
  })

  it("sends only the completed flag when toggling a todo", async () => {
    request.mockResolvedValue({})

    await setTodoCompleted({ id: 5, completed: true })

    expect(request).toHaveBeenCalledWith({ url: "/todos/5", method: "PUT", data: { completed: true } })
  })
})

describe("toUserListItem", () => {
  it("defaults the avatar for create responses without an image", () => {
    expect(toUserListItem({ id: 209, ...valibot.parse(userSchema, validUser) }).image).toBe("")
  })
})
