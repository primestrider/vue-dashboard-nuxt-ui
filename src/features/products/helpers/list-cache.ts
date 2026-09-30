import type { ProductListItem } from "../models"
import type { ProductWriteResult } from "../services/api"

/**
 * Reduces a create/update response to the fields shown in list rows.
 *
 * @remarks
 * `POST /products/add` echoes only the submitted fields, so rating and
 * thumbnail fall back to empty values.
 */
export const toProductListItem = (product: ProductWriteResult): ProductListItem => ({
  id: product.id,
  title: product.title,
  category: product.category,
  price: product.price,
  discountPercentage: product.discountPercentage,
  rating: product.rating ?? 0,
  stock: product.stock,
  brand: product.brand,
  thumbnail: product.thumbnail ?? "",
})
