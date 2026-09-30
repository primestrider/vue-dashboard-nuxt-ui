import * as valibot from "valibot"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { requestDummyJson } from "@/shared/services/dummyjson"

import { COMMENT_MAX_LENGTH, commentSchema } from "../schemas/comment.schema"
import { addComment, getPostComments, getPosts, resolvePostListUrl } from "../services/api"

vi.mock("@/shared/services/dummyjson", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/services/dummyjson")>()),
  requestDummyJson: vi.fn<typeof requestDummyJson>().mockResolvedValue({}),
}))

const request = vi.mocked(requestDummyJson)

describe("resolvePostListUrl", () => {
  it("lists every post without filters", () => {
    expect(resolvePostListUrl({ search: "", tag: "" })).toEqual({ url: "/posts", params: {} })
  })

  it("filters by tag slug", () => {
    expect(resolvePostListUrl({ search: "", tag: "love" }).url).toBe("/posts/tag/love")
  })

  it("lets search win over the tag", () => {
    expect(resolvePostListUrl({ search: " love ", tag: "history" })).toEqual({
      url: "/posts/search",
      params: { q: "love" },
    })
  })
})

describe("posts service", () => {
  beforeEach(() => {
    request.mockClear()
  })

  it("requests the selected page with sorting", async () => {
    await getPosts({ page: 3, limit: 10, search: "", tag: "", sortBy: "views", order: "desc" })

    expect(request).toHaveBeenCalledWith({
      url: "/posts",
      method: "GET",
      params: { limit: 10, skip: 20, sortBy: "views", order: "desc" },
    })
  })

  it("loads every comment of a post", async () => {
    await getPostComments(7)

    expect(request).toHaveBeenCalledWith({ url: "/posts/7/comments", method: "GET", params: { limit: 0 } })
  })

  it("posts a comment with its author and post", async () => {
    await addComment({ body: "Nice", postId: 7, userId: 1 })

    expect(request).toHaveBeenCalledWith({
      url: "/comments/add",
      method: "POST",
      data: { body: "Nice", postId: 7, userId: 1 },
    })
  })
})

describe("commentSchema", () => {
  it("trims the comment", () => {
    expect(valibot.parse(commentSchema, { body: "  hello  " })).toEqual({ body: "hello" })
  })

  it("rejects blank and overly long comments", () => {
    expect(valibot.safeParse(commentSchema, { body: "   " }).success).toBe(false)
    expect(valibot.safeParse(commentSchema, { body: "a".repeat(COMMENT_MAX_LENGTH + 1) }).success).toBe(false)
    expect(valibot.safeParse(commentSchema, { body: "a".repeat(COMMENT_MAX_LENGTH) }).success).toBe(true)
  })
})
