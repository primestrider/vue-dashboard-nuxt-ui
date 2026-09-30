import type { SortOrder } from "@/shared/models/dummyjson"

export enum PostsPageName {
  POSTS_LIST = "PostsList",
}

/** Post record returned by `GET /posts`. */
export type Post = {
  id: number
  title: string
  body: string
  tags: string[]
  reactions: {
    likes: number
    dislikes: number
  }
  views: number
  userId: number
}

/** Tag entry returned by `GET /posts/tags`. */
export type PostTag = {
  slug: string
  name: string
  url: string
}

/** Comment returned by `GET /posts/:id/comments` and `POST /comments/add`. */
export type PostComment = {
  id: number
  body: string
  postId: number
  likes?: number
  user: {
    id: number
    username: string
    fullName: string
  }
}

export type PostSortField = "id" | "views" | "title"

export type PostListParams = {
  page: number
  limit: number
  /** Free-text search. Takes precedence over {@link PostListParams.tag}. */
  search: string
  /** Tag slug, or empty for every tag. */
  tag: string
  sortBy: PostSortField
  order: SortOrder
}

/**
 * DummyJSON user that new comments are posted as.
 *
 * @remarks
 * The app has no DummyJSON session, so comments are attributed to this demo
 * account. Replace with the signed-in user's id once auth is wired.
 */
export const DEMO_COMMENTER_ID = 1
