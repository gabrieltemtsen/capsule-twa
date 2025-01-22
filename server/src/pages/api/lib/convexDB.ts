/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export const storeSession = async (telegramId: string, session: any): Promise<void> => {
  try {
    await convex.mutation(api.sessions.findOrCreateSession, { telegramId, session });
  } catch (error) {
    console.error("Error setting userShare in Convex:", error);
    throw error;
  }
}

export const getSession = async (telegramId: string): Promise<any | null> => {
    try {
        const user = await convex.query(api.sessions.getSessionByTelegramId, { telegramId });
        return user?.session || null;
    } catch (error) {
        console.error("Error retrieving userShare from Convex:", error);
        throw error;
    }
    }
