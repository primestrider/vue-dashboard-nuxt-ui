/**
 * Pagination and sorting query parameters accepted by DummyJSON list endpoints.
 *
 * @see https://dummyjson.com/docs
 */
export type DummyJsonListQuery = {
  /** Page size. `0` returns every record. */
  limit: number
  /** Number of records to skip from the start of the collection. */
  skip: number
  /** Comma-separated list of fields to return. */
  select?: string
  sortBy?: string
  order?: "asc" | "desc"
}

/**
 * List envelope returned by DummyJSON, where the collection key varies per
 * resource (`products`, `users`, `carts`).
 *
 * @typeParam Key - Collection key, e.g. `"products"`.
 * @typeParam Item - Record shape inside the collection.
 */
export type DummyJsonList<Key extends string, Item> = {
  [K in Key]: Item[]
} & {
  total: number
  skip: number
  limit: number
}

/** Sort direction used by list views. */
export type SortOrder = "asc" | "desc"
