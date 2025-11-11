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

export const repostPost = mutation({
  args: {
    originalPostId: v.id('posts'),
    userId: v.string(),
    fullName: v.string(),
    userAvatar: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the original post
    const originalPost = await ctx.db.get(args.originalPostId);

    if (!originalPost) {
      throw new Error('Original post not found');
    }

    // Check if user already reposted this
    const existingRepost = await ctx.db
      .query('posts')
      .withIndex('by_user_and_original', (q) =>
        q.eq('userId', args.userId).eq('originalPostId', args.originalPostId)
      )
      .first();

    if (existingRepost) {
      throw new Error('You have already reposted this post');
    }

    // Create the repost
    const repostId = await ctx.db.insert('posts', {
      userId: args.userId,
      fullName: args.fullName,
      userAvatar: args.userAvatar,
      media: originalPost.media,
      caption: originalPost.caption,
      likes: 0,
      createdAt: Date.now(),
      isRepost: true,
      originalPostId: args.originalPostId,
      originalUserId: originalPost.userId,
      originalFullName: originalPost.fullName,
      originalUserAvatar: originalPost.userAvatar,
    });

    // Increment repost count on original post
    const currentReposts = originalPost.reposts || 0;
    await ctx.db.patch(args.originalPostId, {
      reposts: currentReposts + 1,
    });

    return repostId;
  },
});

// Get feed with reposts
export const getFeed = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    let postsQuery = ctx.db
      .query('posts')
      .order('desc')
      .take(limit + 1);

    const posts = await postsQuery;

    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;

    // Format posts with repost information
    const formattedPosts = postsToReturn.map((post) => {
      if (post.isRepost) {
        return {
          ...post,
          originalPost: {
            _id: post.originalPostId,
            userId: post.originalUserId,
            fullName: post.originalFullName,
            userAvatar: post.originalUserAvatar,
          },
        };
      }
      return post;
    });

    return {
      posts: formattedPosts,
      nextCursor: hasMore ? posts[limit]._id : null,
    };
  },
});

// Get user posts with reposts
export const getUserPosts = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('posts')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    // Format posts with repost information
    const formattedPosts = posts.map((post) => {
      if (post.isRepost) {
        return {
          ...post,
          originalPost: {
            _id: post.originalPostId,
            userId: post.originalUserId,
            fullName: post.originalFullName,
            userAvatar: post.originalUserAvatar,
          },
        };
      }
      return post;
    });

    return formattedPosts;
  },
});

// Delete repost
export const deleteRepost = mutation({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // If it's a repost, decrement the original post's repost count
    if (post.isRepost && post.originalPostId) {
      const originalPost = await ctx.db.get(post.originalPostId);
      if (originalPost) {
        const currentReposts = originalPost.reposts || 0;
        await ctx.db.patch(post.originalPostId, {
          reposts: Math.max(0, currentReposts - 1),
        });
      }
    }

    await ctx.db.delete(args.postId);
  },
});
