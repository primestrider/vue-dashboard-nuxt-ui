import { describe, expect, it } from "vitest"

import type { DummyJsonList } from "@/shared/models/dummyjson"

import { prependToList, removeFromList, replaceInList } from "../helpers/list-cache"

type Row = { id: number; name: string }

const page = (rows: Row[], total = rows.length, limit = rows.length): DummyJsonList<"rows", Row> => ({
  rows,
  total,
  skip: 0,
  limit,
})

describe("list cache updaters", () => {
  it("leave an empty cache untouched", () => {
    expect(replaceInList<"rows", Row>(undefined, "rows", { id: 1, name: "a" })).toBeUndefined()
    expect(prependToList<"rows", Row>(undefined, "rows", { id: 1, name: "a" })).toBeUndefined()
    expect(removeFromList<"rows", Row>(undefined, "rows", 1)).toBeUndefined()
  })

  it("replaces only the matching record without mutating the original", () => {
    const original = page([{ id: 1, name: "a" }, { id: 2, name: "old" }])

    const updated = replaceInList(original, "rows", { id: 2, name: "new" })

    expect(updated?.rows.map((row) => row.name)).toEqual(["a", "new"])
    expect(original.rows[1]?.name).toBe("old")
  })

  it("prepends a record, keeps the page size, and bumps the total", () => {
    const original = page([{ id: 1, name: "a" }, { id: 2, name: "b" }], 30, 2)

    const updated = prependToList(original, "rows", { id: 99, name: "new" })

    expect(updated?.rows.map((row) => row.id)).toEqual([99, 1])
    expect(updated?.total).toBe(31)
  })

  it("removes one or many records and lowers the total by what was actually removed", () => {
    const original = page([{ id: 1, name: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }], 30)

    expect(removeFromList(original, "rows", 2)?.total).toBe(29)
    expect(removeFromList(original, "rows", [1, 3, 404])?.rows.map((row) => row.id)).toEqual([2])
    expect(removeFromList(original, "rows", [1, 3, 404])?.total).toBe(28)
    expect(removeFromList(original, "rows", 404)?.total).toBe(30)
  })
})
