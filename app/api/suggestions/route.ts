import { auth } from "@clerk/nextjs/server";
import { getSuggestionsByDocumentId } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return new Response("Not Found", { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const suggestions = (
    await getSuggestionsByDocumentId({
      documentId,
    })
  )?.data;

  if (!suggestions) {
    return new Response("suggestions not found", { status: 404 });
  }
  const suggestion = suggestions[0];

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (suggestion.userId !== userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json(suggestions, { status: 200 });
}
