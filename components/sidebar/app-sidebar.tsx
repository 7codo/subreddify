"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SidebarHistory } from "@/components/sidebar/sidebar-history";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";

import { Notification } from "@/lib/db/schemas";
import SidebarNavigations from "./sidebar-navigations";
import { SidebarNotificationCard } from "./sidebar-notification-card";
import { Plan } from "@/lib/types/global";

const SidebarUserNavNoSSR = dynamic(
  () =>
    import("@/components/sidebar/sidebar-user-nav").then(
      (mod) => mod.SidebarUserNav
    ),
  { ssr: false }
);

type Props = {
  unreadNotifications: Notification[];
  currentPlan: Plan;
  userId: string;
};

export function AppSidebar({
  unreadNotifications,
  currentPlan,
  userId,
}: Props) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="logo"
                width={122}
                height={36}
              />
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigations />
        <SidebarGroup>
          <SidebarHistory userId={userId} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNotificationCard
              unreadNotifications={unreadNotifications}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarUserNavNoSSR currentPlan={currentPlan} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
