import type { RouteRecordRaw } from "vue-router";

import { Permission } from "@/shared/models/access";

import { OrdersPageName } from "./models";

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: "/orders/list",
    name: OrdersPageName.ORDERS_LIST,
    component: () => import("./views/OrdersListView.vue"),
    meta: {
      permissions: [Permission.ORDERS_READ],
    },
  },
];

export default dashboardRoutes;
