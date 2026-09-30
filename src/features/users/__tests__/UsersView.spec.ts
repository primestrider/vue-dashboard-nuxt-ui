import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"
import { Permission } from "@/shared/models/access"

import * as postApi from "@/features/posts/services/api"

import UserActivitySlideover from "../components/UserActivitySlideover.vue"
import UserFormModal from "../components/UserFormModal.vue"
import type { UserListItem } from "../models"
import * as api from "../services/api"
import UsersListView from "../views/UsersListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getUsers: vi.fn<(...args: unknown[]) => unknown>(),
  createUser: vi.fn<(...args: unknown[]) => unknown>(),
  updateUser: vi.fn<(...args: unknown[]) => unknown>(),
  deleteUsers: vi.fn<(...args: unknown[]) => unknown>(),
  getUserTodos: vi.fn<(...args: unknown[]) => unknown>(),
  setTodoCompleted: vi.fn<(...args: unknown[]) => unknown>(),
}))

vi.mock("@/features/posts/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/posts/services/api")>()),
  getPostsByUser: vi.fn<(...args: unknown[]) => unknown>(),
}))

const user = (overrides: Partial<UserListItem> = {}): UserListItem => ({
  id: 1,
  firstName: "Emily",
  lastName: "Johnson",
  username: "emilys",
  email: "emily.johnson@x.dummyjson.com",
  phone: "+81 965-431-3024",
  age: 29,
  gender: "female",
  image: "",
  role: "admin",
  ...overrides,
})

const clickButton = async (root: { findAll: (selector: string) => { text: () => string; trigger: (event: string) => Promise<void> }[] }, label: string) => {
  await root.findAll("button").find((button) => button.text() === label)?.trigger("click")
  await settle()
}

afterEach(() => {
  vi.clearAllMocks()
})

