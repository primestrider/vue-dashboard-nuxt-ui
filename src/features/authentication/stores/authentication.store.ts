import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";

import { useAccessStore } from "@/shared/stores/useAccessStore";

import { AuthenticationPageName } from "../models";
import type { UserProfile } from "../models/user.model";

/**
 * Derives up to two uppercase initials from a display name.
 *
 * @param name - Full display name.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/**
 * Pinia store for the authenticated user session.
 *
 * @remarks
 * Replace mock data with `/me` hydration after login is wired.
 */
export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();

  /** Currently signed-in user, or `null` after logout. */
  const userData = ref<UserProfile | null>({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  });

  /** Avatar initials derived from the user's display name. */
  const userInitials = computed(() => (userData.value ? getInitials(userData.value.name) : ""));

  /**
   * Replaces the current user profile, typically after login or `/me`.
   *
   * @param profile - User profile from the auth API.
   */
  function setUser(profile: UserProfile) {
    userData.value = profile;
  }

  /**
   * Clears local session state and redirects to the login page.
   */
  async function handleLogout() {
    localStorage.removeItem("authToken");
    useAccessStore().clearAccess();
    userData.value = null;

    await router.push({ name: AuthenticationPageName.LOGIN });
  }

  return {
    userData,
    userInitials,
    setUser,
    handleLogout,
  };
});
