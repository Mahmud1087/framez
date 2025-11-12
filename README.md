# 📸 Framez

A modern social media mobile app built with **React Native Expo**, empowering users to share thoughts, photos, and videos — all in one clean, engaging experience.

---

## 🚀 Demo

🎥 [Watch Demo on Google Drive](https://drive.google.com/drive/folders/1uGdvpO1K549PagtAlMAPtI-Shg8LbnOc?usp=sharing)

---

## 🛠 Tech Stack

- **Frontend:** React Native (Expo) + TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Authentication:** Clerk
- **Backend & Database:** Convex

---

## 🧩 Why Convex & Clerk?

- **Convex** provides a serverless backend with real-time database and function capabilities, eliminating the need to manage your own APIs or database. It integrates seamlessly with React Native and supports reactive queries for live updates — ideal for social feeds.
- **Clerk** offers a secure, developer-friendly authentication solution, supporting sign-up, sign-in, and user profile management. It integrates directly with Convex for user identity verification.

---

## ✨ Features

1. 🔁 **Repost / Reshare** — Users can share other users’ posts to their own feed.
2. ❤️ **Like a Post** — Users can like or unlike posts, updating instantly.
3. 💬 **Comment on a Post** — Engage in conversations through comments.
4. 🧑‍💻 **Edit Profile** — Update profile image, first name, and last name.
5. 🗑 **Delete Post (Author Only)** — Only the post author can delete their own post.
6. 📰 **Feed Page** — View, like, comment, and share posts from all users.
7. 👤 **User Posts Page** — View only posts created by a specific user.
8. 🖼 **Post with Media** — Supports posts with text, images, videos, or text-only updates.

---

## 📁 Project Structure

```

.
├── app/                # App routes and screens
├── assets/             # Images, fonts, icons
├── components/         # Reusable UI components
├── constants/          # Theme, fonts, and app constants
├── convex/             # Convex backend functions (API logic)
├── utils/              # Helper functions and utilities
├── .vscode/            # Editor settings
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── eas.json            # EAS build configuration
├── eslint.config.js    # ESLint configuration
├── metro.config.js     # Metro bundler configuration
└── README.md

```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root and add the following:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
CONVEX_DEPLOYMENT=your_convex_deployment_id
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
```

> ⚠️ Never commit `.env` files or sensitive credentials to version control.

---

## 🧑‍💻 Getting Started

### Prerequisites

- Node.js >= 18
- Expo CLI
- Convex account
- Clerk account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/framez.git

# Navigate into the project
cd framez

# Install dependencies
expo install

# Start the development server
npx expo start
```

---

## 🔐 Authentication Setup (Clerk)

1. Create a project on [Clerk Dashboard](https://dashboard.clerk.com/).
2. Copy your **Publishable Key** and add it to `.env` as `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
3. Follow [Clerk Expo Setup Docs](https://clerk.com/docs/expo) for configuration.

---

## 🧮 Backend Setup (Convex)

1. Create a project on [Convex Dashboard](https://dashboard.convex.dev/).
2. Run:

   ```bash
   npx convex dev
   ```

3. Add your `CONVEX_DEPLOYMENT` and `EXPO_PUBLIC_CONVEX_URL` keys to `.env`.
4. Define your Convex functions in the `/convex` folder (e.g., likes, comments, reposts).
5. Schema:

```javascript
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
```

---

## 🔄 Key Workflows

- **Post Creation:** Upload media → Save post to Convex → Refresh feed automatically.
- **Like / Comment:** Interactions stored in Convex with real-time UI updates.
- **Profile Update:** Synced with Clerk’s user data and Convex records.
- **Repost:**

---

## 📅 Roadmap / Future Features

- 🕒 Real-time notifications
- 💌 Direct messaging
- 🔍 Explore page & hashtags
- 🎨 Theme customization
- 🧭 User follow system

---
