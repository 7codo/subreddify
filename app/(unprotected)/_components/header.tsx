"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const navigationItems = [
  { title: "Home", href: "#home" },
  { title: "Features", href: "#features" },
  { title: "Pricing", href: "#pricing" },
  { title: "FAQs", href: "#faqs" },
];

export default function Header() {
  const pathname = usePathname();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  function navigate(id: string) {
    if (pathname !== "/") push(`/${id}`);
    else
      document.querySelector(`${id}`)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header
      className="sticky top-0 sm:top-3 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 container  md:max-w-3xl lg:max-w-4xl rounded-none sm:rounded-xl mx-auto border shadow-sm md:px-0"
      id="top"
    >
      <div className="px-6 flex h-14 items-center mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Subreddify"
            width={120}
            height={30}
          />
        </Link>
        <div className="flex flex-1 items-center justify-center">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <ul className="flex items-center space-x-3 text-sm font-medium">
              {navigationItems.map((item) => (
                <li key={item.title}>
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                    }}
                  >
                    {item.title}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <nav className="flex items-center space-x-1">
          <div className="hidden md:flex items-center gap-2 ">
            <AuthenticationButtons />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="size-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <MobileNav setOpen={setOpen} />
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}

type MobileNavProps = {
  setOpen: (open: boolean) => void;
};

function MobileNav({ setOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { push } = useRouter();

  function navigate(id: string) {
    if (pathname !== "/") push(`/${id}`);
    else
      document.querySelector(`${id}`)?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div className="flex flex-col space-y-3 px-4">
      {navigationItems.map((item) => (
        <Button
          key={item.href}
          variant="link"
          className="text-left"
          onClick={(e) => {
            e.preventDefault();
            navigate(item.href);
            setOpen(false);
          }}
        >
          {item.title}
        </Button>
      ))}
      <div className="space-y-2">
        <AuthenticationButtons setOpen={setOpen} />
      </div>
    </div>
  );
}

type AuthenticationButtonsProps = {
  setOpen?: (open: boolean) => void;
};

function LoadingButtons() {
  return (
    <>
      <Skeleton className="h-10 w-16" />
      <Skeleton className="h-10 w-24" />
    </>
  );
}

export function AuthenticationButtons({ setOpen }: AuthenticationButtonsProps) {
  const { isLoaded, userId } = useAuth();
  const pathname = usePathname();
  const { push } = useRouter();

  function navigate(id: string) {
    if (pathname !== "/") push(`/${id}`);
    else
      document.querySelector(`${id}`)?.scrollIntoView({ behavior: "smooth" });
  }

  if (!isLoaded) {
    return <LoadingButtons />;
  }

  if (userId) {
    return (
      <Button variant="link" asChild>
        <Link href="/chat">Dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="link"
        onClick={() => {
          push("/sign-in");
          setOpen && setOpen(false);
        }}
      >
        Sign in
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          navigate("#pricing");
          setOpen && setOpen(false);
        }}
      >
        Get started
      </Button>
    </>
  );
}
