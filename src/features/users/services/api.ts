/**
 * User management API client backed by DummyJSON.
 *
 * @remarks
 * Writes are simulated by DummyJSON — see {@link requestDummyJson}.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { User, UserListItem, UserListParams, UserTodo } from "../models"
import type { UserPayload } from "../schemas/user.schema"

export type UserListResponse = DummyJsonList<"users", UserListItem>
export type UserTodoListResponse = DummyJsonList<"todos", UserTodo>

/** Fields requested for table rows, keeping the payload small. */
const LIST_FIELDS = "firstName,lastName,username,email,phone,age,gender,image,role"

/** TanStack Query keys for the users feature. */
export const userQueryKeys = {
  all: ["users"] as const,
  lists: () => [...userQueryKeys.all, "list"] as const,
  list: (params: UserListParams) => [...userQueryKeys.lists(), params] as const,
  detail: (id: number) => [...userQueryKeys.all, "detail", id] as const,
  todos: (id: number) => [...userQueryKeys.all, "todos", id] as const,
}

/**
 * Fetches one page of users.
 *
 * @param params - Pagination, search, and sort state from the list view.
 */
export const getUsers = (params: UserListParams): Promise<UserListResponse> => {
  const query = params.search.trim()

  return requestDummyJson<UserListResponse>({
    url: query ? "/users/search" : "/users",
    method: "GET",
    params: {
      ...(query ? { q: query } : {}),
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
      select: LIST_FIELDS,
      sortBy: params.sortBy,
      order: params.order,
    },
  })
}

/** Fetches a single user. */
export const getUser = (id: number): Promise<User> =>
  requestDummyJson<User>({ url: `/users/${id}`, method: "GET" })

/**
 * Record returned by create/update.
 *
 * @remarks
 * `POST /users/add` fills unknown fields with blanks, so image may be empty.
 */
export type UserWriteResult = Pick<User, "id"> & UserPayload & Partial<User>

/** Creates a user. */
export const createUser = (payload: UserPayload): Promise<UserWriteResult> =>
  requestDummyJson<UserWriteResult, UserPayload>({ url: "/users/add", method: "POST", data: payload })

/** Updates a user. */
export const updateUser = ({ id, payload }: { id: number; payload: UserPayload }): Promise<UserWriteResult> =>
  requestDummyJson<UserWriteResult, UserPayload>({ url: `/users/${id}`, method: "PUT", data: payload })

/** Deletes a user. DummyJSON returns the record flagged with `isDeleted`. */
export const deleteUser = (id: number): Promise<User & { isDeleted: boolean }> =>
  requestDummyJson<User & { isDeleted: boolean }>({ url: `/users/${id}`, method: "DELETE" })

/**
 * Deletes several users, one request each.
 *
 * @returns Ids that were deleted and ids whose request failed.
 */
export const deleteUsers = async (ids: readonly number[]): Promise<{ deleted: number[]; failed: number[] }> => {
  const results = await Promise.allSettled(ids.map((id) => deleteUser(id)))

  return results.reduce<{ deleted: number[]; failed: number[] }>(
    (acc, result, index) => {
      const id = ids[index]!
      if (result.status === "fulfilled") acc.deleted.push(id)
      else acc.failed.push(id)
      return acc
    },
    { deleted: [], failed: [] },
  )
}

/** Fetches every todo owned by a user. */
export const getUserTodos = (userId: number): Promise<UserTodoListResponse> =>
  requestDummyJson<UserTodoListResponse>({ url: `/todos/user/${userId}`, method: "GET", params: { limit: 0 } })

/** Marks a todo done or not done. */
export const setTodoCompleted = ({ id, completed }: { id: number; completed: boolean }): Promise<UserTodo> =>
  requestDummyJson<UserTodo, { completed: boolean }>({ url: `/todos/${id}`, method: "PUT", data: { completed } })
