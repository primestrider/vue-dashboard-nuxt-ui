import type { RouteRecordRaw } from "vue-router"

import { Permission } from "@/shared/models/access"

import { UsersPageName } from "./models"

const usersRoutes: RouteRecordRaw[] = [
  {
    path: "users",
    name: UsersPageName.USERS_LIST,
    component: () => import("./views/UsersListView.vue"),
    meta: {
      permissions: [Permission.USERS_READ],
    },
  },
]

export default usersRoutes
