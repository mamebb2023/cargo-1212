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
