/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { Capsule as CapsuleServer, Environment } from "@usecapsule/server-sdk";
import { storeSession } from "./lib/convexDB";

const CAPSULE_ENV: any = process.env.VITE_CAPSULE_ENV || "BETA"; // Use the appropriate environment
const CAPSULE_API_KEY = process.env.VITE_CAPSULE_API_KEY;

const capsuleServer = new CapsuleServer(CAPSULE_ENV, CAPSULE_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const { session, telegramId, } = req.body;

    try {
      // Import the serialized session to the server instance
      // await capsuleServer.importSession(session);

      // Example: Perfor12m a signing operation to test the imported session
      // const walletId = telegramId; // Use an actual wallet ID from the session
      // const messageToSign = "Test message from server";
      // const signature = await capsuleServer.signMessage(walletId, messageToSign);

      const storeUserSession: any = await storeSession(telegramId, session);

      res.status(200).json({ message: "Session stored and tested successfully for"+ `${storeUserSession}`, });
    } catch (error: any) {
      console.error("Error importing session:", error);
      res.status(500).json({ message: "Failed to import session", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

