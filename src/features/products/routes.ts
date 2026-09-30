import type { RouteRecordRaw } from "vue-router"

import { Permission } from "@/shared/models/access"

import { ProductsPageName } from "./models"

const productsRoutes: RouteRecordRaw[] = [
  {
    path: "products/list",
    name: ProductsPageName.PRODUCTS_LIST,
    component: () => import("./views/ProductsListView.vue"),
    meta: {
      permissions: [Permission.PRODUCTS_READ],
    },
  },
]

export default productsRoutes
