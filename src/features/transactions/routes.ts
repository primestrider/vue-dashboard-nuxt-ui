import type { RouteRecordRaw } from "vue-router";

import { Permission } from "@/shared/models/access";

import { TransactionsPageName } from "./models";

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: "transactions/list",
    name: TransactionsPageName.TRANSACTIONS_LIST,
    component: () => import("./views/TransactionsListView.vue"),
    meta: {
      permissions: [Permission.TRANSACTIONS_READ],
    },
  },
];

export default dashboardRoutes;
