import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { VARIANT_ID } from "@/lib/constants";

export const CTA = () => (
  <div className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
    {/* Gradient background */}
    {/* <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" /> */}

    {/* Animated background shapes */}

    <div className="relative max-w-5xl mx-auto">
      <div className="rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl border border-white/20 bg-gradient-to-br from-primary via-primary/80 to-primary/60">
        <div className="flex flex-col items-center gap-8 sm:gap-10 text-center text-white backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">
              Start Your Automation Journey
            </span>
          </div>

          <div className="space-y-4 sm:space-y-6 max-w-3xl">
            <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200">
              Ready to Automate Smarter?
            </h3>
            <p className="text-lg sm:text-xl leading-relaxed text-white/90 w-full sm:w-[70%] mx-auto text-center">
              Get started in minutes and experience web automation like never
              before.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white text-primary hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl rounded-full"
              asChild
            >
              <Link href={`/sign-up`}>
                Try it Free{" "}
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
              </Link>
            </Button>
            <p className="text-sm sm:text-base text-white/80">
              no credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
