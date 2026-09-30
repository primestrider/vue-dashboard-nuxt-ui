import type { RouteRecordRaw } from "vue-router"

import { Permission } from "@/shared/models/access"

import { RecipesPageName } from "./models"

const recipesRoutes: RouteRecordRaw[] = [
  {
    path: "recipes",
    name: RecipesPageName.RECIPES_LIST,
    component: () => import("./views/RecipesListView.vue"),
    meta: {
      permissions: [Permission.RECIPES_READ],
    },
  },
]

export default recipesRoutes
