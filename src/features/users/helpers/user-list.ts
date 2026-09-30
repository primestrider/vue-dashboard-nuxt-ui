import type { UserListItem } from "../models"
import type { UserWriteResult } from "../services/api"

/**
 * Reduces a create/update response to the fields shown in table rows.
 *
 * @remarks
 * `POST /users/add` returns blank strings for fields it wasn't sent, such as `image`.
 */
export const toUserListItem = (user: UserWriteResult): UserListItem => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  username: user.username,
  email: user.email,
  phone: user.phone,
  age: user.age,
  gender: user.gender,
  image: user.image ?? "",
  role: user.role,
})
