import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Contact us",
    href: "/contact-us",
  },
];

export const Footer = () => {
  return (
    <footer className="flex container mx-auto px-6 pb-6 border-t">
      <div className="flex items-center justify-between w-full text-sm flex-wrap gap-3 pt-10 md:pt-20">
        <p className="">© Copyright 2024. Subreddify. All rights reserved.</p>
        <ul className="flex gap-1 flex-wrap">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className={cn(buttonVariants({ variant: "link" }), "px-1.5")}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
