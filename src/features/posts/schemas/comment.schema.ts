import * as valibot from "valibot"

/** Longest comment accepted, matching the counter shown under the field. */
export const COMMENT_MAX_LENGTH = 280

/**
 * Client-side validation schema for the add-comment form.
 */
export const commentSchema = valibot.object({
  body: valibot.pipe(
    valibot.string("Write a comment first"),
    valibot.trim(),
    valibot.nonEmpty("Write a comment first"),
    valibot.maxLength(COMMENT_MAX_LENGTH, `Keep it under ${COMMENT_MAX_LENGTH} characters`),
  ),
})

export type CommentForm = valibot.InferOutput<typeof commentSchema>
