import { Mail, MessageCircle } from "lucide-react";

import { createMetadata } from "@/lib/constants/metadata";
import { ContactForm } from "../_components/contact-form";

export const metadata = createMetadata({
  title: "Contact us",
  description: "Contact us.",
});

export default function ContactPage() {
  return (
    <div className="mx-auto px-4 py-12 ">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        Get in Touch
      </h1>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Send us a message
            </h2>
            <p className="text-muted-foreground">
              Fill out the form and we&apos;ll get back to you as soon as
              possible.
            </p>
          </div>
          <div className="bg-primary/5 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Email us directly
            </h2>
            <p className="text-muted-foreground mb-2">
              Or send us an email directly.
            </p>
            <a
              href="mailto:support@browsim.co"
              className="text-primary hover:underline break-all"
            >
              support@browsim.co
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
