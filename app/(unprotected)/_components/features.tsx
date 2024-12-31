import Image from "next/image";
import { Search, Users, TrendingUp, FolderTree } from "lucide-react";
import SectionWrapper from "./section-wrapper";

export function Features() {
  return (
    <SectionWrapper
      title="Smart, Simple, and Strategic"
      description="Turn Reddit Communities Into Your Secret Weapon"
      id="features"
    >
      <div className="grid gap-8 md:gap-12 container px-4 max-w-4xl mx-auto relative">
        <FeatureCard
          icon={<Users className="size-8" />}
          title="130,000 active communities"
          description="Effortless Research: Select Reddit communities that align with your target audience and choose how many posts to pull into your knowledge base. Let Subreddify handle the rest."
          image="/images/search-communities.png?height=400&width=600"
          imageAlt="Active communities dashboard"
          align="right"
        />

        <FeatureCard
          icon={<Search className="size-8" />}
          title="Find them in minutes"
          description="Actionable Insights: Quickly explore conversations that matter. Uncover pain points, emerging ideas, and opportunities by diving directly into posts and comments, saving time and gaining valuable knowledge effortlessly."
          image="/images/find-them.png?height=400&width=600"
          imageAlt="Search interface"
          align="left"
        />

        <FeatureCard
          icon={<TrendingUp className="size-8" />}
          title="Discover breakout niches"
          description="Endless Opportunities: Each chat opens a window into your audience's world. Stay current with real-time insights and spot emerging trends before they go mainstream."
          image="/images/breakout-niches.png?height=400&width=600"
          imageAlt="Trending communities"
          align="right"
        />

        <FeatureCard
          icon={<FolderTree className="size-8" />}
          title="Organize multiple audiences"
          description="Multiple customer types? No problem. Organize and filter your research by community categories, and refresh your knowledge base anytime to stay up to date with new trends."
          image="/images/multiple-audiences.png?height=400&width=600"
          imageAlt="Audience organization"
          align="left"
        />
      </div>
    </SectionWrapper>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
}

function FeatureCard({
  icon,
  title,
  description,
  image,
  imageAlt,
  align,
}: FeatureCardProps) {
  return (
    <div
      className={`grid gap-8 items-center ${
        align === "left"
          ? "md:grid-cols-[1fr_1.2fr]"
          : "md:grid-cols-[1.2fr_1fr]"
      }`}
    >
      <div className={`space-y-4 ${align === "right" ? "md:order-2" : ""}`}>
        <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/15">
          <div className="text-primary">{icon}</div>
        </div>
        <h3 className="text-lg md:text-xl font-bold ">{title}</h3>
        <p className="text-base text-foreground">{description}</p>
      </div>
      <div
        className={`relative group ${align === "right" ? "md:order-1" : ""}`}
      >
        <div className="relative overflow-hidden rounded-xl border border-white/10 transition-transform hover:scale-[1.02] duration-500">
          <Image
            src={image}
            alt={imageAlt}
            width={600}
            height={400}
            className="object-cover w-full aspect-[3/2]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primay-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </div>
  );
}
