'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { sidebarMenuItems } from '@/lib/constants';

type Props = {};

const SidebarNavigations: React.FC<Props> = (props) => {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {sidebarMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href} className="flex items-center gap-x-1.5">
                    <item.icon size={16} />
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigations;
