"use client";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createResource, getChatById, saveChat } from "@/lib/db/queries";
import { useState } from "react";
import SubredditCard from "./subreddit-card";
import { useChatStore } from "@/lib/stores/chat-store";
import { handleError } from "@/lib/utils/error-handler";
import { z } from "zod";
import { InsertCommentType, InsertPostType } from "@/lib/db/schemas";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export interface SubredditData {
  data: {
    id: string;
    display_name: string;
    subscribers: number;
    public_description: string;
    active_user_count: number;
  };
}

interface Props {
  /*   posts: Post[];
  open: boolean;
  setOpen: (open: boolean) => void;
  setPosts: (posts: Post[]) => void; */
  openDialog?: boolean;
  id: string;
  hasResources?: boolean;
  children?: React.ReactNode;
}

export function ChatSettings({
  openDialog,
  id,
  children,
  hasResources,
}: Props) {
  const [subreddit, setSubreddit] = useState("");
  const [postCount, setPostCount] = useState("5");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [open, setOpen] = useState(openDialog);
  const [searchResults, setSearchResults] = useState<SubredditData[]>([]);
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([]);
  const [subredditSettings, setSubredditSettings] = useState<
    Record<
      string,
      {
        postCount: number;
        category: string;
        includeComments: boolean;
        depth: number;
      }
    >
  >({});
  const [noResults, setNoResults] = useState(false);
  const setPosts = useChatStore((state) => state.setPosts);
  const setComments = useChatStore((state) => state.setComments);
  const { mutate } = useSWRConfig();
  const SEARCH_LIMIT = 25; // Fixed limit for search results per page

  const handleSearch = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setNoResults(false);
    const currentPage = reset ? 0 : page;
    const after =
      reset || searchResults.length === 0
        ? ""
        : `&after=t3_${searchResults[searchResults?.length - 1]?.data?.id}`;

    const [data, error] = await handleError(
      fetch(
        `https://www.reddit.com/search.json?q=${subreddit}&type=sr&limit=${SEARCH_LIMIT}${after}`
      ).then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      }),
      { path: "handleSearch", message: "Failed to search subreddits" }
    );

    if (error || !data || Object.keys(data).length === 0) {
      setLoading(false);
      setNoResults(true);
      return;
    }
    const newResults = data.data?.children;

    if (!newResults || newResults?.length === 0) {
      setLoading(false);
      setNoResults(true);
      return;
    }

    setSearchResults(reset ? newResults : [...searchResults, ...newResults]);
    setHasMore(newResults.length === SEARCH_LIMIT);
    setPage(currentPage + 1);
    setLoading(false);
  };

  const isLikelyBotComment = (comment: string, author: string): boolean => {
    const botIndicators = [
      /^I am a bot/i,
      /bot here/i,
      /automated response/i,
      /^Good bot$|^Bad bot$/i,
      /AutoModerator/i,
    ];

    return (
      botIndicators.some((pattern) => pattern.test(comment)) ||
      /bot/i.test(author) ||
      author === "AutoModerator"
    );
  };

  const parseComments = (
    data: any,
    postPermalink: string,
    currentDepth: number = 0,
    maxDepth: number
  ): InsertCommentType[] => {
    if (!data?.data?.children || currentDepth >= maxDepth) {
      return [];
    }

    const comments: InsertCommentType[] = [];

    data.data.children
      .filter((child: any) => child.kind === "t1" && child.data)
      .forEach((child: any) => {
        if (!isLikelyBotComment(child.data.body, child.data.author)) {
          const comment: InsertCommentType = {
            body: child.data.body,
            author: child.data.author,
            score: child.data.score,
            created: child.data.created,
            chatId: id,
            postPermalink, // We temporarily store the permalink here
          };
          comments.push(comment);

          // Handle nested comments
          if (child.data.replies && currentDepth < maxDepth) {
            const nestedComments = parseComments(
              child.data.replies,
              postPermalink,
              currentDepth + 1,
              maxDepth
            );
            comments.push(...nestedComments);
          }
        }
      });

    return comments;
  };

  const fetchSubredditPosts = async (
    subredditName: string
  ): Promise<{ posts: InsertPostType[]; comments: InsertCommentType[] }> => {
    const settings = subredditSettings[subredditName] || {
      postCount: 5,
      category: "hot",
      includeComments: false,
      depth: 1,
    };
    let count = settings.postCount;

    const [data, error] = await handleError(
      fetch(
        `https://www.reddit.com/r/${subredditName}/${settings.category}.json?limit=${count}`
      ).then((res) => res.json()),
      {
        path: "fetchSubredditPosts",
        message: `Failed to fetch posts from ${subredditName}`,
      }
    );

    if (error || !data?.data?.children || !Array.isArray(data?.data?.children))
      return { posts: [], comments: [] };
    const result = data.data.children.slice(0, count);
    const posts: InsertPostType[] = [];
    const allComments: InsertCommentType[] = [];

    await Promise.all(
      result.map(async (post: any) => {
        const postData: InsertPostType = {
          title: post.data.title,
          selftext: post.data.selftext || "",
          author: post.data.author,
          score: post.data.score,
          created: post.data.created,
          permalink: post.data.permalink,
          subreddit: post.data.subreddit,
          numComments: post.data.num_comments,
          chatId: id,
        };
        posts.push(postData);

        if (settings.includeComments) {
          const [commentsData, commentsError] = await handleError(
            fetch(`https://www.reddit.com${post.data.permalink}.json`).then(
              (res) => res.json()
            ),
            { path: "fetchComments", logToConsole: false }
          );

          if (!commentsError && commentsData) {
            const comments = parseComments(
              commentsData[1],
              postData.permalink, // Using permalink instead of id
              0,
              settings.depth
            );
            allComments.push(...comments);
          }
        }
      })
    );

    return { posts, comments: allComments };
  };

  const handleStartChat = async () => {
    if (selectedSubreddits.length === 0) return;
    setSubmitting(true);

    try {
      const postsData: InsertPostType[] = [];
      const commentsData: InsertCommentType[] = [];

      await Promise.all(
        selectedSubreddits.map(async (subredditName) => {
          const { posts, comments } = await fetchSubredditPosts(subredditName);
          postsData.push(...posts);
          commentsData.push(...comments);
        })
      );

      const uniquePosts = Array.from(
        new Map(postsData.map((post) => [post.permalink, post])).values()
      );

      /*   const uniqueComments = Array.from(
        new Map(
          commentsData.map((comment) => [
            `${comment.postId}-${comment.body}-${comment.author}`,
            comment,
          ])
        ).values()
      ); */

      if (hasResources) {
        if (!id) return;
        const [result, error] = await handleError(
          createResource({
            postsData: uniquePosts,
            commentsData,
            chatId: id,
          }),
          {
            path: "chat settings",
          }
        );
        if (!result || error) {
          toast.error("Creating resource failed!");
        }
        mutate("/api/resources");
        setPosts([]);
        setComments([]);
        setOpen(false);
      } else {
        setPosts(uniquePosts);
        setComments(commentsData);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error in handleStartChat:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubredditSelection = (subredditName: string) => {
    setSelectedSubreddits((prev) => {
      const isRemoving = prev.includes(subredditName);
      if (isRemoving) {
        // Remove settings when unselecting a subreddit
        setSubredditSettings((prevSettings) => {
          const { [subredditName]: removed, ...rest } = prevSettings;
          return rest;
        });
        return prev.filter((name) => name !== subredditName);
      }
      return [...prev, subredditName];
    });
  };

  const handleSubredditSettings = (
    subredditName: string,
    settings: {
      postCount: number;
      category: string;
      includeComments: boolean;
      depth: number;
    }
  ) => {
    setSubredditSettings((prev) => ({
      ...prev,
      [subredditName]: settings,
    }));
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      handleSearch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Enter a subreddit name to search and select the number of posts to
            include.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 items-center">
          <Input
            id="subreddit"
            value={subreddit}
            onChange={(e) => setSubreddit(e.target.value)}
            placeholder="e.g., AskReddit"
          />
          <Button
            onClick={() => handleSearch(true)}
            className="w-fit"
            loading={loading}
          >
            Search
          </Button>
        </div>

        <ScrollArea className="h-[300px] w-full pr-4" onScroll={handleScroll}>
          {noResults ? (
            <div className="text-center py-4 text-muted-foreground">
              No results found. Please try a different keyword.
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((subreddit, index) => (
                <SubredditCard
                  key={index}
                  data={subreddit.data}
                  isSelected={selectedSubreddits.includes(
                    subreddit.data.display_name
                  )}
                  onSelect={() =>
                    toggleSubredditSelection(subreddit.data.display_name)
                  }
                  settings={subredditSettings[subreddit.data.display_name]}
                  onSettingsChange={(settings) =>
                    handleSubredditSettings(
                      subreddit.data.display_name,
                      settings
                    )
                  }
                />
              ))}
              {loading && <div className="text-center py-2">Loading...</div>}
            </>
          ) : (
            <p className="text-center py-2">Search to view results.</p>
          )}
        </ScrollArea>

        <DialogFooter className="sm:justify-end">
          <Button
            onClick={handleStartChat}
            disabled={selectedSubreddits.length === 0}
            loading={submitting}
          >
            {!hasResources
              ? `Start Chat (${selectedSubreddits.length} selected)`
              : `Add ${selectedSubreddits.length} resources`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
