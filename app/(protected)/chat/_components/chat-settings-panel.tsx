"use client";
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SelectCommentType, SelectPostType } from "@/lib/db/schemas";
import { useChatStore } from "@/lib/stores/chat-store";
import { cn, fetcher } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useWindowSize } from "usehooks-ts";
import { ChatSettings } from "./subreddit/chat-settings";
import { usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { deletePostWithComments } from "@/lib/db/queries/resources";
import { toast } from "sonner";
import { handleError } from "@/lib/utils/error-handler";
import useSWR, { useSWRConfig } from "swr";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  id: string;
};

function DeletePostButton({
  postId,
  chatId,
}: {
  postId: string;
  chatId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const [result, error] = await handleError(
      deletePostWithComments({ postId, chatId }),
      {
        path: "delete post with comments",
      }
    );
    setIsDeleting(false);
    setIsOpen(false);

    if (error) {
      toast.error("Resource delete failed");
    } else {
      toast.success("Resource deleted successfully");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this post and all its related
              comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ChatSettingsPanel({ id }: Props) {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 850;
  const showSettingsPanel = useChatStore((state) => state.showSettingsPanel);
  const setShowSettingsPanel = useChatStore(
    (state) => state.setShowSettingsPanel
  );

  const {
    data: resources,
    isLoading,
    mutate,
  } = useSWR<{
    comments: SelectCommentType[];
    posts: SelectPostType[];
  }>(id ? `/api/resources?chatId=${id}` : null, fetcher, {
    fallbackData: { comments: [], posts: [] },
  });

  useEffect(() => {
    mutate();
  }, [id, mutate]);

  if (!isMobile)
    return (
      <SettingsPanel
        isLoading={isLoading}
        resources={resources ?? { comments: [], posts: [] }}
        id={id}
      />
    );
  return (
    <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
      <SheetContent className="p-0">
        <SheetHeader>
          <SheetTitle className="sr-only">Add Resources</SheetTitle>
        </SheetHeader>
        <SettingsPanel
          isLoading={isLoading}
          resources={resources ?? { comments: [], posts: [] }}
          id={id}
        />
      </SheetContent>
    </Sheet>
  );
}

type SettingsPanelProps = {
  resources: {
    comments: SelectCommentType[];
    posts: SelectPostType[];
  };
  id: string;
  isLoading: boolean;
};

export function SettingsPanel({
  resources,
  id,
  isLoading,
}: SettingsPanelProps) {
  const pathname = usePathname();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;

  const [commentsByPost, setCommentsByPost] = useState<Record<string, number>>(
    {}
  );
  const [groupedResources, setGroupedResources] = useState<
    Record<string, typeof resources.posts>
  >({});
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    uniqueSubreddits: 0,
    uniqueAuthors: 0,
  });

  useEffect(() => {
    // Calculate commentsByPost
    const newCommentsByPost = resources.comments.reduce((acc, comment) => {
      acc[comment.postId] = (acc[comment.postId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setCommentsByPost(newCommentsByPost);

    // Calculate groupedResources
    const newGroupedResources = resources.posts.reduce((acc, resource) => {
      (acc[resource.subreddit] = acc[resource.subreddit] || []).push(resource);
      return acc;
    }, {} as Record<string, typeof resources.posts>);
    setGroupedResources(newGroupedResources);

    // Calculate statistics
    setStats({
      totalPosts: resources.posts.length,
      totalComments: resources.comments.length,
      uniqueSubreddits: Object.keys(newGroupedResources).length,
      uniqueAuthors: new Set(resources.posts.map((r) => r.author)).size,
    });
  }, [resources]);

  if (isLoading) {
    return (
      <Card
        className={cn(
          "size-full flex flex-col gap-y-2 sm:gap-y-3 bg-background",
          {
            "p-0 border-none shadow-none": isMobile,
          }
        )}
      >
        <CardHeader className="pb-1 sm:pb-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto py-0">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 sm:pt-6">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-x-3 sm:gap-x-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={cn(
          "size-full flex flex-col gap-y-2 sm:gap-y-3 bg-background",
          {
            "p-0 border-none shadow-none": isMobile,
          }
        )}
      >
        <CardHeader className="pb-1 sm:pb-1.5 flex-row items-center justify-between">
          <div className="space-y-1 sm:space-y-1.5">
            <CardTitle className="text-base sm:text-lg">Resources</CardTitle>
            <CardDescription className="text-sm">
              Reddit posts grouped by subreddit
            </CardDescription>
          </div>
          {pathname !== "/chat" && (
            <ChatSettings id={id} hasResources={true}>
              <Button variant="outline" className="text-sm">
                <Plus size={14} /> {""}
                <span className="md:block">Add Resource</span>
              </Button>
            </ChatSettings>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto py-0">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedResources).length > 0 ? (
              Object.entries(groupedResources).map(([subreddit, posts]) => (
                <AccordionItem key={subreddit} value={subreddit}>
                  <AccordionTrigger className="text-base sm:text-lg font-semibold">
                    r/{subreddit} ({posts.length} posts)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 sm:space-y-4">
                      {posts.length === 0 ? (
                        <p>No resources found!</p>
                      ) : (
                        posts.map((post) => (
                          <Card
                            key={post.permalink}
                            className="bg-muted/50 relative"
                          >
                            <DeletePostButton postId={post.id} chatId={id} />
                            <CardContent className="pt-4 sm:pt-6">
                              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
                                <a
                                  href={`https://www.reddit.com${post.permalink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-primary"
                                >
                                  {post.title}
                                </a>
                              </h3>
                              <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Posted by u/{post.author}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {commentsByPost[post.id] || 0} comments from{" "}
                                  {post.numComments}
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm line-clamp-2">
                                {post.selftext}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="text-center pt-3">No resources found!</p>
            )}
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between text-xs sm:text-sm text-muted-foreground pb-2 sm:pb-3">
          <div className="flex gap-x-3 sm:gap-x-4">
            <p>{stats.totalPosts} posts</p>
            <p>{stats.totalComments} comments</p>
            <p>{stats.uniqueSubreddits} subreddits</p>
            <p>{stats.uniqueAuthors} authors</p>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
