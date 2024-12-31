import { create } from "zustand";
import { InsertPostType, InsertCommentType } from "../db/schemas";

interface ChatStore {
  posts: InsertPostType[];
  setPosts: (posts: InsertPostType[]) => void;
  comments: InsertCommentType[];
  setComments: (comments: InsertCommentType[]) => void;
  showSettingsPanel: boolean;
  setShowSettingsPanel: (showSettingsPanel: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  posts: [],
  setPosts: (posts) => set({ posts }),
  comments: [],
  setComments: (comments) => set({ comments }),
  showSettingsPanel: false,
  setShowSettingsPanel: (showSettingsPanel) => set({ showSettingsPanel }),
}));
