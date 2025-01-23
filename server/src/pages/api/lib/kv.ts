/* eslint-disable @typescript-eslint/no-explicit-any */
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper function to construct the Redis key based on Telegram ID
function getUserShareKey(telegramId: string): string {
  return `capsule:user:${telegramId}`;
}

// Function to retrieve the userShare from Redis
export async function getUserShare(telegramId: string): Promise<string | null> {
  try {
    const res = await redis.get<string>(getUserShareKey(telegramId));
    console.log(`Retrieved userShare for Telegram ID ${telegramId}:`, res);
    return res;
  } catch (error) {
    console.error(`Error retrieving userShare for Telegram ID ${telegramId}:`, error);
    return null;
  }
}


// Function to store the userShare in Redis
export async function setUserSession(telegramId: any, session: any): Promise<any>{
  try {
  await redis.set(`capsule:user:${telegramId}`, session);
  } catch (error) {
    console.error(`Error storing userShare for Telegram ID ${telegramId}:`, error);
    throw error;
  }
}

export async function getUserSession(telegramId: any): Promise<any>{
  try {
    const res = await redis.get(`capsule:user:${telegramId}`);
    console.log(`Retrieved userShare for Telegram ID ${telegramId}:`, res);
    return res;
  } catch (error) {
    console.error(`Error retrieving userShare for Telegram ID ${telegramId}:`, error);
    return null;
  }
}

// Function to delete the userShare from Redis
export async function deleteUserShare(telegramId: string): Promise<void> {
  try {
    console.log(`Deleting userShare for Telegram ID ${telegramId}`);
    await redis.del(getUserShareKey(telegramId));
  } catch (error) {
    console.error(`Error deleting userShare for Telegram ID ${telegramId}:`, error);
    throw error;
  }
}
