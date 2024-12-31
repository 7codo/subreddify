"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FrownIcon, MehIcon, SmileIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { handleError } from "@/lib/utils/error-handler";
const formSchema = z.object({
  rating: z.enum(["negative", "neutral", "positive"], {
    required_error: "Please select a rating.",
  }),
  feedback: z.string().min(1, {
    message: "Feedback is required.",
  }),
});

type Props = {
  customOpen: boolean;
};

export function FeedbackDialog({ customOpen }: Props) {
  const [open, setOpen] = useState(customOpen);

  useEffect(() => {
    setOpen(customOpen);
  }, [customOpen]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const [_, error] = await handleError(
      fetch("/api/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Feedback Received",
          description: values.feedback,
          fields: [
            {
              name: "Rating",
              value: values.rating,
              inline: true,
            },
          ],
        }),
      }),
      {
        message: "Failed to send feedback",
        path: "FeedbackDialog.onSubmit",
      }
    );

    if (error) {
      toast.error(`Something went wrong! Please try again later.`);
      return;
    }
    toast.success("Thank you for your feedback!");

    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
          <DialogDescription>
            We&apos;d love to hear what went well or how we can improve the
            product experience.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex justify-center gap-4">
                    {[
                      {
                        value: "negative",
                        icon: FrownIcon,
                        label: "Not great",
                      },
                      { value: "neutral", icon: MehIcon, label: "Okay" },
                      { value: "positive", icon: SmileIcon, label: "Great" },
                    ].map((option) => (
                      <FormControl key={option.value}>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className={cn(
                            "h-20 w-20 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/10",
                            field.value === option.value &&
                              "border-primary bg-primary/10"
                          )}
                          onClick={() => field.onChange(option.value)}
                          data-state={
                            field.value === option.value ? "active" : "inactive"
                          }
                        >
                          <div className="flex flex-col items-center gap-1">
                            <option.icon className="size-8" />
                            <span className="text-xs font-normal">
                              {option.label}
                            </span>
                          </div>
                        </Button>
                      </FormControl>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Your feedback here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button loading={form.formState.isSubmitting} type="submit">
                Submit Feedback
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
