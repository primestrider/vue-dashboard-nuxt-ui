import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithPlugins, settle } from "@/__tests__/render"

import * as customerApi from "@/features/customers/services/api"

import PostDetailSlideover from "../components/PostDetailSlideover.vue"
import type { Post } from "../models"
import * as api from "../services/api"
import PostsListView from "../views/PostsListView.vue"

vi.mock("../services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../services/api")>()),
  getPosts: vi.fn<(...args: unknown[]) => unknown>(),
  getPostTags: vi.fn<(...args: unknown[]) => unknown>(),
  getPostComments: vi.fn<(...args: unknown[]) => unknown>(),
  addComment: vi.fn<(...args: unknown[]) => unknown>(),
}))

vi.mock("@/features/customers/services/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/customers/services/api")>()),
  getCustomerDirectory: vi.fn<(...args: unknown[]) => unknown>(),
}))

const post: Post = {
  id: 1,
  title: "His mother had always taught him",
  body: "His mother had always taught him not to ever think of himself as better than others.",
  tags: ["history", "crime"],
  reactions: { likes: 192, dislikes: 25 },
  views: 3050,
  userId: 121,
}

const author = { id: 121, firstName: "Brandon", lastName: "Young", email: "brandon@x.dev", image: "" }

afterEach(() => {
  vi.clearAllMocks()
})

describe("PostsListView", () => {
  beforeEach(() => {
    vi.mocked(api.getPostTags).mockResolvedValue([{ slug: "history", name: "History", url: "" }])
    vi.mocked(api.getPosts).mockResolvedValue({
      posts: [post, { ...post, id: 2, title: "Orphan post", userId: 9999 }],
      total: 251,
      skip: 0,
      limit: 10,
    })
    vi.mocked(customerApi.getCustomerDirectory).mockResolvedValue([author])
  })

  it("renders posts with authors, stats, and tags", async () => {
    const { wrapper } = await renderWithPlugins(PostsListView)

    const [first, second] = wrapper.findAll("ol > li")
    expect(first?.text()).toContain("Brandon Young")
    expect(first?.text()).toContain("His mother had always taught him")
    expect(first?.text()).toContain("3,050 views")
    expect(first?.text()).toContain("192 likes")
    expect(first?.text()).toContain("history")
    expect(second?.text()).toContain("User #9999")
  })

  it("loads newest posts first", async () => {
    await renderWithPlugins(PostsListView)

    expect(api.getPosts).toHaveBeenCalledWith(expect.objectContaining({ sortBy: "id", order: "desc", tag: "" }))
  })

  it("opens a post with its author", async () => {
    vi.mocked(api.getPostComments).mockResolvedValue({ comments: [], total: 0, skip: 0, limit: 0 })
    const { wrapper, screen } = await renderWithPlugins(PostsListView)

    await wrapper.get("ol > li h2 button").trigger("click")
    await settle()

    const panel = screen.get('[role="dialog"]')
    expect(panel.text()).toContain(post.body)
    expect(panel.text()).toContain("brandon@x.dev")
    expect(api.getPostComments).toHaveBeenCalledWith(1)
  })
})

describe("PostDetailSlideover", () => {
  beforeEach(() => {
    vi.mocked(api.getPostComments).mockResolvedValue({
      comments: [{ id: 93, body: "These are fabulous ideas!", postId: 1, likes: 7, user: { id: 190, username: "leahw", fullName: "Leah Gutierrez" } }],
      total: 1,
      skip: 0,
      limit: 0,
    })
  })

  it("lists existing comments", async () => {
    const { screen } = await renderWithPlugins(PostDetailSlideover, { props: { open: true, post, author } })

    expect(screen.get("#post-comments").text()).toBe("Comments (1)")
    expect(screen.text()).toContain("Leah Gutierrez")
    expect(screen.text()).toContain("These are fabulous ideas!")
  })

  it("rejects an empty comment", async () => {
    const { screen } = await renderWithPlugins(PostDetailSlideover, { props: { open: true, post, author } })

    await screen.get("form").trigger("submit")
    await settle()

    expect(screen.text()).toContain("Write a comment first")
    expect(api.addComment).not.toHaveBeenCalled()
  })

  it("posts a comment and appends it to the thread", async () => {
    vi.mocked(api.addComment).mockResolvedValue({
      id: 341,
      body: "Great read",
      postId: 1,
      user: { id: 1, username: "emilys", fullName: "Emily Johnson" },
    })
    const { screen } = await renderWithPlugins(PostDetailSlideover, { props: { open: true, post, author } })

    await screen.get("textarea").setValue("  Great read ")
    expect(screen.text()).toContain("13/280")

    await screen.get("form").trigger("submit")
    await settle()

    expect(api.addComment).toHaveBeenCalledWith({ body: "Great read", postId: 1, userId: 1 })
    expect(screen.get("#post-comments").text()).toBe("Comments (2)")
    expect(screen.text()).toContain("Emily Johnson")
    expect((screen.get("textarea").element as HTMLTextAreaElement).value).toBe("")
  })
})
