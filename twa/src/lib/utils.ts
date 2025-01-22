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
  alert('Sending session to server')
  alert(session)
  try {
    await fetch(`${SERVER_URL}/api/store-session`, {
      method: "POST",
      body: JSON.stringify({ session: session, telegramId: telegramId }),
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.log("Error sending session to server", error)
  }
}

