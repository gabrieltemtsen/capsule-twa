import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    telegramId: v.string(),
    session: v.string(),
  }).index("by_telegramId", ["telegramId"]),

  
});