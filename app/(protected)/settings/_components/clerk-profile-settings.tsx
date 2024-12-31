"use client";
import PageWrapper from "@/components/page-wrapper";
import { UserProfile } from "@clerk/nextjs";

export function ClerkProfileSettings() {
  return (
    <PageWrapper>
      <div className="size-full flex justify-center items-center">
        <UserProfile path="/settings" />
      </div>
    </PageWrapper>
  );
}
