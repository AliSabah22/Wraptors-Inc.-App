// ─── User & Auth ────────────────────────────────────────────────────────────

export type MembershipTier = 'guest' | 'standard' | 'gold' | 'platinum';

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string;
  membershipTier: MembershipTier;
  membershipExpiry?: string; // ISO date
  avatarUrl?: string;
  joinedAt: string; // ISO date
  referralCode: string;
  notificationPreferences: NotificationPreferences;
  vehicles: Vehicle[];
}

export interface NotificationPreferences {
  serviceUpdates: boolean;
  promotions: boolean;
  news: boolean;
  emergencyAlerts: boolean;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
  imageUrl?: string;
}

// ─── Service Job & Tracking ───────────────────────────────────────────────────

export type ServiceJobStatus =
  | 'pending'
  | 'in_progress'
  | 'awaiting_parts'
  | 'quality_check'
  | 'completed'
  | 'cancelled';

export interface ServiceJob {
  id: string;
  userId: string;
  vehicleId: string;
  vehicle: Vehicle;
  serviceType: string;
  serviceCategory: ServiceCategory;
  description: string;
  status: ServiceJobStatus;
  progressPercent: number;
  currentStageName: string;
  estimatedCompletion: string; // ISO date
  startedAt: string; // ISO date
  completedAt?: string; // ISO date
  technicianName: string;
  stages: ServiceStage[];
  notes?: string;
  thumbnailUrl?: string;
  totalCost?: number;
  invoiceUrl?: string;
}

export type StageStatus = 'pending' | 'in_progress' | 'completed';

export interface ServiceStage {
  id: string;
  jobId: string;
  name: string;
  description: string;
  progressPercent: number; // what % reaching this stage means
  status: StageStatus;
  completedAt?: string; // ISO date
  technicianNote?: string;
  mediaPlaceholders: MediaPlaceholder[];
  order: number;
}

export interface MediaPlaceholder {
  id: string;
  type: 'photo' | 'video';
  label: string;
  url?: string; // will be a real URL when backend is connected
  uploadedAt?: string;
}

// ─── Service Catalog ─────────────────────────────────────────────────────────

export type ServiceCategory =
  | 'full_wrap'
  | 'ppf'
  | 'ceramic_coating'
  | 'chrome_delete'
  | 'tint'
  | 'detailing'
  | 'custom';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  tagline: string;
  description: string;
  benefits: string[];
  priceRange: string;
  estimatedDays: string;
  imageUrl?: string;
  popular: boolean;
}

// ─── Quote Request ────────────────────────────────────────────────────────────

export type QuoteStatus = 'submitted' | 'reviewing' | 'quoted' | 'accepted' | 'declined';

export interface QuoteRequest {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: string;
  serviceCategory: ServiceCategory;
  serviceDetails: string;
  additionalInfo?: string;
  imageUris: string[];
  status: QuoteStatus;
  submittedAt: string; // ISO date
  quotedPrice?: number;
  quotedAt?: string; // ISO date
}

// ─── Store / Products ─────────────────────────────────────────────────────────

export type ProductCategory = 'care_kit' | 'accessories' | 'apparel' | 'tools';

export interface StoreProduct {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  featured: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  productId: string;
  product: StoreProduct;
  quantity: number;
}

// ─── News / Articles ──────────────────────────────────────────────────────────

export type NewsCategory = 'shop_update' | 'delivery' | 'care_tips' | 'new_service' | 'promotion';

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  excerpt: string;
  body: string;
  imageUrl?: string;
  publishedAt: string; // ISO date
  author: string;
  readTimeMinutes: number;
  featured: boolean;
}

// ─── Emergency Request ────────────────────────────────────────────────────────

export type IssueType =
  | 'wrap_damage'
  | 'ppf_issue'
  | 'paint_chip'
  | 'ceramic_failure'
  | 'other';

export interface EmergencyRequest {
  id: string;
  userId?: string;
  vehicleId?: string;
  issueType: IssueType;
  vehicleDescription: string;
  description: string;
  imageUris: string[];
  submittedAt: string;
  status: 'submitted' | 'acknowledged' | 'dispatched' | 'resolved';
  contactPhone: string;
}

// ─── Membership Plan ──────────────────────────────────────────────────────────

export interface MembershipPlan {
  id: string;
  tier: MembershipTier;
  name: string;
  price: number; // per year
  benefits: string[];
  color: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'service_update' | 'promotion' | 'news' | 'emergency';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

// ─── Service History ─────────────────────────────────────────────────────────

export interface ServiceHistoryRecord {
  id: string;
  jobId: string;
  userId: string;
  vehicle: Vehicle;
  serviceType: string;
  serviceCategory: ServiceCategory;
  completedAt: string;
  finalStatus: 'completed' | 'cancelled';
  totalCost: number;
  thumbnailUrl?: string;
  technicianName: string;
  stages: ServiceStage[];
  invoicePlaceholder: string;
  nextServiceRecommendation: string;
  rating?: number;
}
