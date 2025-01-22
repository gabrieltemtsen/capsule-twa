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


export const SEND_SESSION_TO_SERVER = async (telegramId: any, session: any) => {
  try {
    const res = await axios.post(
      `${SERVER_URL}/api/store-session`,
      { telegramId, session },
      {
        headers: {
          "Content-Type": "application/json", // Explicitly set content type
        },
        timeout: 10000, // Set a timeout (10 seconds)
      }
    );

    console.log("Session sent successfully:", res.data);
    alert(`Success: ${JSON.stringify(res.data)}`);
  } catch (error: any) {
    // Diagnose the error
    if (error.response) {
      console.error("Response error:", error.response);
      alert(
        `Error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      alert("No response from the server. Please check the server logs.");
    } else {
      console.error("Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  }
};