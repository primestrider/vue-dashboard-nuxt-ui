import type { SortOrder } from "@/shared/models/dummyjson"

export enum ProductsPageName {
  PRODUCTS_LIST = "ProductsList",
}

/** Customer review embedded in a DummyJSON product. */
export type ProductReview = {
  rating: number
  comment: string
  date: string
  reviewerName: string
  reviewerEmail: string
}

/** Product record returned by `GET /products/:id`. */
export type Product = {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand?: string
  sku: string
  weight: number
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  returnPolicy: string
  minimumOrderQuantity: number
  reviews: ProductReview[]
  images: string[]
  thumbnail: string
}

/** Subset of product fields rendered by the list table. */
export type ProductListItem = Pick<
  Product,
  | "id"
  | "title"
  | "category"
  | "price"
  | "discountPercentage"
  | "rating"
  | "stock"
  | "brand"
  | "thumbnail"
>

/** Category entry returned by `GET /products/categories`. */
export type ProductCategory = {
  slug: string
  name: string
  url: string
}

export type ProductSortField = "title" | "price" | "rating" | "stock"

/** Filters and pagination state owned by the products list view. */
export type ProductListParams = {
  page: number
  limit: number
  /** Free-text search. Takes precedence over {@link ProductListParams.category}. */
  search: string
  /** Category slug, or empty for every category. */
  category: string
  sortBy: ProductSortField
  order: SortOrder
}

/** Products at or below this stock level are flagged as running low. */
export const LOW_STOCK_THRESHOLD = 10
