import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    telegramId: v.string(),
    userShare: v.string(),
  }).index("by_telegramId", ["telegramId"]),

  
});