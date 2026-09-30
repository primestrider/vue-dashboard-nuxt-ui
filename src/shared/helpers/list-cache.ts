/**
 * Immutable updaters for cached DummyJSON list pages.
 *
 * @remarks
 * DummyJSON does not persist writes, so a refetch would discard them. These
 * updaters patch the TanStack Query cache so a list reflects the response of
 * a successful write until the data goes stale.
 *
 * @example
 * ```ts
 * queryClient.setQueriesData<UserListResponse>({ queryKey: ["users", "list"] }, (list) =>
 *   removeFromList(list, "users", deletedId),
 * )
 * ```
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"

type Identified = { id: number }

/** Replaces the record with a matching id, keeping every other record untouched. */
export const replaceInList = <Key extends string, Item extends Identified>(
  list: DummyJsonList<Key, Item> | undefined,
  key: Key,
  item: Item,
): DummyJsonList<Key, Item> | undefined => {
  if (!list) return list

  return {
    ...list,
    [key]: list[key].map((current) => (current.id === item.id ? { ...current, ...item } : current)),
  } as DummyJsonList<Key, Item>
}

/** Adds a record to the top of the page, trimming the page back to `limit` records. */
export const prependToList = <Key extends string, Item extends Identified>(
  list: DummyJsonList<Key, Item> | undefined,
  key: Key,
  item: Item,
): DummyJsonList<Key, Item> | undefined => {
  if (!list) return list

  return {
    ...list,
    [key]: [item, ...list[key]].slice(0, Math.max(list.limit, 1)),
    total: list.total + 1,
  } as DummyJsonList<Key, Item>
}

/** Removes the records with the given ids and lowers the total by the number removed. */
export const removeFromList = <Key extends string, Item extends Identified>(
  list: DummyJsonList<Key, Item> | undefined,
  key: Key,
  ids: number | readonly number[],
): DummyJsonList<Key, Item> | undefined => {
  if (!list) return list

  const idSet = new Set(typeof ids === "number" ? [ids] : ids)
  const items = list[key].filter((current) => !idSet.has(current.id))
  const removed = list[key].length - items.length

  return {
    ...list,
    [key]: items,
    total: Math.max(list.total - removed, 0),
  } as DummyJsonList<Key, Item>
}
