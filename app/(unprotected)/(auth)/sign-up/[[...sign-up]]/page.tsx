import { SignUp } from "@clerk/nextjs";

import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Sign up",
  description: "Sign up",
});

export default function Page() {
  return (
    <section className="flex h-[calc(100vh_-_3.5rem)] w-full items-center justify-center">
      <SignUp forceRedirectUrl="/chat" />
    </section>
  );
}