describe("UsersListView", () => {
  beforeEach(() => {
    vi.mocked(api.getUsers).mockResolvedValue({
      users: [user(), user({ id: 2, firstName: "Michael", lastName: "Williams", username: "michaelw", role: "user" })],
      total: 208,
      skip: 0,
      limit: 10,
    })
  })

  it("renders users with username, age, and role", async () => {
    const { wrapper } = await renderWithPlugins(UsersListView)

    expect(wrapper.text()).toContain("Emily Johnson")
    expect(wrapper.text()).toContain("@emilys")
    expect(wrapper.text()).toContain("Admin")
    expect(wrapper.text()).toContain("1–10 of 208")
  })

  it("hides selection and write actions for read-only admins", async () => {
    const { wrapper } = await renderWithPlugins(UsersListView, { permissions: [Permission.USERS_READ] })

    expect(wrapper.find('[aria-label="Select all users on this page"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain("Add user")
  })

  it("bulk deletes the selected users after confirmation", async () => {
    vi.mocked(api.deleteUsers).mockResolvedValue({ deleted: [1, 2], failed: [] })
    const { wrapper, screen } = await renderWithPlugins(UsersListView)

    await wrapper.get('[aria-label="Select all users on this page"]').trigger("click")
    await settle()
    expect(wrapper.text()).toContain("2 selected")

    await clickButton(wrapper, "Delete selected")
    expect(screen.get('[role="dialog"]').text()).toContain("Delete 2 users?")

    await clickButton(screen, "Delete users")

    expect(vi.mocked(api.deleteUsers).mock.calls[0]?.[0]).toEqual([1, 2])
    expect(wrapper.text()).not.toContain("Emily Johnson")
    expect(wrapper.text()).toContain("of 206")
    expect(wrapper.text()).not.toContain("selected")
  })

  it("keeps the rows when the confirmation is cancelled", async () => {
    const { wrapper, screen } = await renderWithPlugins(UsersListView)

    await wrapper.get('[aria-label="Select Emily Johnson"]').trigger("click")
    await settle()
    await clickButton(wrapper, "Delete selected")
    await clickButton(screen, "Cancel")

    expect(api.deleteUsers).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain("Emily Johnson")
  })
})

describe("UserFormModal", () => {
  it("validates required identity fields", async () => {
    const { screen } = await renderWithPlugins(UserFormModal, { props: { open: true } })

    await screen.get("form#user-form").trigger("submit")
    await settle()

    expect(screen.text()).toContain("First name is required")
    expect(screen.text()).toContain("Username must be at least 3 characters")
    expect(screen.text()).toContain("Email is required")
    expect(api.createUser).not.toHaveBeenCalled()
  })

  it("creates a user and closes with the saved record", async () => {
    vi.mocked(api.createUser).mockImplementation(async (payload) => ({ id: 209, ...payload }))
    const { screen, component } = await renderWithPlugins(UserFormModal, { props: { open: true } })

    await screen.get('input[name="firstName"]').setValue("Ada")
    await screen.get('input[name="lastName"]').setValue("Lovelace")
    await screen.get('input[name="username"]').setValue("ada.l")
    await screen.get('input[name="email"]').setValue("ada@example.com")
    await screen.get("form#user-form").trigger("submit")
    await settle()

    expect(api.createUser).toHaveBeenCalledWith({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada.l",
      email: "ada@example.com",
      phone: "",
      age: 18,
      gender: "female",
      role: "user",
    })
    expect(component.emitted("close")?.[0]?.[0]).toMatchObject({ id: 209, username: "ada.l" })
  })

  it("prefills the form when editing", async () => {
    const { screen } = await renderWithPlugins(UserFormModal, { props: { open: true, user: user() } })

    expect(screen.text()).toContain("Edit user")
    expect((screen.get('input[name="email"]').element as HTMLInputElement).value).toBe("emily.johnson@x.dummyjson.com")
  })
})

describe("UserActivitySlideover", () => {
  beforeEach(() => {
    vi.mocked(postApi.getPostsByUser).mockResolvedValue({
      posts: [{ id: 61, title: "I'm going to hire help", body: "Body", tags: [], reactions: { likes: 1, dislikes: 0 }, views: 1200, userId: 1 }],
      total: 1,
      skip: 0,
      limit: 0,
    })
    vi.mocked(api.getUserTodos).mockResolvedValue({
      todos: [
        { id: 47, todo: "Learn Javascript", completed: false, userId: 1 },
        { id: 64, todo: "Listen to a new music genre", completed: true, userId: 1 },
      ],
      total: 2,
      skip: 0,
      limit: 0,
    })
  })

  const openTodos = async () => {
    const rendered = await renderWithPlugins(UserActivitySlideover, { props: { open: true, user: user() } })
    const tab = rendered.screen.findAll('[role="tab"]').find((item) => item.text().startsWith("Todos"))
    await tab?.trigger("mousedown", { button: 0 })
    await settle()
    return rendered
  }

  it("opens on the user's posts", async () => {
    const { screen } = await renderWithPlugins(UserActivitySlideover, { props: { open: true, user: user() } })

    expect(screen.text()).toContain("I'm going to hire help")
    expect(screen.text()).toContain("1,200 views")
  })

  it("marks a todo done immediately", async () => {
    vi.mocked(api.setTodoCompleted).mockImplementation(async ({ id, completed }) => ({ id, completed, todo: "", userId: 1 }))
    const { screen } = await openTodos()

    expect(screen.text()).toContain("1 of 2 done")

    await screen.findAll('[role="checkbox"]')[0]?.trigger("click")
    await settle()

    expect(vi.mocked(api.setTodoCompleted).mock.calls[0]?.[0]).toEqual({ id: 47, completed: true })
    expect(screen.text()).toContain("2 of 2 done")
  })

  it("rolls the todo back when the update fails", async () => {
    vi.mocked(api.setTodoCompleted).mockRejectedValue({ message: "Network Error" })
    const { screen } = await openTodos()

    await screen.findAll('[role="checkbox"]')[0]?.trigger("click")
    await settle()

    expect(screen.text()).toContain("1 of 2 done")
    expect(screen.text()).toContain("Todo wasn't updated")
  })
})
