import type { RouteRecordRaw } from "vue-router"

import { Permission } from "@/shared/models/access"

import { PostsPageName } from "./models"

const postsRoutes: RouteRecordRaw[] = [
  {
    path: "posts",
    name: PostsPageName.POSTS_LIST,
    component: () => import("./views/PostsListView.vue"),
    meta: {
      permissions: [Permission.POSTS_READ],
    },
  },
]

export default postsRoutes
