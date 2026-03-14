export type MediaPlatform = 'instagram' | 'tiktok' | 'youtube';

export type MediaFilter = 'all' | MediaPlatform;

export type MediaCategory =
  | 'wrap'
  | 'ppf'
  | 'ceramic'
  | 'tint'
  | 'detailing'
  | 'reveal'
  | 'bts'
  | 'education';

export interface MediaVideo {
  id: string;
  title: string;
  description: string;
  /** Optional real thumbnail URL — falls back to branded gradient placeholder */
  thumbnailUrl?: string;
  /** Deep link to the video on its platform */
  videoUrl: string;
  platform: MediaPlatform;
  views: number;
  /** ISO date string */
  createdAt: string;
  category: MediaCategory;
  /** e.g. "2:34" */
  duration?: string;
  /** e.g. "BMW M4 Competition" */
  vehicleName?: string;
  isFeatured?: boolean;
  tags?: string[];
  // FUTURE: savedByUsers, likes, membersOnly, featuredOrder
}
