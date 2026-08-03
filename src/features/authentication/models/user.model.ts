/** Signed-in user profile returned by auth/session endpoints. */
export type UserProfile = {
  name: string;
  email: string;
  /** Optional avatar image URL. Falls back to initials when omitted. */
  avatar?: string;
  role: string;
};
