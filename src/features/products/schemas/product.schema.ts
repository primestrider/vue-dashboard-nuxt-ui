import * as valibot from "valibot"

/**
 * Client-side validation schema for creating and editing a product.
 *
 * @remarks
 * Used by `UForm` via the Standard Schema protocol.
 * The output is sent as-is to DummyJSON `POST /products/add` and `PUT /products/:id`.
 */
export const productSchema = valibot.object({
  title: valibot.pipe(
    valibot.string("Title is required"),
    valibot.trim(),
    valibot.nonEmpty("Title is required"),
    valibot.maxLength(120, "Title must be 120 characters or fewer"),
  ),
  description: valibot.pipe(
    valibot.string(),
    valibot.trim(),
    valibot.maxLength(500, "Description must be 500 characters or fewer"),
  ),
  category: valibot.pipe(
    valibot.string("Choose a category"),
    valibot.nonEmpty("Choose a category"),
  ),
  brand: valibot.pipe(valibot.string(), valibot.trim()),
  price: valibot.pipe(
    valibot.number("Price is required"),
    valibot.minValue(0.01, "Price must be greater than 0"),
  ),
  discountPercentage: valibot.pipe(
    valibot.number("Discount is required"),
    valibot.minValue(0, "Discount can't be negative"),
    valibot.maxValue(100, "Discount can't exceed 100%"),
  ),
  stock: valibot.pipe(
    valibot.number("Stock is required"),
    valibot.integer("Stock must be a whole number"),
    valibot.minValue(0, "Stock can't be negative"),
  ),
})

/** Form state accepted by {@link productSchema}. */
export type ProductFormInput = valibot.InferInput<typeof productSchema>

/** Validated payload produced by {@link productSchema}. */
export type ProductPayload = valibot.InferOutput<typeof productSchema>
