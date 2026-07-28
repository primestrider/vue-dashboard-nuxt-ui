import { createRouter, createWebHistory } from "vue-router";

import utilRoutes from "@/shared/routes";
import authenticationRoutes from "@/features/authentication/routes";

const listRoutes = [...authenticationRoutes, ...utilRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: listRoutes,
});

export default router;
