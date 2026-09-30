/**
 * Products API client backed by DummyJSON.
 *
 * @remarks
 * Writes are simulated by DummyJSON — see {@link requestDummyJson}.
 */

import type { DummyJsonList } from "@/shared/models/dummyjson"
import { pageToSkip, requestDummyJson } from "@/shared/services/dummyjson"

import type { Product, ProductCategory, ProductListItem, ProductListParams } from "../models"
import type { ProductPayload } from "../schemas/product.schema"

export type ProductListResponse = DummyJsonList<"products", ProductListItem>

/** Fields requested for list rows, keeping the payload small. */
const LIST_FIELDS = "title,category,price,discountPercentage,rating,stock,brand,thumbnail"

/** TanStack Query keys for the products feature. */
export const productQueryKeys = {
  all: ["products"] as const,
  lists: () => [...productQueryKeys.all, "list"] as const,
  list: (params: ProductListParams) => [...productQueryKeys.lists(), params] as const,
  detail: (id: number) => [...productQueryKeys.all, "detail", id] as const,
  categories: () => [...productQueryKeys.all, "categories"] as const,
  catalogue: () => [...productQueryKeys.all, "catalogue"] as const,
}

/**
 * Resolves which DummyJSON endpoint serves a list request.
 *
 * @remarks
 * DummyJSON cannot combine search with a category filter, so search wins.
 */
export const resolveProductListUrl = ({
  search,
  category,
}: Pick<ProductListParams, "search" | "category">): { url: string; params: { q?: string } } => {
  const query = search.trim()

  if (query) {
    return { url: "/products/search", params: { q: query } }
  }

  if (category) {
    return { url: `/products/category/${encodeURIComponent(category)}`, params: {} }
  }

  return { url: "/products", params: {} }
}

/**
 * Fetches one page of products.
 *
 * @param params - Pagination, filter, and sort state from the list view.
 */
export const getProducts = (params: ProductListParams): Promise<ProductListResponse> => {
  const { url, params: filterParams } = resolveProductListUrl(params)

  return requestDummyJson<ProductListResponse>({
    url,
    method: "GET",
    params: {
      ...filterParams,
      limit: params.limit,
      skip: pageToSkip(params.page, params.limit),
      select: LIST_FIELDS,
      sortBy: params.sortBy,
      order: params.order,
    },
  })
}

/** Fetches every product with list fields, for catalogue-wide aggregates. */
export const getAllProducts = (): Promise<ProductListResponse> =>
  requestDummyJson<ProductListResponse>({
    url: "/products",
    method: "GET",
    params: { limit: 0, select: LIST_FIELDS },
  })

/** Fetches a single product with images and reviews. */
export const getProduct = (id: number): Promise<Product> =>
  requestDummyJson<Product>({ url: `/products/${id}`, method: "GET" })

/** Fetches every product category. */
export const getProductCategories = (): Promise<ProductCategory[]> =>
  requestDummyJson<ProductCategory[]>({ url: "/products/categories", method: "GET" })

/**
 * Record returned by create/update.
 *
 * @remarks
 * `POST /products/add` echoes only the submitted fields plus a generated id;
 * `PUT` returns the full merged product. Fields outside the payload are optional.
 */
export type ProductWriteResult = Pick<Product, "id"> & ProductPayload & Partial<Product>

/** Creates a product. */
export const createProduct = (payload: ProductPayload): Promise<ProductWriteResult> =>
  requestDummyJson<ProductWriteResult, ProductPayload>({
    url: "/products/add",
    method: "POST",
    data: payload,
  })

/** Updates a product. */
export const updateProduct = ({
  id,
  payload,
}: {
  id: number
  payload: ProductPayload
}): Promise<ProductWriteResult> =>
  requestDummyJson<ProductWriteResult, ProductPayload>({
    url: `/products/${id}`,
    method: "PUT",
    data: payload,
  })

/** Deletes a product. DummyJSON returns the record flagged with `isDeleted`. */
export const deleteProduct = (id: number): Promise<Product & { isDeleted: boolean }> =>
  requestDummyJson<Product & { isDeleted: boolean }>({ url: `/products/${id}`, method: "DELETE" })
