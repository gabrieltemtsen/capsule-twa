/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

 
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { getUserSession, setUserSession } from "./lib/kv";
import sendMessage  from "./lib/botService";

const CAPSULE_API_KEY = process.env.VITE_CAPSULE_API_KEY;


const CAPSULE_ENV: Environment = process.env.VITE_CAPSULE_ENV as Environment;
const capsule = new CapsuleServer(CAPSULE_ENV, process.env.VITE_CAPSULE_API_KEY);

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Validate request body
  const { telegramId } = req.query;
  
  if (!telegramId) {
    return res.status(400).json({ 
      message: "Missing required fields: session or telegramId" 
    });
  }

  try {
    const session = await getUserSession(telegramId);
    await capsule.importSession(session);

    const isActive = await capsule.isSessionActive();

    if (!isActive) {
      console.log('Session expired');
      return res.status(401).json({ error: "Session expired" });
    }

  return res.json({status: true})
  } catch (error: any) {
    console.error("Error storing session:", error);
    res.status(500).json({ 
      message: "Failed to store session", 
      error: error.message 
    });
  }
}
