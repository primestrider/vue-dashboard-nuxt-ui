export default {
  page_title: "Users",
  add_user: "Add user",
  load_error_title: "Users didn't load",

  filters: {
    search_placeholder: "Search users",
    sort: {
      firstName_asc: "Name, A to Z",
      username_asc: "Username, A to Z",
      age_asc: "Youngest first",
      age_desc: "Oldest first",
    },
  },

  genders: {
    female: "Female",
    male: "Male",
  },

  table: {
    select_all: "Select all users on this page",
    select_row: "Select {name}",
    user: "User",
    username: "Username",
    phone: "Phone",
    age: "Age",
    role: "Role",
    actions: "Actions",
    selected: "{count} selected",
    delete_selected: "Delete selected",
    empty_title: "No users match",
    empty_description: "Try a different name, username, or email.",
  },

  actions: {
    view: "View activity",
    edit: "Edit",
    delete: "Delete",
  },

  form: {
    create_title: "Add user",
    edit_title: "Edit user",
    first_name: "First name",
    last_name: "Last name",
    username: "Username",
    email: "Email",
    phone: "Phone",
    age: "Age",
    gender: "Gender",
    role: "Role",
    submit_create: "Add user",
    submit_edit: "Save changes",
  },

  delete: {
    title: "Delete {name}?",
    bulk_title: "Delete {count} users?",
    description: "They'll lose access and disappear from this list.",
    confirm: "Delete user",
    bulk_confirm: "Delete users",
  },

  toast: {
    created: "User added",
    updated: "Changes saved",
    deleted: "User deleted",
    bulk_deleted: "{count} users deleted",
    partial_delete: "{count} users couldn't be deleted",
    failed: "Request failed",
  },

  detail: {
    tab_posts: "Posts",
    tab_todos: "Todos",
    no_posts: "No posts yet.",
    no_todos: "No todos yet.",
    todos_progress: "{done} of {total} done",
    todo_failed: "Todo wasn't updated",
    views: "{count} views",
  },
}
