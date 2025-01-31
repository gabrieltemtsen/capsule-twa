import axios from "axios"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import capsuleClient from "./capsuleClient"


const SERVER_URL = import.meta.env.VITE_SERVER_URL
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function LOGGER (msg: string) {

  console.log(msg)

}


export const SEND_SESSION_TO_SERVER = async (telegramId: any, session: any) => {
  await capsuleClient.keepSessionAlive();

  // decode the capsule session and remove the signer
const { signer, ...rest } = JSON.parse(atob(session))
// encode the capsule session without the signer
const capsuleSessionWithoutSigner = btoa(JSON.stringify(rest));
  try {
    const res = await axios.post(
      `${SERVER_URL}/api/store-session`,
      { telegramId, session: capsuleSessionWithoutSigner },
      {
        headers: {
          "Content-Type": "application/json", // Explicitly set content type
        },
        timeout: 10000, // Set a timeout (10 seconds)
      }
    );

    console.log("Session sent successfully:", res.data);
    alert(`Bot activated!`);
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


export const TEST_SERVER_HELLO = async() => {   
  try {     
    const res = await fetch(`${SERVER_URL}/api/hello`, {       
      method: 'POST',       
      headers: {         
        "Content-Type": "application/json",
      },       
      body: JSON.stringify({name: 'John ssss'}),
    });     

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Server responded with:", data);
    alert(`Success: ${JSON.stringify(data)}`);   
  } catch (error: any) {     
    console.error("Error:", error.message);
    alert(`Error: ${error.message}`);
  }
}