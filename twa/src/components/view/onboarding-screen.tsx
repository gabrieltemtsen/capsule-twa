import React, { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import WebApp from "@twa-dev/sdk";
import { clearChunkedStorage, retrieveChunkedData, storeWithChunking } from "../../lib/cloudStorageUtil";
import capsuleClient from "../../lib/capsuleClient";
import axios from "axios";
import { WalletType } from "@usecapsule/web-sdk";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";

interface OnboardingScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setScreen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sessionExported = useRef(false); // To track if the session export has been triggered

  useEffect(() => {
    handleInitialize();
  }, []);

  const handleInitialize = async () => {
    setIsLoading(true);
    setLoadingMessage("Starting the initialization of Capsule Telegram Mini App Demo...");
    setError(null);

    try {
      WebApp.ready();

      if (!WebApp.initDataUnsafe.user) {
        setError("Error during initialization: User data not found");
        return;
      }

      const username = WebApp.initDataUnsafe.user?.username;

      if (!username) {
        setError("Error during initialization: Username not found");
        return;
      }

      setLoadingMessage(`User authenticated successfully: ${username}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingMessage(`Checking Telegram cloud storage for existing wallet data associated with user ${username}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userWalletShare = await retrieveChunkedData("userShare", setLoadingMessage, setError);

      if (userWalletShare) {
        setLoadingMessage("Existing wallet data found. Setting up your wallet...");
        await capsuleClient.setUserShare(userWalletShare);

        setLoadingMessage("Initialization complete. Redirecting to the app...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setScreen("home");

        // Trigger session export only once
        if (!sessionExported.current) {
          sessionExported.current = true;
          exportSessionToServer();
        }
      } else {
        setLoadingMessage(`No existing wallet data found for user ${username}. Proceeding with new wallet creation...`);
        handleCreateWallet();
      }
    } catch (error) {
      setError(
        `Initialization error: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again or contact support if the issue persists.`
      );
      clearStorageAndRetry();
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCreateWallet = async (): Promise<void> => {
    setLoadingMessage("Generating a new wallet...");
    setError(null);
    try {
      const username = WebApp.initDataUnsafe.user?.username;

      if (!username) {
        setError("Error: Username not found. Unable to create wallet.");
        return;
      }

      const pregenIdentifier = `${username + crypto.randomUUID().split("-")[0]}@test.usecapsule.com`;

      setLoadingMessage("Creating wallet with pre-generated identifier...");
      const pregenWallet = await capsuleClient.createWalletPreGen(WalletType.EVM, pregenIdentifier);

      setLoadingMessage(`Wallet created successfully. Address: ${pregenWallet.address || "N/A"}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingMessage("Retrieving user wallet share...");
      const userWalletShare = (await capsuleClient.getUserShare()) || "";

      await storeWithChunking("userShare", userWalletShare, setError);

      setLoadingMessage("Wallet setup complete. Redirecting to the app...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setScreen("home");

      // Trigger session export only once
      if (!sessionExported.current) {
        sessionExported.current = true;
        exportSessionToServer();
      }
    } catch (error) {
      setError(
        `Error: ${error instanceof Error ? error.message : String(error)}. Please try again or contact support.`
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const exportSessionToServer = async () => {
    try {
      setLoadingMessage("Exporting session to server...");
      const serializedSession = await capsuleClient.exportSession();
      const response = await axios.post(`${SERVER_URL}/api/store-session`, {
        session: serializedSession,
      });

      if (response.status === 200) {
        alert("Session successfully exported to the server!");
      } else {
        throw new Error("Failed to export session to the server.");
      }
    } catch (error) {
      setError(`Session export error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearStorageAndRetry = async () => {
    setLoadingMessage("Clearing storage and retrying initialization...");
    await clearChunkedStorage(() => {}, () => {});
    capsuleClient.clearStorage("all");
    capsuleClient.logout();
    setError("Storage cleared. Retry initialization.");
  };

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleInitialize}
      />
    );
  }

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-background animate-fade-in fill-both">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Capsule Mini-App</h1>
          <p className="text-lg text-muted-foreground max-w-sm">Cross-app wallets that work everywhere</p>
        </div>
      </div>
      <Button
        size="lg"
        onClick={handleCreateWallet}
        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
        Create Wallet
      </Button>
    </div>
  );
};

export default OnboardingScreen;
