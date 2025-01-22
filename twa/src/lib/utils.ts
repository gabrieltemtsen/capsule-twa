import axios from "axios"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


const SERVER_URL = import.meta.env.VITE_SERVER_URL
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function LOGGER (msg: string) {

  console.log(msg)

}



export const SEND_SESSION_TO_SERVER = async(telegramId: string, session: any) => {
  console.log("Sending session to server")
  try {
    await fetch("/api/store-session", {
      method: "POST",
      body: JSON.stringify({ session: session, telegramId: telegramId }),
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.log("Error sending session to server", error)
  }
}

