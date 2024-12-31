import { Accordion } from "@/components/ui/accordion";
import { FAQS } from "@/lib/constants";

import SectionWrapper from "./section-wrapper";
import CustomAccordionItem from "./ui/custom-accordion-item";

export const FAQ = () => (
  <SectionWrapper
    title="Frequently Ask Questions"
    id="faqs"
    className="lg:max-w-6xl"
  >
    <Accordion
      type="single"
      collapsible
      className="w-full grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6"
    >
      {FAQS.map(({ question, answer }, index) => (
        <CustomAccordionItem key={index} title={question} content={answer} />
      ))}
    </Accordion>
  </SectionWrapper>
);
