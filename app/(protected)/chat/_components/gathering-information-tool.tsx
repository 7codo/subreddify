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
        <CardHeader className="px-3 md:px-4 pb-2 pt-3 md:pt-4">
          <CardTitle className="text-base md:text-lg">Resources</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-4 pt-1 pb-3 md:pb-4">
          <div className="space-y-2 md:space-y-3">
            <Skeleton className="h-4 md:h-5 w-full" />
            <Skeleton className="h-4 md:h-5 w-3/4" />
            <Skeleton className="h-4 md:h-5 w-1/2" />
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
      <CardHeader className="px-3 md:px-4 pb-2 pt-3 md:pt-4">
        <CardTitle className="text-base md:text-lg">Resources</CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-4 pt-1 pb-3 md:pb-4">
        {!posts && !comments ? (
          <div className="space-y-2 md:space-y-3">
            <Skeleton className="h-4 md:h-5 w-full" />
            <Skeleton className="h-4 md:h-5 w-3/4" />
            <Skeleton className="h-4 md:h-5 w-1/2" />
          </div>
        ) : (
          <Collapsible>
            <div className="flex items-center justify-between">
              <p className="text-xs md:text-sm text-muted-foreground">
                Found: {posts.length} posts, {comments.length} comments
              </p>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 md:h-9">
                  <ChevronDown className="size-4 md:size-5" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-4 space-y-5">
              {posts.length > 0 && (
                <div>
                  <h3 className="text-sm md:text-base font-semibold mb-3">
                    Posts
                  </h3>
                  <div className="space-y-3">
                    {posts.map((post, index) => (
                      <div
                        key={index}
                        className="p-2.5 md:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm md:text-base font-medium hover:text-primary"
                        >
                          {post.title}
                        </a>
                        <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground mt-1.5">
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
                  <h3 className="text-sm md:text-base font-semibold mb-3">
                    Comments
                  </h3>
                  <div className="space-y-3">
                    {comments.map((comment, index) => (
                      <div
                        key={index}
                        className="p-2.5 md:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm md:text-base">{comment.body}</p>
                        <div className="flex flex-wrap gap-2 text-xs md:text-sm text-muted-foreground mt-1.5">
                          <span>u/{comment.author}</span>
                          <span>•</span>
                          <span>{comment.score ?? 0} points</span>
                          <span>•</span>
                          <span>{formatDate(comment.created)}</span>
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
