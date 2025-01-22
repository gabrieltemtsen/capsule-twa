/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const findOrCreateSession = mutation({
  args: {
    telegramId: v.string(),
    session: v.any(),
  },
  handler: async (ctx, { telegramId, session }) => {
    let user: any = await ctx.db.query("sessions").filter(q => q.eq(q.field("telegramId"), telegramId)).first();
    if (!user) {
      user = await ctx.db.insert("sessions", { telegramId, session });
    }
    return user;
  },
});

export const getSessionByTelegramId = query({
  args: {
    telegramId: v.string(),
  },
  handler: async (ctx, { telegramId }) => {
    return await ctx.db.query("sessions").filter(q => q.eq(q.field("telegramId"), telegramId)).first();
  },
});

export const getUserById = query({
  args: {
    userId: v.id("sessions"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});