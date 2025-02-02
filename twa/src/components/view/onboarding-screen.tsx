import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { CapsuleModal, OAuthMethod } from "@usecapsule/react-sdk";
import "@usecapsule/react-sdk/styles.css";
import capsuleClient from "../../lib/capsuleClient";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";

interface OnboardingScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const CAPSULE_MODAL_THEME = {
  backgroundColor: "#1F1F1F",
  foregroundColor: "#FFF",
  accentColor: "#FF754A",
  mode: "dark",
  font: "Inter",
};

const OAUTH_METHODS = [
  OAuthMethod.GOOGLE,
  OAuthMethod.TWITTER,
  OAuthMethod.DISCORD,
];

const CAPSULE_MODAL_PROPS: any = {
  capsule: capsuleClient,
  appName: "Telegram Mini App",
  theme: CAPSULE_MODAL_THEME,
  oAuthMethods: OAUTH_METHODS,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  twoFactorAuthEnabled: true,
  recoverySecretStepEnabled: true,
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setScreen }) => {
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Checking login status...");
      const loggedIn = await capsuleClient.isFullyLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // If the user is logged in, navigate to the home screen
        setScreen("home");
      }
    } catch (error) {
      console.error("Failed to check login status:", error);
      setError("An error occurred while checking login status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = () => {
    setShowCapsuleModal(true);
  };

  const handleModalClose = async () => {
    setShowCapsuleModal(false);
    await checkLoginStatus(); // Recheck the session status after modal closes
  };

  if (error) {
    return <ErrorState error={error} onRetry={checkLoginStatus} />;
  }

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (isLoggedIn) {
    // While logged in, we don't display the onboarding screen. Navigation to "home" should already happen.
    return null;
  }

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-background animate-fade-in fill-both">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-foreground mb-8">Welcome to Telegram Mini App</h1>
        <p className="text-lg text-muted-foreground max-w-sm mb-8">
          Cross-app wallets that work everywhere.
        </p>

        <Button onClick={handleAuthentication} size="lg" className="w-full h-14">
          Sign in with Capsule
        </Button>
      </div>

      <CapsuleModal
        {...CAPSULE_MODAL_PROPS}
        isOpen={showCapsuleModal}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default OnboardingScreen;
