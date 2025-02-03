import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { IsServerSessionActive, SEND_SESSION_TO_SERVER } from "../../lib/utils";

interface BotCardProps {
  username: string;
  telegramId: number;
  serializedSession: any;
}

export const BotCard: React.FC<BotCardProps> = ({ username, telegramId, serializedSession }) => {
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activationInProgress, setActivationInProgress] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const status = await IsServerSessionActive(telegramId);
        setIsSessionActive(status);
      } catch (error) {
        console.error("Error checking session status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [telegramId]);

  const handleActivateBot = async () => {
    setActivationInProgress(true);
    try {
      await SEND_SESSION_TO_SERVER(telegramId.toString(), serializedSession);
      // Re-check session after activation
      const status = await IsServerSessionActive(telegramId);
      setIsSessionActive(status);
    } catch (error) {
      console.error("Error activating bot:", error);
    } finally {
      setActivationInProgress(false);
    }
  };

  return (
    <Card className="bg-background border-border shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-4">
          <h2 className="font-bold text-xl text-foreground">
            Capsule Bot Integration for {username}
          </h2>

          {loading ? (
            <p className="text-sm text-muted-foreground">Checking bot session...</p>
          ) : isSessionActive ? (
            <div className="text-green-600 text-sm">
              ✅ Your bot session is active and ready for operations.
            </div>
          ) : (
            <>
              {activationInProgress ? (
                <p className="text-sm text-muted-foreground">Activating bot session...</p>
              ) : (
                <Button
                  onClick={handleActivateBot}
                  className="bg-primary text-white px-4 py-2 rounded-lg"
                  disabled={activationInProgress}
                >
                  Activate Bot Operations
                </Button>
              )}
              <p className="text-sm text-muted-foreground">
                Activate the bot to enable operations like portfolio balance checks and transactions.
              </p>
            </>
          )}

          <ul className="text-sm text-muted-foreground mt-3 space-y-1 list-disc pl-5">
            <li>Ask the bot to make transactions</li>
            <li>Ask the bot for your portfolio balance</li>
            <li>Receive alerts for wallet updates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BotCard;
