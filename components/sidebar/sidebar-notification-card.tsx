import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/error-handler";
import { markNotificationAsRead } from "@/lib/db/queries";
import { toast } from "sonner";
import { Notification } from "@/lib/db/schemas";

type Props = {
  unreadNotifications: Notification[];
};

export function SidebarNotificationCard({ unreadNotifications }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [updating, setUpdating] = useState(false);
  const currentNotification = unreadNotifications[currentIndex];
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : unreadNotifications.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < unreadNotifications.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleMarkAsRead = async () => {
    setUpdating(true);
    const [result, error] = await handleError(
      markNotificationAsRead({
        notificationId: currentNotification.id,
      }),
      {
        path: "notification update",
      }
    );
    if (error)
      return toast.error(
        `Something went wrong. Please refresh the page and try again.`
      );
    setUpdating(false);
  };

  if (unreadNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-medium">
          {currentNotification.title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handlePrevious}
          >
            <ChevronLeft className="size-6" />
            <span className="sr-only">Previous notification</span>
          </Button>
          <span className="text-xs">
            {currentIndex + 1} {"/"} {unreadNotifications.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleNext}
          >
            <ChevronRight className="size-6" />
            <span className="sr-only">Next notification</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 pt-0">
        <p className="text-sm text-muted-foreground">
          {currentNotification.description}
        </p>
      </CardContent>
      <CardFooter className="px-4 pb-2 ">
        <Button
          variant="link"
          size="sm"
          className="px-1.5 py-0.5"
          onClick={handleMarkAsRead}
          disabled={updating}
        >
          <span className="text-xs">Mark as read</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
