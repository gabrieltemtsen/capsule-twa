import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import WebApp from "@twa-dev/sdk";
import {
  clearChunkedStorage,
  retrieveChunkedData,
  storeWithChunking,
} from "../../lib/cloudStorageUtil";
import capsuleClient from "../../lib/capsuleClient";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const OnboardingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsLoading(true);
    setLoadingMessage("Initializing...");
    try {
      WebApp.ready();

      if (!WebApp.initDataUnsafe.user) {
        setError("User data not found");
        return;
      }

      const username = WebApp.initDataUnsafe.user.username;

      setLoadingMessage("Retrieving session...");
      const userWalletShare = await retrieveChunkedData("userShare", setLoadingMessage, setError);

      if (userWalletShare) {
        await capsuleClient.setUserShare(userWalletShare);

        // Export and send session to the server
        const serializedSession = await capsuleClient.exportSession();
        const response = await axios.post(`${SERVER_URL}/api/store-session`, {
          session: serializedSession,
        });

        if (response.status === 200) {
          alert("Session exported to the server successfully!");
        } else {
          throw new Error("Failed to export session to the server.");
        }
      } else {
        setLoadingMessage("No session data found. Creating a new wallet...");
        // Handle new wallet creation or other flow as necessary
      }
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    handleInitialize();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading: {loadingMessage}</div>;
  }

  return (
    <div>
      <h1>Welcome to Capsule Mini-App</h1>
      <Button onClick={handleInitialize}>Initialize</Button>
    </div>
  );
};

export default OnboardingScreen;
