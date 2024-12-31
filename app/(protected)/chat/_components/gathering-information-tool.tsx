import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { RelevantContentType } from "@/lib/ai/embeddings";

const GatheringInformationTool = ({
  result,
}: {
  result?: RelevantContentType;
}) => {
  // Safeguard against undefined result
  if (!result) {
    return (
      <Card className="p-0">
        <CardHeader className="px-2 sm:px-3 pb-1 pt-2 sm:pt-3">
          <CardTitle className="sm:text-lg">Resources</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-3 pt-1 pb-2 sm:pb-3">
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-full" />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { posts, comments } = result;
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="p-0">
      <CardHeader className="px-2 sm:px-3 pb-1 pt-2 sm:pt-3">
        <CardTitle className="sm:text-lg">Resources</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-3 pt-1 pb-2 sm:pb-3">
        {!posts && !comments ? (
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-full" />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
          </div>
        ) : (
          <Collapsible>
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Found: {posts.length} posts, {comments.length} comments
              </p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-3 space-y-4">
              {posts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Posts</h3>
                  <div className="space-y-2">
                    {posts.map((post, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:text-primary"
                        >
                          {post.title}
                        </a>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>r/{post.subreddit}</span>
                          <span>•</span>
                          <span>u/{post.author}</span>
                          <span>•</span>
                          <span>{post.score ?? 0} points</span>
                          <span>•</span>
                          <span>{formatDate(post.created)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Comments</h3>
                  <div className="space-y-2">
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm">{comment.body}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>u/{comment.author}</span>
                          <span>•</span>
                          <span>{comment.score ?? 0} points</span>
                          <span>•</span>
                          <span>{formatDate(comment.created)}</span>
                          <span>•</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default GatheringInformationTool;
