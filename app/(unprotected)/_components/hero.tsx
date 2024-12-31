"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { BackgroundLines } from "./ui/background-lines";

export const Hero = () => {
  const [showVideo, setShowVideo] = useState(false);
  const pathname = usePathname();
  const { push } = useRouter();
  function navigate(id: string) {
    if (pathname !== "/") push(`/${id}`);
    else
      document.querySelector(`${id}`)?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <>
      <div
        className="py-3 md:pt-4 md:pb-20 relative px-0 sm:px-6 lg:px-24"
        id="home"
      >
        <div className="h-full w-full flex flex-col items-center justify-center gap-6 py-0">
          {/*   <BackgroundLines> */}
          <div className="flex gap-4 flex-col max-w-[29rem] sm:max-w-2xl md:max-w-3xl lg:mt-16">
            <div className="space-y-2 md:space-y-4 text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-center font-bold">
              <h1>Chat with Your Target</h1>
              <h1>
                Audience{" "}
                <span className="bg-primary px-px rounded-md text-white">
                  Effortlessly
                </span>
              </h1>
            </div>
            <p className="sm:text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground text-center max-w-[95%] md:max-w-[70%] mx-auto">
              Discover pain points, breakout niches, and content ideas from over
              130,000 active Reddit communities—without endless scrolling or
              digging through posts.
            </p>
          </div>
          <div className="space-y-2 flex flex-col items-center justify-center">
            <Button
              className="gap-4 z-10"
              size="lg"
              variant="landing"
              onClick={() => navigate("#pricing")}
            >
              Start Chating
            </Button>
            <p className="font-semibold text-center text-sm text-secondary-foreground">
              No credit card required
            </p>
          </div>
          {/* </BackgroundLines> */}
          {/* Video thumbnail and play button */}
          <div className="relative w-[98%] sm:max-w-[95%] md:max-w-[90%] aspect-video flex justify-center shadow-2xl bg-black rounded-md md:rounded-2xl mx-auto overflow-hidden">
            <div
              className="absolute inset-0 bg-black/25 flex items-center justify-center cursor-pointer group z-10"
              onClick={() => setShowVideo(true)}
            >
              <Button
                size="icon"
                variant="ghost"
                className="w-16 h-16 rounded-full bg-black/40 hover:bg-black/50 hover:scale-110 transition-all duration-300"
              >
                <Play className="w-8 h-8 text-white" />
              </Button>
            </div>

            <Image
              src="https://i.ytimg.com/vi/1sSTTjHH9Qk/maxresdefault.jpg"
              alt="Picture of the author"
              sizes="1000px"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>

          {/* Video modal */}
        </div>
      </div>
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-6xl aspect-video ">
              <Button
                size="icon"
                variant="ghost"
                className="absolute -top-12 right-0 text-white hover:bg-white/20 "
                onClick={() => setShowVideo(false)}
              >
                <X className="w-6 h-6" />
              </Button>
              <iframe
                className="w-full h-full rounded-lg "
                src="https://www.youtube.com/embed/1sSTTjHH9Qk?si=2n_0xJ8D899fTp0f&rel=0&modestbranding=1&controls=1&showinfo=0&autoplay=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
