import type { RouteRecordRaw } from "vue-router";

import { UtilsPageName } from "./models";

const utilRoutes: RouteRecordRaw[] = [
  {
    path: "/:pathMatch(.*)*",
    name: UtilsPageName.PAGE_NOT_FOUND,
    component: () => import("@/shared/views/NotFoundView.vue"),
  },

  {
    path: "/forbidden",
    name: UtilsPageName.FORBIDDEN,
    component: () => import("@/shared/views/ForbiddenView.vue"),
  },
];

export default utilRoutes;
