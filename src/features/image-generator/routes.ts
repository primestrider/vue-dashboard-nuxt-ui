import type { RouteRecordRaw } from "vue-router"

import { ImageGeneratorPageName } from "./models"

const imageGeneratorRoutes: RouteRecordRaw[] = [
  {
    path: "tools/image-generator",
    name: ImageGeneratorPageName.IMAGE_GENERATOR,
    component: () => import("./views/ImageGeneratorView.vue"),
  },
]

export default imageGeneratorRoutes
