import { v } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const createPost = mutation({
  args: {
    userId: v.string(),
    fullName: v.string(),
    userAvatar: v.string(),
    caption: v.string(),
    media: v.array(v.object({ type: v.string(), url: v.string() })),
  },
  handler: async ({ db }, args) => {
    return await db.insert('posts', {
      ...args,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const getFeed = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.number(),
  },
  handler: async ({ db }, { cursor, limit }) => {
    let feed = db.query('posts').withIndex('by_createdAt').order('desc');

    if (cursor) {
      feed = feed.filter((q) => q.lt('createdAt', Number(cursor) as any));
    }

    const results = await feed.take(limit);

    return {
      posts: results,
      nextCursor:
        results.length === limit
          ? results[results.length - 1].createdAt.toString()
          : null,
    };
  },
});

export const getUserPosts = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    return await db
      .query('posts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

export const toggleLike = mutation({
  args: { postId: v.id('posts'), userId: v.string() },
  handler: async ({ db }, { postId, userId }) => {
    const like = await db
      .query('likes')
      .withIndex('by_user_post', (q) =>
        q.eq('userId', userId).eq('postId', postId)
      )
      .unique();

    if (like) {
      // Unlike
      await db.delete(like._id);

      const post = await db.get(postId);
      await db.patch(postId, { likes: Number(post?.likes) - 1 });
      return { liked: false };
    } else {
      // Like
      await db.insert('likes', { postId, userId });

      const post = await db.get(postId);
      await db.patch(postId, { likes: Number(post?.likes) + 1 });
      return { liked: true };
    }
  },
});

export const getComments = query({
  args: { postId: v.id('posts') },
  handler: async ({ db }, { postId }) => {
    return await db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', postId))
      .order('asc')
      .collect();
  },
});

export const addComment = mutation({
  args: {
    postId: v.id('posts'),
    userId: v.string(),
    fullName: v.string(),
    avatar: v.string(),
    text: v.string(),
  },
  handler: async ({ db }, args) => {
    await db.insert('comments', {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const checkUserLike = query({
  args: { postId: v.id('posts'), userId: v.string() },
  handler: async ({ db }, { postId, userId }) => {
    const like = await db
      .query('likes')
      .withIndex('by_user_post', (q) =>
        q.eq('userId', userId).eq('postId', postId)
      )
      .unique();

    return { liked: !!like };
  },
});

export const deletePost = mutation({
  args: { postId: v.id('posts') },
  handler: async ({ db }, { postId }) => {
    // Delete the post
    await db.delete(postId);

    // Delete all comments associated with the post
    const comments = await db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', postId))
      .collect();

    for (const comment of comments) {
      await db.delete(comment._id);
    }

    // Delete all likes associated with the post
    const likes = await db
      .query('likes')
      .withIndex('by_post', (q) => q.eq('postId', postId))
      .collect();

    for (const like of likes) {
      await db.delete(like._id);
    }

    return { success: true };
  },
});
