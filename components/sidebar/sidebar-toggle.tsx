import { PanelLeftIcon } from 'lucide-react';
import { ComponentProps } from 'react';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { TooltipDisplay } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <TooltipDisplay content="Toggle Sidebar" align="start">
      <Button
        onClick={toggleSidebar}
        variant="outline"
        className="md:px-2 md:h-fit"
      >
        <PanelLeftIcon size={16} />
      </Button>
    </TooltipDisplay>
  );
}
