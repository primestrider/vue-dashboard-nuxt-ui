/**
 * Posts and comments API client backed by DummyJSON.
 *
 * @remarks
 * Adding a comment is simulated by DummyJSON — see {@link requestDummyJson}.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { Post, PostComment, PostListParams, PostTag } from "../models"

export type PostListResponse = DummyJsonList<"posts", Post>
export type PostCommentListResponse = DummyJsonList<"comments", PostComment>

/** TanStack Query keys for the posts feature. */
export const postQueryKeys = {
  all: ["posts"] as const,
  list: (params: PostListParams) => [...postQueryKeys.all, "list", params] as const,
  tags: () => [...postQueryKeys.all, "tags"] as const,
  comments: (postId: number) => [...postQueryKeys.all, "comments", postId] as const,
  byUser: (userId: number) => [...postQueryKeys.all, "user", userId] as const,
}

/**
 * Resolves which DummyJSON endpoint serves a list request.
 *
 * @remarks
 * Search wins over the tag filter because DummyJSON cannot combine them.
 */
export const resolvePostListUrl = ({
  search,
  tag,
}: Pick<PostListParams, "search" | "tag">): { url: string; params: { q?: string } } => {
  const query = search.trim()

  if (query) {
    return { url: "/posts/search", params: { q: query } }
  }

  if (tag) {
    return { url: `/posts/tag/${encodeURIComponent(tag)}`, params: {} }
  }

  return { url: "/posts", params: {} }
}

/**
 * Fetches one page of posts.
 *
 * @param params - Pagination, filter, and sort state from the list view.
 */
export const getPosts = (params: PostListParams): Promise<PostListResponse> => {
  const { url, params: filterParams } = resolvePostListUrl(params)

  return requestDummyJson<PostListResponse>({
    url,
    method: "GET",
    params: {
      ...filterParams,
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
      sortBy: params.sortBy,
      order: params.order,
    },
  })
}

/** Fetches every post tag. */
export const getPostTags = (): Promise<PostTag[]> =>
  requestDummyJson<PostTag[]>({ url: "/posts/tags", method: "GET" })

/** Fetches every comment on a post. */
export const getPostComments = (postId: number): Promise<PostCommentListResponse> =>
  requestDummyJson<PostCommentListResponse>({
    url: `/posts/${postId}/comments`,
    method: "GET",
    params: { limit: 0 },
  })

/** Fetches every post written by one user. */
export const getPostsByUser = (userId: number): Promise<PostListResponse> =>
  requestDummyJson<PostListResponse>({ url: `/posts/user/${userId}`, method: "GET", params: { limit: 0 } })

export type AddCommentPayload = {
  body: string
  postId: number
  userId: number
}

/** Adds a comment to a post. */
export const addComment = (payload: AddCommentPayload): Promise<PostComment> =>
  requestDummyJson<PostComment, AddCommentPayload>({ url: "/comments/add", method: "POST", data: payload })
