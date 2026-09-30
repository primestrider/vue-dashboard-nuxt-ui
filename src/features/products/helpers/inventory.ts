import { LOW_STOCK_THRESHOLD, type ProductListItem } from "../models"

/** Stock value held in one category. */
export type CategoryInventory = {
  category: string
  /** Sum of `price × stock` across the category. */
  value: number
  units: number
  products: number
}

/**
 * Groups products by category and ranks categories by the value of stock on hand.
 *
 * @param products - Products to aggregate.
 * @param limit - Maximum number of categories to return.
 * @returns Categories ordered from highest to lowest stock value.
 */
export const inventoryValueByCategory = (
  products: readonly ProductListItem[],
  limit = Number.POSITIVE_INFINITY,
): CategoryInventory[] => {
  const byCategory = new Map<string, CategoryInventory>()

  for (const product of products) {
    const entry = byCategory.get(product.category) ?? {
      category: product.category,
      value: 0,
      units: 0,
      products: 0,
    }

    entry.value += product.price * product.stock
    entry.units += product.stock
    entry.products += 1
    byCategory.set(product.category, entry)
  }

  return [...byCategory.values()]
    .map((entry) => ({ ...entry, value: Math.round(entry.value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/**
 * Lists products at or below the low-stock threshold, emptiest first.
 *
 * @param products - Products to scan.
 * @param limit - Maximum number of products to return.
 * @param threshold - Stock level considered low. Defaults to {@link LOW_STOCK_THRESHOLD}.
 */
export const lowStockProducts = (
  products: readonly ProductListItem[],
  limit = Number.POSITIVE_INFINITY,
  threshold = LOW_STOCK_THRESHOLD,
): ProductListItem[] =>
  products
    .filter((product) => product.stock <= threshold)
    .sort((a, b) => a.stock - b.stock || a.title.localeCompare(b.title))
    .slice(0, limit)
