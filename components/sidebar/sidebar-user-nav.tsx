"use client";

import { useClerk } from "@clerk/nextjs";
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Wallet,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { isAfter, parseISO } from "date-fns";
import { Button } from "../ui/button";
import { Plan } from "@/lib/types/global";

type Props = {
  currentPlan: Plan;
};

export function SidebarUserNav({ currentPlan }: Props) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const { signOut, user, loaded } = useClerk();
  const { push, refresh } = useRouter();
  const { setTheme, theme } = useTheme();

  if (!loaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            <Skeleton className="size-8 rounded-lg" />
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
            <Skeleton className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) redirect("/");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
                <AvatarFallback className="rounded-lg">
                  {user?.fullName}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.fullName}</span>
                <span className="truncate text-xs">
                  {user?.emailAddresses[0].emailAddress}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user?.fullName}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.fullName}
                  </span>
                  <div className="truncate text-xs">
                    <div className="text-xs px-0">
                      {currentPlan.charAt(0).toUpperCase() +
                        currentPlan.slice(1)}{" "}
                      Plan
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  {" "}
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/subscriptions">
                  <CreditCard />
                  Subscriptions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/subscriptions/plans">
                  <Wallet />
                  Plans
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full flex items-center gap-x-1.5 text-left justify-start px-2">
                    <Sun className="mr-2 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute mr-2 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="capitalize">{theme}</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 size-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 size-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Laptop className="mr-2 size-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="text-left w-full"
                onClick={async () => {
                  await signOut(() => {
                    push("/");
                  });
                  if (pathname !== "/") push("/");
                }}
              >
                <LogOut />
                Log out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
