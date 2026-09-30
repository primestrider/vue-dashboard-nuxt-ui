export default {
  page_title: "Dashboard",
  load_error_title: "Some store figures didn't load",

  figures: {
    revenue: "Revenue",
    revenue_note: "after {amount} in discounts",
    orders: "Orders",
    orders_note: "{units} units sold",
    average_order: "Average order",
    average_order_note: "per checkout",
    customers: "Customers",
    customers_note: "with an account",
  },

  inventory: {
    title: "Stock value by category",
    description: "Price × units on hand, top {count} categories",
    tooltip_units: "{units} units across {products} products",
  },

  low_stock: {
    title: "Running low",
    description: "{threshold} units or fewer",
    units_left: "{count} left",
    all_stocked: "Every product has more than {threshold} units in stock.",
    view_all: "Open products",
  },

  top_orders: {
    title: "Largest orders",
    view_all: "Open orders",
    items: "{count} items",
  },
}
