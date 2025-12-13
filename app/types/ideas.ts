export type Platform = "X" | "LinkedIn" | "Instagram" | "YouTube" | "Newsletter";
export type ContentType = "hook" | "thread" | "carousel" | "email" | "script" | "other";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type IdeaStatus = "Inbox" | "Ready" | "Drafting" | "Posted";
export type NextAction = "brain_dump" | "outline" | "publish";

export type IdeaAttachment = {
  id: string;
  type: "image" | "video" | "file" | "link" | "audio" | "document" | "other";
  url: string;
  name?: string;
  description?: string;
  size?: number;
  mimeType?: string;
  dataUrl?: string;
};

export type Idea = {
  id: string;
  text: string;
  platforms: Platform[];
  contentType: ContentType;
  energy: EnergyLevel;
  status: IdeaStatus;
  nextAction: NextAction;
  createdAt: string;
  updatedAt: string;
  referenceTweets?: string[];
  attachments?: IdeaAttachment[];
};

export type Filters = {
  platforms: Platform[];
  statuses: IdeaStatus[];
  timeframe: "today" | "week" | "someday" | null;
};

export type Streak = {
  currentStreak: number;
  lastIdeaDate: string | null;
};
