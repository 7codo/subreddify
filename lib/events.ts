import { headers } from "next/headers";

export async function createEventStream(chatId: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Add event to the queue
      const push = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Store the push function for external access
      (global as any)[`progress_${chatId}`] = push;
    },
  });

  return stream;
}

export function emitProgress(chatId: string, progress: number) {
  const push = (global as any)[`progress_${chatId}`];
  if (push) {
    push("progress", { progress });
  }
}
