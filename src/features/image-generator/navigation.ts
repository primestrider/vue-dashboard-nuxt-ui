import type { SidebarNavItem } from "@/shared/navigation/types"

import { ImageGeneratorPageName } from "./models"

/**
 * Sidebar entries owned by the image generator feature.
 *
 * @remarks
 * A public utility, so no permission is required. Keep aligned with
 * `features/image-generator/routes.ts`.
 */
export const imageGeneratorNavigation: SidebarNavItem[] = [
  {
    label: "Image generator",
    icon: "i-lucide-image",
    to: { name: ImageGeneratorPageName.IMAGE_GENERATOR },
  },
]
