export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type Role = "shipper" | "carrier" | "admin";

export type CarrierType = "company" | "plc" | "truck_owner" | "";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  is_verified: boolean;
  is_payment_confirmed: boolean;
  country: string;
  city: string;
  street: string;
  zip_code: string;
  company_name?: string;
  carrier_type?: CarrierType;
  number_of_trucks?: number;
  truck_libreh_number?: string;
  truck_tin_number?: string;
  average_rating?: number;
  total_ratings?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BidDetail {
  id: number;
  title: string;
  description: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  deadline: string;
  offers_deadline: string;
  budget: string;
  status?: string;
  postedDate?: string;
  offers?: number;
  lowestOffer?: string | null;
  originAddress?: string;
  destinationAddress?: string;
  specialRequirements?: string;
  shipperName?: string;
  shipperPhone?: string;
  shipperEmail?: string;
  bidFilesUrl?: string | null;
  selected_offer?: {
    delivery_completed?: boolean;
    carrier: {
      id: number;
      company_name?: string;
      full_name?: string;
      email?: string;
    };
  };
  user?: {
    id?: number;
    company_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

export interface BackendBidDetail {
  id: number;
  title: string;
  description: string;
  origin: string;
  destination: string;
  cargo_type: string;
  weight: string;
  deadline: string;
  offers_deadline: string;
  budget: string;
  status?: string;
  created_at?: string;
  offers_count?: number;
  lowest_offer?: string | null;
  origin_address?: string;
  destination_address?: string;
  special_requirements?: string;
  bid_files_url?: string | null;
  cargoType?: string;
  selected_offer?: {
    delivery_completed?: boolean;
    carrier: {
      id: number;
      company_name?: string;
      full_name?: string;
      email?: string;
    };
  };
  user?: {
    company_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

export interface LimitedBidDetail {
  id: number;
  title: string;
  description: string;
  origin: string;
  destination: string;
  cargo_type: string;
  weight: string;
  deadline: string;
  offers_deadline: string;
  budget: string;
  offers_count: number;
  lowest_offer?: string | null;
  requires_payment: boolean;
  payment_amount: string;
}

export type StatCard = {
  label: string;
  value: number | string | undefined;
  icon: React.ElementType;
};

export interface CountryCity {
  country: string;
  cities: string[];
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthPayload extends AuthTokens {
  user: User;
}

export interface BackendRegistrationPayload {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  zip_code: string;
  role?: Role;
  company_name?: string;
  carrier_type?: CarrierType;
  number_of_trucks?: number;
  truck_libreh_number?: string;
  truck_tin_number?: string;
}

export type QueryParams = Record<string, string | number | boolean>;

export interface DashboardStats {
  total_bids?: number;
  active_bids?: number;
  offers_received?: number;
  accepted_offers?: number;
  available_bids?: number;
  my_offers?: number;
  active_offers?: number;
  offers?: number;
  users?: number;
}

export interface DashboardBidSummary {
  id: number;
  title: string;
  description: string;
  status: string;
  budget: string;
  origin: string;
  destination: string;
  weight: string;
  cargo_type: string;
  deadline: string;
  offers_deadline: string;
  created_at: string;
  offers_count: number;
  lowest_offer?: string | null;
  user: {
    id: number;
    full_name: string;
    company_name: string | null;
    email: string;
    average_rating: number;
    total_ratings: number;
  };
}

export interface DashboardOverview {
  stats: DashboardStats;
  recent_bids: DashboardBidSummary[];
}

export interface VerificationDocument {
  id: number;
  document_type: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  file_url?: string | null;
  created_at?: string;
  reviewed_at?: string | null;
  user: User;
}

export interface AdminStats {
  total_users: number;
  active_bids: number;
  pending_documents: number;
  pending_payments?: number;
  total_offers: number;
  total_ratings?: number;
}

export interface AdminBid {
  id: number;
  title: string;
  description?: string;
  budget?: string;
  origin?: string;
  origin_address?: string;
  destination?: string;
  destination_address?: string;
  weight?: string;
  cargo_type?: string;
  special_requirements?: string;
  status?: string;
  deadline?: string;
  offers_deadline?: string;
  offers_count?: number;
  lowest_offer?: string | null;
  bid_files_url?: string | null;
  created_at?: string;
  updated_at?: string;
  user?: {
    id?: number;
    company_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  related_bid?: number | null;
  related_offer?: number | null;
  related_payment?: number | null;
  related_document?: number | null;
}

export interface NotificationsPayload {
  notifications: Notification[];
  unread_count: number;
}