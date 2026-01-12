import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // YouTube Data API v3
    YOUTUBE_API_KEY: z.string().optional(),

    // TikTok API (OAuth)
    TIKTOK_CLIENT_KEY: z.string().optional(),
    TIKTOK_CLIENT_SECRET: z.string().optional(),

    // Instagram Graph API (via Meta)
    INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
    META_APP_ID: z.string().optional(),
    META_APP_SECRET: z.string().optional(),

    // Twitter/X API v2
    TWITTER_BEARER_TOKEN: z.string().optional(),
    TWITTER_API_KEY: z.string().optional(),
    TWITTER_API_SECRET: z.string().optional(),

    // Optional: Skip auth for local dev
    SKIP_AUTH: z.string().optional().default("false"),
  },
  client: {
    NEXT_PUBLIC_MOCK_DATA: z.string().optional().default("false"),
    // App URL for OAuth callbacks
    NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_MOCK_DATA: process.env.NEXT_PUBLIC_MOCK_DATA,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
