"use client";

import { Button } from "@/components/ui/button";
import { handleError } from "@/lib/utils/error-handler";
import { Trash2, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="destructive"
        type="submit"
        loading={isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          const [chatDeleted, chatDeletedError] = await handleError(
            fetch(`/api/chat?id=${id}`, {
              method: "DELETE",
              next: {
                tags: ["library"],
              },
            }),
            {
              path: "Deleting chat",
            }
          );

          if (chatDeletedError || !chatDeleted) {
            toast.error("chat deleted failed!", { id });
          }
          toast.success("chat deleted success!", { id });
          setIsDeleting(false);
        }}
      >
        {!isDeleting && <TrashIcon size={14} className="mr-px" />}
        <span className="hidden md:block">
          {isDeleting ? "Deleting" : "Delete"}
        </span>
      </Button>
    </div>
  );
}
