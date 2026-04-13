import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("generations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    audioBase64: v.optional(v.string()),
    videoStorageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("generations", {
      userId,
      title: args.title,
      content: args.content,
      audioBase64: args.audioBase64,
      videoStorageId: args.videoStorageId,
      videoUrl: args.videoUrl,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("generations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const gen = await ctx.db.get(args.id);
    if (!gen || gen.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
