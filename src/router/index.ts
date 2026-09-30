import { createRouter, createWebHistory } from "vue-router";

import AppLayout from "@/layouts/AppLayout.vue";

import authenticationRoutes from "@/features/authentication/routes";
import dashboardRoutes from "@/features/dashboard/routes";
import ordersRoutes from "@/features/orders/routes";
import transactionsRoutes from "@/features/transactions/routes";
import customersRoutes from "@/features/customers/routes";
import imageGeneratorRoutes from "@/features/image-generator/routes";
import postsRoutes from "@/features/posts/routes";
import productsRoutes from "@/features/products/routes";
import recipesRoutes from "@/features/recipes/routes";
import usersRoutes from "@/features/users/routes";
import sharedRoutes from "@/shared/routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        ...dashboardRoutes,
        ...ordersRoutes,
        ...transactionsRoutes,
        ...customersRoutes,
        ...productsRoutes,
        ...recipesRoutes,
        ...postsRoutes,
        ...usersRoutes,
        ...imageGeneratorRoutes,
      ],
    },

    ...authenticationRoutes,

    ...sharedRoutes,
  ],
});

export default router;
