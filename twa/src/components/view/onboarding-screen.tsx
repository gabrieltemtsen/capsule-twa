import React, { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import WebApp from "@twa-dev/sdk";
import capsuleClient from "../../lib/capsuleClient";
import { getUserShare, setUserShare } from "../../lib/kv"; // Import Redis functions
import { WalletType } from "@usecapsule/web-sdk";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";
import axios from "axios";

interface OnboardingScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setScreen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sessionExported = useRef(false); // To prevent redundant server calls

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;
  useEffect(() => {
    handleInitialize();
  }, []);

  const handleInitialize = async () => {
    setIsLoading(true);
    setLoadingMessage("Starting initialization...");
    setError(null);

    try {
      WebApp.ready();

      if (!WebApp.initDataUnsafe.user) {
        setError("Error: User data not found.");
        return;
      }

      const telegramId = WebApp.initDataUnsafe.user.id; // Use Telegram ID
      const username = WebApp.initDataUnsafe.user.username;

      if (!telegramId || !username) {
        setError("Error: Telegram ID or username not found.");
        return;
      }

      setLoadingMessage(`User authenticated successfully: ${username}`);

      // Check Redis for existing userShare
      const userShare = await getUserShare(telegramId.toString());

      if (userShare) {
        setLoadingMessage("Existing wallet data found. Setting up your wallet...");
        await capsuleClient.setUserShare(userShare);

        // Redirect after successful setup
        if (!sessionExported.current) {
          sessionExported.current = true;
          exportSessionToServer(telegramId);
        }
        setScreen("home");
      } else {
        setLoadingMessage("No wallet data found. Creating a new wallet...");
        await handleCreateWallet(telegramId);
      }
    } catch (err) {
      setError(`Initialization error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCreateWallet = async (telegramId: number) => {
    try {
      setLoadingMessage("Generating a new wallet...");

      const pregenIdentifier = `${telegramId}-${crypto.randomUUID()}`;
      const pregenWallet = await capsuleClient.createWalletPreGen(WalletType.EVM, pregenIdentifier);

      setLoadingMessage(`Wallet created successfully. Address: ${pregenWallet.address || "N/A"}`);
      const userShare: any = await capsuleClient.getUserShare();

      // Store userShare in Redis
      await setUserShare(telegramId.toString(), userShare);

      setScreen("home");

      if (!sessionExported.current) {
        sessionExported.current = true;
        exportSessionToServer(telegramId);
      }
    } catch (err) {
      setError(`Wallet creation error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const exportSessionToServer = async (telegramId: number) => {
    try {
      setLoadingMessage("Exporting session to server...");
      const serializedSession = await capsuleClient.exportSession();

      const res: any = axios.post(`${SERVER_URL}/api/store-session`, {
        session: serializedSession,
        telegramId
      });

      console.log(res.data)

      // Replace with your server API call logic
      console.log(`Session for Telegram ID ${telegramId} exported:`, serializedSession);
    } catch (err) {
      setError(`Session export error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
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
        onClick={handleInitialize}
        className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
        Start Onboarding
      </Button>
    </div>
  );
};

export default OnboardingScreen;
