<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import { getApiErrorMessage } from "@/shared/helpers/error"
import { replaceInList } from "@/shared/helpers/list-cache"
import { formatNumber } from "@/shared/helpers/number"

import { getPostsByUser, postQueryKeys } from "@/features/posts/services/api"

import type { UserListItem, UserTodo } from "../models"
import { getUserTodos, setTodoCompleted, userQueryKeys, type UserTodoListResponse } from "../services/api"

/**
 * A user's posts and todos, opened through `useOverlay`.
 *
 * @remarks
 * Todo toggles update the cache optimistically and roll back on failure.
 */
const { user } = defineProps<{
  user: UserListItem
}>()

const queryClient = useQueryClient()
const { showToast } = useAppToast()

const todosKey = computed(() => userQueryKeys.todos(user.id))

const postsQuery = useQuery({
  queryKey: computed(() => postQueryKeys.byUser(user.id)),
  queryFn: () => getPostsByUser(user.id),
})

const todosQuery = useQuery({
  queryKey: todosKey,
  queryFn: () => getUserTodos(user.id),
})

const doneCount = computed(() => todosQuery.data.value?.todos.filter((todo) => todo.completed).length ?? 0)

const { mutate: toggleTodo } = useMutation({
  mutationFn: setTodoCompleted,
  onMutate: async ({ id, completed }) => {
    await queryClient.cancelQueries({ queryKey: todosKey.value })
    const previous = queryClient.getQueryData<UserTodoListResponse>(todosKey.value)
    const todo = previous?.todos.find((item) => item.id === id)

    if (todo) {
      queryClient.setQueryData<UserTodoListResponse>(todosKey.value, (list) =>
        replaceInList(list, "todos", { ...todo, completed }),
      )
    }

    return { previous }
  },
  onError: (error, _variables, context) => {
    queryClient.setQueryData(todosKey.value, context?.previous)
    showToast.error({ title: translate("features.users.detail.todo_failed"), description: getApiErrorMessage(error) })
  },
})

const onTodoChange = (todo: UserTodo, checked: boolean | "indeterminate") =>
  toggleTodo({ id: todo.id, completed: checked === true })

const tabs = computed<TabsItem[]>(() => [
  {
    label: translate("features.users.detail.tab_posts"),
    slot: "posts" as const,
    value: "posts",
    badge: postsQuery.data.value ? { label: String(postsQuery.data.value.total), color: "neutral", variant: "subtle" } : undefined,
  },
  {
    label: translate("features.users.detail.tab_todos"),
    slot: "todos" as const,
    value: "todos",
    badge: todosQuery.data.value ? { label: String(todosQuery.data.value.total), color: "neutral", variant: "subtle" } : undefined,
  },
])
</script>

<template>
  <USlideover
    :title="`${user.firstName} ${user.lastName}`"
    :description="`@${user.username}`"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <UTabs :items="tabs" default-value="posts" variant="link" class="w-full">
        <template #posts>
          <div v-if="postsQuery.isPending.value" class="space-y-3 pt-2">
            <USkeleton v-for="index in 3" :key="index" class="h-16 w-full" />
          </div>

          <QueryErrorAlert
            v-else-if="postsQuery.error.value"
            :title="translate('features.posts.load_error_title')"
            :error="postsQuery.error.value"
            @retry="postsQuery.refetch()"
          />

          <p v-else-if="!postsQuery.data.value?.posts.length" class="pt-2 text-sm text-muted">
            {{ translate("features.users.detail.no_posts") }}
          </p>

          <ul v-else class="divide-y divide-default">
            <li v-for="post in postsQuery.data.value.posts" :key="post.id" class="py-3">
              <p class="font-medium text-highlighted">{{ post.title }}</p>
              <p class="mt-1 line-clamp-2 text-sm text-toned">{{ post.body }}</p>
              <p class="mt-1.5 text-xs text-muted tabular-nums">
                {{ translate("features.users.detail.views", { count: formatNumber(post.views) }) }}
              </p>
            </li>
          </ul>
        </template>

        <template #todos>
          <div v-if="todosQuery.isPending.value" class="space-y-3 pt-2">
            <USkeleton v-for="index in 3" :key="index" class="h-8 w-full" />
          </div>

          <QueryErrorAlert
            v-else-if="todosQuery.error.value"
            :title="translate('features.users.detail.tab_todos')"
            :error="todosQuery.error.value"
            @retry="todosQuery.refetch()"
          />

          <p v-else-if="!todosQuery.data.value?.todos.length" class="pt-2 text-sm text-muted">
            {{ translate("features.users.detail.no_todos") }}
          </p>

          <template v-else>
            <div class="mb-4 mt-2">
              <p class="mb-1.5 text-sm text-muted tabular-nums" aria-live="polite">
                {{ translate("features.users.detail.todos_progress", { done: doneCount, total: todosQuery.data.value.total }) }}
              </p>
              <UProgress :model-value="doneCount" :max="todosQuery.data.value.total" size="sm" color="success" />
            </div>

            <ul class="space-y-3">
              <li v-for="todo in todosQuery.data.value.todos" :key="todo.id">
                <UCheckbox
                  :model-value="todo.completed"
                  :label="todo.todo"
                  size="md"
                  :ui="{ label: ['font-normal', todo.completed ? 'text-muted line-through' : ''] }"
                  @update:model-value="(checked) => onTodoChange(todo, checked)"
                />
              </li>
            </ul>
          </template>
        </template>
      </UTabs>
    </template>
  </USlideover>
</template>
