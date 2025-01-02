import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { notFound, redirect } from "next/navigation";
import { getUnreadNotifications } from "@/lib/db/queries";
import { getCurrentPlanName } from "@/lib/actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cookieStore] = await Promise.all([currentUser(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";
  const unreadNotifications = (await getUnreadNotifications())?.data ?? [];
  const currentPlan = (await getCurrentPlanName())?.data ?? "free";
  if (!user || !user?.id) redirect("/");
  return (
    <>
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar
          userId={user.id}
          unreadNotifications={unreadNotifications}
          currentPlan={currentPlan}
        />
        <SidebarInset className="max-h-screen overflow-y-hidden bg-background">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
