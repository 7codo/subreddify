"use client";
import { FlagIcon } from "lucide-react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import { FeedbackDialog } from "./feedback-dialog";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import { useWindowSize } from "usehooks-ts";

type Props = {
  title?: string;
  rightChildren?: React.ReactNode;
};

const Header: React.FC<Props> = ({ title, rightChildren }) => {
  const pathname = usePathname();
  const paths = pathname.split("/");
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const mainPage = paths[1];
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;

  return (
    <>
      <header className="flex justify-between h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-6 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                {paths.length === 2 ? (
                  <BreadcrumbPage className="capitalize">
                    {mainPage}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="capitalize" href={`/${mainPage}`}>
                    {mainPage}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {title && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-x-2">
          {rightChildren}
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setOpenFeedbackDialog((prevState) => !prevState);
              }}
            >
              <FlagIcon size={14} />
            </Button>
          )}
        </div>
      </header>
      <FeedbackDialog customOpen={openFeedbackDialog} />
    </>
  );
};

export default Header;
