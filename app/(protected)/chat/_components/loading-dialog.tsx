"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const loadingMessages = [
  "Processing your request...",
  "Analyzing resources...",
  "Preparing data...",
  "Almost there...",
  "Saving changes...",
  "Converting resources...",
  "Optimizing content...",
];

const secondaryMessages = [
  "This may take a moment",
  "We're working on it",
  "Just a bit longer",
  "Thank you for your patience",
];

export function LoadingDialog({
  open = false,
  progress = -1,
}: {
  open?: boolean;
  progress?: number;
}) {
  const [message, setMessage] = useState(loadingMessages[0]);
  const [secondaryMessage, setSecondaryMessage] = useState(
    secondaryMessages[0]
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!open) return;

    const messageInterval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setMessage((current) => {
          const currentIndex = loadingMessages.indexOf(current);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
        setSecondaryMessage((current) => {
          const currentIndex = secondaryMessages.indexOf(current);
          const nextIndex = (currentIndex + 1) % secondaryMessages.length;
          return secondaryMessages[nextIndex];
        });
        setIsTransitioning(false);
      }, 200);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Please be patient</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="space-y-2 text-center">
            <p
              className={cn(
                "text-sm font-medium transition-opacity duration-200",
                isTransitioning ? "opacity-0" : "opacity-100"
              )}
            >
              {message}
            </p>
            <p className="text-xs text-muted-foreground">{secondaryMessage}</p>
          </div>
          {progress >= 0 && (
            <div className="w-full max-w-xs">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {progress}% Complete
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
