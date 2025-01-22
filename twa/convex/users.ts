import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findOrCreateUser = mutation({
  args: {
    telegramId: v.string(),
    userShare: v.any(),
  },
  handler: async (ctx, { telegramId, userShare }) => {
    let user: any = await ctx.db.query("users").filter(q => q.eq(q.field("telegramId"), telegramId)).first();
    if (!user) {
      user = await ctx.db.insert("users", { telegramId, userShare });
    }
    return user;
  },
});

export const getUserByTelegramId = query({
  args: {
    telegramId: v.string(),
  },
  handler: async (ctx, { telegramId }) => {
    return await ctx.db.query("users").filter(q => q.eq(q.field("telegramId"), telegramId)).first();
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});