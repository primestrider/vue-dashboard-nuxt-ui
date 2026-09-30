<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { computed, reactive, useTemplateRef } from "vue"

import { translate } from "@/plugins/language"
import { useAppToast } from "@/plugins/nuxt-ui/toaster"
import QueryErrorAlert from "@/shared/components/QueryErrorAlert.vue"
import { getApiErrorMessage } from "@/shared/helpers/error"
import { formatNumber } from "@/shared/helpers/number"

import type { CustomerSummary } from "@/features/customers/models"

import { DEMO_COMMENTER_ID, type Post } from "../models"
import { COMMENT_MAX_LENGTH, commentSchema, type CommentForm } from "../schemas/comment.schema"
import { addComment, getPostComments, postQueryKeys, type PostCommentListResponse } from "../services/api"

/**
 * Full post with its comment thread, opened through `useOverlay`.
 *
 * @remarks
 * The post itself comes from the list page, so only comments are fetched.
 */
const { post, author } = defineProps<{
  post: Post
  author?: CustomerSummary
}>()

const queryClient = useQueryClient()
const { showToast } = useAppToast()
const commentFormRef = useTemplateRef("commentFormRef")

const commentsKey = computed(() => postQueryKeys.comments(post.id))

const { data: comments, isPending, error, refetch } = useQuery({
  queryKey: commentsKey,
  queryFn: () => getPostComments(post.id),
})

const commentForm = reactive<CommentForm>({ body: "" })

const { mutate: postComment, isPending: isPosting } = useMutation({
  mutationFn: ({ body }: CommentForm) => addComment({ body, postId: post.id, userId: DEMO_COMMENTER_ID }),
  onSuccess: (comment) => {
    queryClient.setQueryData<PostCommentListResponse>(commentsKey.value, (list) =>
      list ? { ...list, comments: [...list.comments, comment], total: list.total + 1 } : list,
    )
    commentForm.body = ""
    commentFormRef.value?.clear()
    showToast.success({
      title: translate("features.posts.comments.posted"),
      description: translate("utils.common.simulated_write"),
    })
  },
  onError: (mutationError) => {
    showToast.error({
      title: translate("features.posts.comments.failed"),
      description: getApiErrorMessage(mutationError),
    })
  },
})

const onSubmit = ({ data }: FormSubmitEvent<CommentForm>) => postComment(data)

const authorName = computed(() =>
  author ? `${author.firstName} ${author.lastName}` : translate("features.posts.unknown_author", { id: post.userId }),
)
</script>

<template>
  <USlideover :title="post.title" :ui="{ content: 'sm:max-w-xl', title: 'text-lg leading-snug' }">
    <template #body>
      <article class="space-y-5">
        <UUser
          :name="authorName"
          :description="author?.email"
          :avatar="{ src: author?.image, alt: '', class: 'bg-elevated' }"
        />

        <p class="text-[0.95rem] leading-relaxed text-default">{{ post.body }}</p>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted tabular-nums">
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="i-lucide-eye" class="size-4" />
            {{ translate("features.posts.stats.views", { count: formatNumber(post.views) }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="i-lucide-thumbs-up" class="size-4" />
            {{ translate("features.posts.stats.likes", { count: formatNumber(post.reactions.likes) }) }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <UIcon name="i-lucide-thumbs-down" class="size-4" />
            {{ translate("features.posts.stats.dislikes", { count: formatNumber(post.reactions.dislikes) }) }}
          </span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <UBadge v-for="tag in post.tags" :key="tag" :label="tag" color="neutral" variant="subtle" />
        </div>
      </article>

      <USeparator class="my-6" />

      <section aria-labelledby="post-comments" class="space-y-4">
        <h3 id="post-comments" class="font-semibold text-highlighted">
          {{ translate("features.posts.comments.title") }}
          <span v-if="comments" class="font-normal text-muted tabular-nums">({{ comments.total }})</span>
        </h3>

        <div v-if="isPending" class="space-y-3">
          <USkeleton v-for="index in 3" :key="index" class="h-14 w-full" />
        </div>

        <QueryErrorAlert
          v-else-if="error"
          :title="translate('features.posts.comments.load_error_title')"
          :error="error"
          @retry="refetch()"
        />

        <p v-else-if="!comments?.comments.length" class="text-sm text-muted">
          {{ translate("features.posts.comments.empty") }}
        </p>

        <ul v-else class="space-y-4">
          <li v-for="comment in comments.comments" :key="comment.id" class="flex gap-3">
            <UAvatar :alt="comment.user.fullName" size="sm" />
            <div class="min-w-0 flex-1 text-sm">
              <p>
                <span class="font-medium text-highlighted">{{ comment.user.fullName }}</span>
                <span class="ml-1.5 text-muted">@{{ comment.user.username }}</span>
              </p>
              <p class="mt-0.5 text-toned">{{ comment.body }}</p>
              <p v-if="comment.likes" class="mt-1 text-xs text-muted tabular-nums">
                {{ translate("features.posts.comments.likes", { count: comment.likes }) }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <template #footer>
      <UForm
        ref="commentFormRef"
        :schema="commentSchema"
        :state="commentForm"
        :disabled="isPosting"
        class="w-full"
        @submit="onSubmit"
      >
        <UFormField
          name="body"
          :label="translate('features.posts.comments.field_label')"
          :help="translate('features.posts.comments.counter', { count: commentForm.body.length, max: COMMENT_MAX_LENGTH })"
        >
          <UTextarea
            v-model="commentForm.body"
            :placeholder="translate('features.posts.comments.placeholder')"
            :rows="2"
            autoresize
            :maxrows="5"
            variant="outline"
            size="md"
          />
        </UFormField>

        <div class="mt-2 flex justify-end">
          <UButton type="submit" size="md" :loading="isPosting" :label="translate('features.posts.comments.submit')" />
        </div>
      </UForm>
    </template>
  </USlideover>
</template>
