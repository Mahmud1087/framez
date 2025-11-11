import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  posts: defineTable({
    userId: v.string(),
    fullName: v.string(),
    userAvatar: v.string(),
    caption: v.string(),
    media: v.array(
      v.object({
        type: v.string(),
        url: v.string(),
      })
    ),
    reposts: v.optional(v.number()),
    likes: v.number(),
    createdAt: v.number(),

    isRepost: v.optional(v.boolean()),
    originalPostId: v.optional(v.id('posts')),
    originalUserId: v.optional(v.string()),
    originalFullName: v.optional(v.string()),
    originalUserAvatar: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_createdAt', ['createdAt'])
    .index('by_user_and_original', ['userId', 'originalPostId']),

  comments: defineTable({
    postId: v.id('posts'),
    userId: v.string(),
    fullName: v.string(),
    avatar: v.string(),
    text: v.string(),
    createdAt: v.number(),
  })
    .index('by_post', ['postId'])
    .index('by_user', ['userId']),

  likes: defineTable({
    postId: v.id('posts'),
    userId: v.string(),
  })
    .index('by_post', ['postId'])
    .index('by_user', ['userId'])
    .index('by_user_post', ['userId', 'postId']),
});
