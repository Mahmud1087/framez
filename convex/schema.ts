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
    likes: v.number(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_createdAt', ['createdAt']),

  comments: defineTable({
    postId: v.id('posts'),
    userId: v.string(),
    fullName: v.string(),
    avatar: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index('by_post', ['postId']),

  likes: defineTable({
    postId: v.id('posts'),
    userId: v.string(),
  })
    .index('by_post', ['postId'])
    .index('by_user_post', ['userId', 'postId']),
});
