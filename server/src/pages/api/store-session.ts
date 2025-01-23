/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

 
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { setUserSession } from "./lib/kv";
import { sendMessage } from "./lib/botService";

const CAPSULE_ENV: any = process.env.VITE_CAPSULE_ENV || "BETA"; // Use the appropriate environment
const CAPSULE_API_KEY = process.env.VITE_CAPSULE_API_KEY;

const capsuleServer = new CapsuleServer(CAPSULE_ENV, CAPSULE_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Validate request body
  const { session, telegramId } = req.body;
  
  if (!session || !telegramId) {
    return res.status(400).json({ 
      message: "Missing required fields: session or telegramId" 
    });
  }

  try {
    console.log('Triggered');
    console.log('Request Body:', req.body);
    console.log("Session received from client:", session);

    // Store user session
    const storeUserSession = await setUserSession(telegramId, session);

    res.status(200).json({ 
      message: `Session stored successfully for ${telegramId}`,
      result: storeUserSession 
    });
    await sendMessage(telegramId, "Thank you for activiating me! 🚀 what would you like to do Today ?");
  } catch (error: any) {
    console.error("Error storing session:", error);
    res.status(500).json({ 
      message: "Failed to store session", 
      error: error.message 
    });
  }
}
