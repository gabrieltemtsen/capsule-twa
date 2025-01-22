
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL || '');

export const setUserShareInConvex = async (telegramId: string, userShare: any): Promise<void> => {
  try {
    await convex.mutation(api.users.findOrCreateUser, { telegramId, userShare });
  } catch (error) {
    console.error("Error setting userShare in Convex:", error);
    throw error;
  }
}

export const getUserShareFromConvex = async (telegramId: string): Promise<any | null> => {
    try {
        const user = await convex.query(api.users.getUserByTelegramId, { telegramId });
        return user?.userShare || null;
    } catch (error) {
        console.error("Error retrieving userShare from Convex:", error);
        throw error;
    }
    }
