<script setup lang="ts">
import { useOverlay } from "@nuxt/ui/composables"
import { keepPreviousData, useQuery } from "@tanstack/vue-query"
import { computed } from "vue"

import { translate } from "@/plugins/language"
import DataTablePagination from "@/shared/components/DataTablePagination.vue"
import { useDebouncedQueryModel, useRouteQueryState } from "@/shared/composables/useRouteQueryState"
import { literalParam, paginationParams, slugParam, stringParam, withAllowList } from "@/shared/helpers/query-param"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import SearchInput from "@/shared/components/SearchInput.vue"
import { formatNumber } from "@/shared/helpers/number"

import { customerQueryKeys, getCustomerDirectory } from "@/features/customers/services/api"

import PostDetailSlideover from "../components/PostDetailSlideover.vue"
import type { Post, PostListParams, PostSortField } from "../models"
import { getPosts, getPostTags, postQueryKeys } from "../services/api"

type SortKey = "id_desc" | "views_desc" | "title_asc"

const SORT_OPTIONS: Record<SortKey, { sortBy: PostSortField; order: "asc" | "desc" }> = {
  id_desc: { sortBy: "id", order: "desc" },
  views_desc: { sortBy: "views", order: "desc" },
  title_asc: { sortBy: "title", order: "asc" },
}

const detailSlideover = useOverlay().create(PostDetailSlideover)

const { data: tags } = useQuery({ queryKey: postQueryKeys.tags(), queryFn: getPostTags, staleTime: Infinity })

// ---- Filters (kept in the URL) ---------------------------------------------
const { page, limit, q: search, tag, sort: sortKey } = useRouteQueryState(
  {
    ...paginationParams(),
    q: stringParam({ maxLength: 100 }),
    tag: withAllowList(slugParam(), () => tags.value?.map((item) => item.slug)),
    sort: literalParam(Object.keys(SORT_OPTIONS) as SortKey[], "id_desc"),
  },
  { resetKey: "page" },
)

const searchInput = useDebouncedQueryModel(search)

const listParams = computed<PostListParams>(() => ({
  page: page.value,
  limit: limit.value,
  search: search.value,
  tag: tag.value,
  ...SORT_OPTIONS[sortKey.value],
}))

const tagItems = computed(() => [
  { label: translate("features.posts.filters.all_tags"), value: "" },
  ...(tags.value ?? []).map((item) => ({ label: item.name, value: item.slug })),
])

const sortItems = computed(() =>
  (Object.keys(SORT_OPTIONS) as SortKey[]).map((key) => ({
    label: translate(`features.posts.filters.sort.${key}`),
    value: key,
  })),
)

// ---- Queries -------------------------------------------------------------
const { data: postPage, isFetching, isPending, error, refetch } = useQuery({
  queryKey: computed(() => postQueryKeys.list(listParams.value)),
  queryFn: () => getPosts(listParams.value),
  placeholderData: keepPreviousData,
})

const { data: authors } = useQuery({
  queryKey: customerQueryKeys.directory(),
  queryFn: getCustomerDirectory,
  staleTime: Infinity,
})

const authorsById = computed(() => new Map((authors.value ?? []).map((author) => [author.id, author])))

const authorName = (post: Post) => {
  const author = authorsById.value.get(post.userId)
  return author ? `${author.firstName} ${author.lastName}` : translate("features.posts.unknown_author", { id: post.userId })
}

const openPost = (post: Post) => detailSlideover.open({ post, author: authorsById.value.get(post.userId) })

const hasActiveFilters = computed(() => Boolean(search.value || tag.value))
const clearFilters = () => {
  search.value = ""
  tag.value = ""
}
</script>

<template>
  <UDashboardPanel id="posts">
    <template #header>
      <UDashboardNavbar :title="translate('features.posts.page_title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <SearchInput v-model="searchInput" :placeholder="translate('features.posts.filters.search_placeholder')" />
        </template>

        <template #right>
          <UTooltip :text="translate('features.posts.filters.tag_locked')" :disabled="!search">
            <USelectMenu
              v-model="tag"
              :items="tagItems"
              value-key="value"
              size="md"
              variant="outline"
              :disabled="Boolean(search)"
              class="!w-44"
            />
          </UTooltip>

          <USelect v-model="sortKey" :items="sortItems" size="md" variant="outline" class="!w-44" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <QueryErrorAlert
        v-if="error"
        :title="translate('features.posts.load_error_title')"
        :error="error"
        @retry="refetch()"
      />

      <div v-else-if="isPending" class="mx-auto w-full max-w-3xl shrink-0 space-y-6">
        <USkeleton v-for="index in 4" :key="index" class="h-32 w-full" />
      </div>

      <UEmpty
        v-else-if="!postPage?.posts.length"
        icon="i-lucide-newspaper"
        :title="translate('features.posts.empty_title')"
        :description="translate('features.posts.empty_description')"
        :actions="hasActiveFilters ? [{ label: translate('utils.common.clear_filters'), icon: 'i-lucide-x', color: 'neutral', variant: 'subtle', onClick: clearFilters }] : []"
        variant="naked"
        class="flex-1"
      />

      <ol
        v-else
        class="mx-auto w-full max-w-3xl shrink-0 divide-y divide-default transition-opacity"
        :class="{ 'opacity-60': isFetching }"
        :aria-busy="isFetching"
      >
        <li v-for="post in postPage.posts" :key="post.id">
          <article class="py-5">
            <p class="mb-2 flex items-center gap-2 text-sm text-muted">
              <UAvatar
                :src="authorsById.get(post.userId)?.image"
                :alt="authorName(post)"
                size="2xs"
                class="bg-elevated"
              />
              {{ authorName(post) }}
            </p>

            <h2 class="text-lg font-semibold leading-snug text-highlighted">
              <button
                type="button"
                class="text-left hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click="openPost(post)"
              >
                {{ post.title }}
              </button>
            </h2>

            <p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-toned">{{ post.body }}</p>

            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted tabular-nums">
              <span class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-eye" class="size-3.5" />
                {{ translate("features.posts.stats.views", { count: formatNumber(post.views) }) }}
              </span>
              <span class="inline-flex items-center gap-1">
                <UIcon name="i-lucide-thumbs-up" class="size-3.5" />
                {{ translate("features.posts.stats.likes", { count: formatNumber(post.reactions.likes) }) }}
              </span>
              <span class="flex flex-wrap gap-1">
                <UBadge
                  v-for="postTag in post.tags"
                  :key="postTag"
                  :label="postTag"
                  color="neutral"
                  variant="soft"
                  size="sm"
                />
              </span>
            </div>
          </article>
        </li>
      </ol>

      <DataTablePagination
        v-if="!error"
        v-model:page="page"
        v-model:limit="limit"
        :total="postPage?.total ?? 0"
      />
    </template>
  </UDashboardPanel>
</template>
