import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  id?: string;
};

const SectionWrapper: React.FC<Props> = ({
  children,
  title,
  description,
  className,
  id,
}) => {
  return (
    <section
      className={cn(
        "py-8 space-y-6 sm:py-16 sm:space-y-3 md:py-24 md:space-y-6"
      )}
      id={id}
    >
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-xl sm:text-2xl md:text-3xl">{title}</h2>
        <p className="text-base md:text-lg">{description}</p>
      </div>
      <div
        className={cn(
          "md:max-w-screen-2xl mx-auto px-3 sm:px-6 md:px-2",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
