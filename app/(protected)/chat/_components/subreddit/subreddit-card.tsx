"use client";

import { Card } from "@/components/ui/card";
import { MessageCircle, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface SubredditCardProps {
  data: {
    display_name: string;
    subscribers: number;
    public_description: string;
    active_user_count: number;
  };
  isSelected: boolean;
  onSelect: () => void;
  settings?: {
    postCount: number;
    category: string;
    includeComments: boolean;
    depth: number;
  };
  onSettingsChange?: (settings: {
    postCount: number;
    category: string;
    includeComments: boolean;
    depth: number;
  }) => void;
}

const SubredditCard: React.FC<SubredditCardProps> = ({
  data,
  isSelected,
  onSelect,
  settings = {
    postCount: 5,
    category: "hot",
    includeComments: false,
    depth: 1,
  },
  onSettingsChange,
}) => {
  if (!isSelected) {
    return (
      <Card
        className="p-3 sm:p-4 mb-2 cursor-pointer hover:bg-secondary transition-colors"
        onClick={onSelect}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
          <h3 className="font-bold">r/{data.display_name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="size-4" />
            <span>{data.subscribers?.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {data.public_description}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3 sm:p-4 mb-2 border-2 border-primary">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
        <h3 className="font-bold">r/{data.display_name}</h3>
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="size-4" />
            <span>{data.subscribers.toLocaleString()}</span>
          </div>
          <button
            onClick={onSelect}
            className="p-1 hover:bg-secondary rounded-full transition-colors absolute -right-4 -top-4"
            title="Remove subreddit"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {data.public_description}
      </p>

      <div className="flex flex-col gap-4 mt-4 items-center w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm whitespace-nowrap">Posts:</span>
            <Input
              type="number"
              className="w-full sm:w-20"
              value={settings.postCount}
              minLength={1}
              onChange={(e) =>
                onSettingsChange?.({
                  postCount: parseInt(e.target.value) || 1,
                  category: settings.category,
                  includeComments: settings.includeComments,
                  depth: settings.depth,
                })
              }
              onClick={(e) => e.stopPropagation()}
              min={1}
              max={100}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm whitespace-nowrap">Category:</span>
            <Select
              value={settings.category}
              onValueChange={(value) =>
                onSettingsChange?.({
                  postCount: settings.postCount,
                  category: value,
                  includeComments: settings.includeComments,
                  depth: settings.depth,
                })
              }
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="controversial">Controversial</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap">Include comments:</span>
            <Switch
              checked={settings.includeComments}
              onCheckedChange={(checked) =>
                onSettingsChange?.({
                  ...settings,
                  includeComments: checked,
                })
              }
            />
          </div>

          {settings.includeComments && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm whitespace-nowrap">Reply depth:</span>
              <Input
                type="number"
                className="w-full sm:w-20"
                value={settings.depth}
                minLength={1}
                onChange={(e) =>
                  onSettingsChange?.({
                    ...settings,
                    depth: parseInt(e.target.value) || 1,
                  })
                }
                onClick={(e) => e.stopPropagation()}
                min={1}
                max={10}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SubredditCard;
