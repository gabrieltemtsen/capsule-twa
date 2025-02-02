import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Button } from "./button";
import { ExternalLink, Github, LogOut, Menu, Twitter } from "lucide-react";
import WebApp from "@twa-dev/sdk";

interface NavigationDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setScreen: (screen: ScreenName) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onOpenChange }) => {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary/10 transition-colors duration-200">
          <Menu
            className="h-6 w-6 text-foreground"
            width={24}
            height={24}
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col border-l border-border bg-background">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="text-foreground">Menu</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1">
          <div className="space-y-4 py-6">
            <Button
              className="w-full justify-start transition-colors duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
              asChild>
              <a
                href="https://usecapsule.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>

            <Button
              className="w-full justify-start transition-colors duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              asChild>
              <a
                href="https://docs.usecapsule.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                Documentation
              </a>
            </Button>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="bg-muted text-muted-foreground hover:bg-muted/90 transition-colors duration-200"
                asChild>
                <a
                  href="https://x.com/usecapsule"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="bg-muted text-muted-foreground hover:bg-muted/90 transition-colors duration-200"
                asChild>
                <a
                  href="https://github.com/capsule-org/examples-hub"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <div className="space-y-3">
              <Button
                onClick={() => {
                  WebApp.close();
                }}
                className="w-full justify-start transition-colors duration-200 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <LogOut className="mr-2 h-4 w-4" />
                Close App
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationDrawer;
