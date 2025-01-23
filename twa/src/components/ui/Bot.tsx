import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { SEND_SESSION_TO_SERVER, TEST_SERVER_HELLO } from "../../lib/utils";

interface BotCardProps {
  username: string;
  telegramId: number;
  serializedSession: any
}

export const BotCard: React.FC<BotCardProps> = ({
  username,
  telegramId,
  serializedSession
}) => {
  return (
    <Card className="bg-background border-border">
      <CardContent className="pt-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="font-medium text-lg text-foreground">
              Capsule with gabe Bot and {username}
            </h2>

            <Button
            onClick={()=> {SEND_SESSION_TO_SERVER(telegramId.toString(), serializedSession);} }
            >
                Activate Bot Operations
            </Button>

            <li>Ask Bot to make transactions</li>
            <li>Ask Bot for Portfolio Balance</li>

            <Button
            onClick={()=> {TEST_SERVER_HELLO();} }
            >
                TEST SERVER
            </Button>
           
          </div>
        </div>

      
      </CardContent>
    </Card>
  );
};

export default BotCard;
