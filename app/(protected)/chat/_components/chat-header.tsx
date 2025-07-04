"use client";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

import { ModelSelector } from "@/app/(protected)/chat/_components/model-selector";
import { TooltipDisplay } from "@/components/ui/tooltip";
import {
  VisibilitySelector,
  VisibilityType,
} from "@/components/visibility-selector";
import { useChatStore } from "@/lib/stores/chat-store";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  DatabaseIcon,
  FileText,
  GalleryVerticalEnd,
  LineChart,
  Link,
  Settings2,
  Trash,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { Plan } from "@/lib/types/global";

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  currentPlanName,
}: {
  currentPlanName: Plan;
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const posts = useChatStore((state) => state.posts);
  const setShowSettingsPanel = useChatStore(
    (state) => state.setShowSettingsPanel
  );
  const showSettingsPanel = useChatStore((state) => state.showSettingsPanel);
  return (
    <header className="flex items-center px-2 md:px-2 gap-2">
      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
          currentPlanName={currentPlanName}
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          size={isMobile ? "sm" : "default"}
          selectedVisibilityType={selectedVisibilityType}
          currentPlanName={currentPlanName}
          className="order-1 md:order-3"
        />
      )}

      {posts.length === 0 ? (
        <Button
          variant={showSettingsPanel ? "secondary" : "outline"}
          onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          size={isMobile ? "sm" : "default"}
        >
          <DatabaseIcon size={14} />
          <span className="hidden md:block">Resources</span>
        </Button>
      ) : (
        <TooltipDisplay
          content={`${posts.length} resources in the queue. Start chat to save resources.`}
        >
          <Button
            variant="secondary"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          >
            <DatabaseIcon size={14} />
            <span className="hidden md:block">Resources</span>
          </Button>
        </TooltipDisplay>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
