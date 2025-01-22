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
  try {
   await axios.post(`${SERVER_URL}/api/store-session`, {
      telegramId,
      session
    })
    
  } catch (error) {
    console.log("Error sending session to server", error)
  }
}

