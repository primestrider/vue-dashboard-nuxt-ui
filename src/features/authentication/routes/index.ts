import type { RouteRecordRaw } from "vue-router"

import { AuthenticationPageName } from "../models"

const authenticationRoutes: RouteRecordRaw[] = [
  {
    path: "/authentication",
    component: () => import("@/features/authentication/layouts/AuthenticationLayout.vue"),
    children: [
      {
        path: "login",
        name: AuthenticationPageName.LOGIN,
        component: () => import("@/features/authentication/views/LoginView.vue"),
      },
      // {
      //   path: "password/forget",
      //   name: AuthenticationPageName.FORGET_PASSWORD,
      //   component: () => import("@/features/authentication/views/ForgetPasswordView.vue"),
      // },
      // {
      //   path: "password/reset",
      //   name: AuthenticationPageName.RESET_PASSWORD,
      //   component: () => import("@/features/authentication/views/ResetPasswordView.vue"),
      // },
    ],
  },
]

export default authenticationRoutes
