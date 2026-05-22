// supabase/functions/social-feed/index.ts
// Supabase Edge Function — proxies X (Twitter) and TikTok APIs
// and returns a normalised post list to the client.
//
// Deploy: supabase functions deploy social-feed
// Secrets: X_BEARER_TOKEN, TIKTOK_CLIENT_KEY (set in Supabase dashboard)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface SocialPost {
  id: string;
  platform: "x" | "tiktok";
  username: string;
  displayName: string;
  avatarUrl?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likeCount: number;
  replyCount?: number;
  shareCount?: number;
  url: string;
  postedAt: string; // ISO timestamp
}

// --------------------------------------------------------------------------
// Normalisation helpers
// --------------------------------------------------------------------------

function normaliseX(
  tweet: Record<string, unknown>,
  author: Record<string, unknown>
): SocialPost {
  const metrics = (tweet.public_metrics as Record<string, number>) ?? {};
  return {
    id: `x_${tweet.id}`,
    platform: "x",
    username: (author.username as string) ?? "unknown",
    displayName: (author.name as string) ?? "Unknown",
    avatarUrl: author.profile_image_url as string | undefined,
    content: (tweet.text as string) ?? "",
    likeCount: metrics.like_count ?? 0,
    replyCount: metrics.reply_count ?? 0,
    shareCount: metrics.retweet_count ?? 0,
    url: `https://x.com/${author.username}/status/${tweet.id}`,
    postedAt: (tweet.created_at as string) ?? new Date().toISOString(),
  };
}

function normaliseTikTok(video: Record<string, unknown>): SocialPost {
  return {
    id: `tt_${video.id}`,
    platform: "tiktok",
    username: (video.author_name as string) ?? "unknown",
    displayName: (video.author_name as string) ?? "Unknown",
    content: (video.video_description as string) ?? "",
    mediaUrl: (video.cover_image_url as string) ?? undefined,
    mediaType: "video",
    likeCount: (video.like_count as number) ?? 0,
    shareCount: (video.share_count as number) ?? 0,
    url: `https://www.tiktok.com/@${video.author_name}/video/${video.id}`,
    postedAt: new Date(
      ((video.create_time as number) ?? 0) * 1000
    ).toISOString(),
  };
}

// --------------------------------------------------------------------------
// Fetch helpers
// --------------------------------------------------------------------------

async function fetchXPosts(query: string): Promise<SocialPost[]> {
  const token = Deno.env.get("X_BEARER_TOKEN");
  if (!token) {
    console.warn("[social-feed] X_BEARER_TOKEN not set — skipping X posts");
    return [];
  }

  const params = new URLSearchParams({
    query,
    max_results: "10",
    "tweet.fields": "created_at,public_metrics,text",
    "user.fields": "name,username,profile_image_url",
    expansions: "author_id",
  });

  const res = await fetch(
    `https://api.twitter.com/2/tweets/search/recent?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    console.error("[social-feed] X API error:", res.status, await res.text());
    return [];
  }

  const data = (await res.json()) as {
    data?: Record<string, unknown>[];
    includes?: { users?: Record<string, unknown>[] };
  };

  const users = new Map(
    (data.includes?.users ?? []).map((u) => [u.id as string, u])
  );

  return (data.data ?? []).map((tweet) =>
    normaliseX(tweet, users.get(tweet.author_id as string) ?? {})
  );
}

async function fetchTikTokVideos(hashtag: string): Promise<SocialPost[]> {
  const clientKey = Deno.env.get("TIKTOK_CLIENT_KEY");
  if (!clientKey) {
    console.warn(
      "[social-feed] TIKTOK_CLIENT_KEY not set — skipping TikTok posts"
    );
    return [];
  }

  const res = await fetch("https://open.tiktokapis.com/v2/video/query/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientKey}`,
    },
    body: JSON.stringify({
      query: {
        and: [
          {
            operation: "IN",
            field_name: "hashtag_name",
            field_values: [hashtag],
          },
        ],
      },
      max_count: 10,
      fields:
        "id,video_description,cover_image_url,like_count,share_count,author_name,create_time",
    }),
  });

  if (!res.ok) {
    console.error(
      "[social-feed] TikTok API error:",
      res.status,
      await res.text()
    );
    return [];
  }

  const data = (await res.json()) as {
    data?: { videos?: Record<string, unknown>[] };
  };

  return (data.data?.videos ?? []).map(normaliseTikTok);
}

// --------------------------------------------------------------------------
// Merge and deduplicate
// --------------------------------------------------------------------------

function mergePosts(lists: SocialPost[][]): SocialPost[] {
  const seen = new Set<string>();
  const merged: SocialPost[] = [];
  for (const list of lists) {
    for (const post of list) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        merged.push(post);
      }
    }
  }
  merged.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  return merged;
}

// --------------------------------------------------------------------------
// Handler
// --------------------------------------------------------------------------

serve(async (req: Request) => {
  const origin = req.headers.get("Origin") ?? "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const hashtag = url.searchParams.get("hashtag") ?? "WC2026";
    const query = `#${hashtag} -is:retweet lang:en`;

    const [xPosts, ttPosts] = await Promise.all([
      fetchXPosts(query),
      fetchTikTokVideos(hashtag),
    ]);

    const posts = mergePosts([xPosts, ttPosts]);

    return new Response(
      JSON.stringify({ posts, fetchedAt: new Date().toISOString() }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[social-feed] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});