import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: import.meta.env.VITE_KV_REST_API_TOKEN,
  token: import.meta.env.VITE_KV_REST_API_URL, 
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

export async function setUserShareInChunks(telegramId: string, userShare: string): Promise<void> {
    try {
      const chunkSize = 10000; // Split into 10,000-character chunks
      const chunks = userShare.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [];
  
      console.log(`Storing ${chunks.length} chunks for Telegram ID: ${telegramId}`);
      for (let i = 0; i < chunks.length; i++) {
        await redis.set(`capsule:user:${telegramId}:chunk:${i}`, chunks[i]);
      }
  
      // Save the total number of chunks
      await redis.set(`capsule:user:${telegramId}:chunkCount`, chunks.length.toString());
    } catch (error) {
      console.error("Error storing userShare in chunks:", error);
      throw error;
    }
  }

  export async function getUserShareFromChunks(telegramId: string): Promise<string | null> {
    try {
      const chunkCount = await redis.get<number>(`capsule:user:${telegramId}:chunkCount`);
      if (!chunkCount) {
        console.error(`No chunks found for Telegram ID: ${telegramId}`);
        return null;
      }
  
      let userShare = "";
      for (let i = 0; i < chunkCount; i++) {
        const chunk = await redis.get<string>(`capsule:user:${telegramId}:chunk:${i}`);
        if (chunk) userShare += chunk;
      }
  
      return userShare;
    } catch (error) {
      console.error("Error retrieving userShare from chunks:", error);
      throw error;
    }
  }

// Function to store the userShare in Redis
export async function setUserShare(telegramId: any, userShare: any): Promise<any>{
  try {
    console.log(`Storing userShare for Telegram ID ${telegramId}:`, userShare);
    await redis.set(telegramId, userShare);
  } catch (error) {
    console.error(`Error storing userShare for Telegram ID ${telegramId}:`, error);
    throw error;
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