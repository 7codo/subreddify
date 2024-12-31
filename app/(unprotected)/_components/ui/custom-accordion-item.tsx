import { Markdown } from "@/components/markdown";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
  title: string;
  content: string;
};
export default function CustomAccordionItem({ title, content }: Props) {
  return (
    <AccordionItem
      value={title.toLowerCase().replace(" ", "-")}
      className="border-b border-muted"
    >
      <AccordionTrigger className="flex justify-between items-center py-4 px-6 md:text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-muted transition-colors hover:no-underline text-left">
        {title}
      </AccordionTrigger>
      <AccordionContent className="px-6 pt-2 pb-4 text-gray-600 dark:text-gray-200">
        <Markdown>{content}</Markdown>
      </AccordionContent>
    </AccordionItem>
  );
}
