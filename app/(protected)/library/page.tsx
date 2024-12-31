import Link from "next/link";

import EmptyPageMessage from "@/components/empty-page-message";
import PageWrapper from "@/components/page-wrapper";
import { DataTable } from "@/components/table/data-table";
import { buttonVariants } from "@/components/ui/button";
import { createMetadata } from "@/lib/constants/metadata";
import { cn } from "@/lib/utils";

import { libraryColumns } from "./_components/library-columns";
import { getChatsByUserId } from "@/lib/db/queries";
import { handleError } from "@/lib/utils/error-handler";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";

export const metadata = createMetadata({
  title: "Library",
  description: "Chats history.",
});

export default async function Library() {
  const tasks = (await getChatsByUserId({}))?.data ?? [];

  async function deleteTaskById(ids: string[]) {}

  return (
    <PageWrapper>
      {tasks.length > 0 ? (
        <DataTable
          columns={libraryColumns}
          data={tasks}
          searchColumnName="title"
        />
      ) : (
        <EmptyPageMessage message={"You don't have any chats yet."}>
          <Link
            href={"/chat"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Start a new chat
          </Link>
        </EmptyPageMessage>
      )}
    </PageWrapper>
  );
}
