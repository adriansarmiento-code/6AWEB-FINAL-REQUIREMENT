// ============================================================
// USER & AUTH
// ============================================================

export interface ProviderService {
  _id?: string;
  name: string;
  description?: string;
  price: number;
}

export interface ProviderInfo {
  category?: 'plumbing' | 'electrical' | 'cleaning' | 'carpentry' | 'painting' | 'hvac' | 'landscaping' | 'appliance-repair' | 'other';
  serviceArea?: string;
  neighborhoods?: string[];
  yearsExperience?: number;
  hourlyRate?: number;
  bio?: string;
  skills?: string[];
  services?: ProviderService[];
  verified?: boolean;
  completedJobs?: number;
  rating?: number;
  reviewCount?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  profileImage?: string | null;
  isActive?: boolean;
  providerInfo?: ProviderInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  profileImage?: string | null;
  providerInfo?: ProviderInfo;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'customer' | 'provider';
  providerInfo?: Partial<ProviderInfo>;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  providerInfo?: Partial<ProviderInfo>;
}

// ============================================================
// BOOKING
// ============================================================

export interface BookingService {
  name: string;
  price: number;
  description?: string;
}

export interface Booking {
  _id: string;
  customer: User | string;
  provider: User | string;
  hasReview: boolean;
  service: BookingService;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'held-in-escrow' | 'released' | 'refunded';
  platformFee: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  providerId: string;
  service: BookingService;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

export interface UpdateBookingPayload {
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'held-in-escrow' | 'released' | 'refunded';
}

// ============================================================
// REVIEW
// ============================================================

export interface ReviewResponse {
  text: string;
  date: string;
}

export interface Review {
  _id: string;
  booking: Booking | string;
  customer: User | string;
  provider: User | string;
  rating: number;
  comment: string;
  response?: ReviewResponse;
  status: 'pending' | 'approved' | 'flagged' | 'removed';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment: string;
}

// ============================================================
// MESSAGE
// ============================================================

export interface Message {
  _id: string;
  sender: User | string;
  receiver: User | string;
  content: string;
  read: boolean;
  createdAt?: string;
}


export interface Conversation {
  _id: string;
  participants: (User | string)[];
  lastMessage?: Message | string;
  unreadCount?: number;
  updatedAt?: string;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  _id: string;
  user: string;
  type: 'booking' | 'message' | 'review' | 'payment' | 'system';
  title: string;
  message: string;
  relatedId?: string;
  relatedModel?: 'Booking' | 'Message' | 'Review' | 'Payment';
  read: boolean;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// ADMIN
// ============================================================

export interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  totalReviews: number;
  pendingBookings: number;
  completedBookings: number;
  monthlyRevenue?: number;
  recentActivity?: ActivityItem[];
}

export interface ActivityItem {
  type: 'booking' | 'user' | 'review';
  icon: string;
  title: string;
  description: string;
  time: string;
  timestamp?: string;
}
// ============================================================
// API RESPONSE WRAPPERS
// ============================================================

export interface ProvidersResponse {
  count: number;
  providers: User[];
}

export interface BookingsResponse {
  count: number;
  bookings: Booking[];
}

export interface ReviewsResponse {
  count: number;
  reviews: Review[];
}

export interface MessagesResponse {
  messages: Message[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface AdminUsersResponse {
  users: User[];
}

export interface AdminProvidersResponse {
  providers: User[];
}

export interface AdminBookingsResponse {
  bookings: Booking[];
}

export interface AdminReviewsResponse {
  reviews: Review[];
}

export interface AdminActivityResponse {
  activities: ActivityItem[];
}

export interface UploadImageResponse {
  message: string;
  user: User;
}

export interface CancelBookingResponse {
  message: string;
  booking: Booking;
}