// API service for backend communication
import type {
  ApiResponse,
  AuthPayload,
  BackendRegistrationPayload,
  QueryParams,
  CarrierType,
  User,
  DashboardOverview,
  VerificationDocument,
  AdminStats,
  AdminBid,
  NotificationsPayload,
} from "@/types";

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Normalize phone numbers so they pass the backend regex validator
const normalizePhone = (phone: string): string => {
  const trimmed = phone.trim();
  const hasPlusPrefix = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlusPrefix ? `+${digitsOnly}` : digitsOnly;
};

// Helper function to map frontend document names to backend document types
const mapDocumentType = (documentName: string): string => {
  const documentMapping: { [key: string]: string } = {
    // Shipper documents
    "Business License": "business_license",
    "Tax Identification Certificate": "tax_clearance",
    "Company Registration Document": "company_registration",
    "Identity Document": "identity_document",

    // Carrier company documents
    "Company business registration Doc.": "company_business_registration",
    "Company business license doc": "company_business_license",
    "Company competency certificate doc": "company_competency_certificate",
    "Company tax clearance doc": "company_tax_clearance",
    "Company vat certificate doc": "company_vat_certificate",

    // Carrier PLC documents
    "Plc registration doc": "plc_registration",
    "Plc business license doc": "plc_business_license",
    "Plc competency certificate doc": "plc_competency_certificate",
    "Plc tax clearance doc": "plc_tax_clearance",
    "Plc vat certificate doc": "plc_vat_certificate",

    // Carrier truck owner documents
    "Truck Business licence": "truck_business_licence",
  };

  return documentMapping[documentName] || documentName.toLowerCase().replace(/\s+/g, '_');
};

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  let data;
  try {
    data = await response.json();
  } catch {
    // If response is not JSON, create a generic error
    data = { message: 'An error occurred' };
  }

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Authentication required. Redirecting to login...');
    }

    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
};

// Helper to serialize query params with non-string values
const buildQueryString = (params?: QueryParams): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
};

// Helper function to make authenticated requests
const authRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleApiResponse<T>(response);
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleApiResponse<AuthPayload>(response);

    // Store tokens
    if (data.data) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
    }

    return data;
  },

  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    zipCode: string;
    role?: "shipper" | "carrier" | null;
    carrierSubcategory?: "company" | "plc" | "truckOwner" | null;
    carrierData?: {
      companyName?: string;
      companyNumberOfTrucks?: string;
      plcNumberOfTrucks?: string;
      truckLibrehNumber?: string;
      truckTinNumber?: string;
    };
  }) => {
    // Transform frontend data to backend expected format
    const backendData: BackendRegistrationPayload = {
      email: userData.email,
      password: userData.password,
      confirm_password: userData.confirmPassword,
      full_name: `${userData.firstName} ${userData.lastName}`,
      phone: normalizePhone(userData.phone),
      country: userData.country,
      city: userData.city,
      street: userData.street,
      zip_code: userData.zipCode,
    };

    // Add role-specific data
    if (userData.role) {
      backendData.role = userData.role;

      if (userData.role === "carrier" && userData.carrierSubcategory && userData.carrierData) {
        const carrierTypeMapping: Record<"company" | "plc" | "truckOwner", CarrierType> = {
          company: "company",
          plc: "plc",
          truckOwner: "truck_owner",
        };
        backendData.carrier_type = carrierTypeMapping[userData.carrierSubcategory];

        if (userData.carrierSubcategory === "company") {
          backendData.company_name = userData.carrierData.companyName;
          backendData.number_of_trucks = parseInt(userData.carrierData.companyNumberOfTrucks || "0");
        } else if (userData.carrierSubcategory === "plc") {
          backendData.number_of_trucks = parseInt(userData.carrierData.plcNumberOfTrucks || "0");
        } else if (userData.carrierSubcategory === "truckOwner") {
          backendData.truck_libreh_number = userData.carrierData.truckLibrehNumber;
          backendData.truck_tin_number = userData.carrierData.truckTinNumber;
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}/users/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    return handleApiResponse<AuthPayload>(response);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    return authRequest('/users/profile/');
  },

  updateProfile: async (userData: Partial<User>) => {
    return authRequest('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  uploadRegistrationDocuments: async (documents: { [key: string]: File }) => {
    const uploadPromises = Object.entries(documents).map(async ([documentName, file]) => {
      const documentType = mapDocumentType(documentName);
      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('file', file);

      return verificationApi.uploadDocument(formData);
    });

    return Promise.allSettled(uploadPromises);
  },

  completeRegistration: async (registrationData: {
    formData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      phone: string;
      country: string;
      city: string;
      street: string;
      zipCode: string;
    };
    selectedRole: "shipper" | "carrier";
    carrierSubcategory?: "company" | "plc" | "truckOwner";
    carrierData?: {
      companyName?: string;
      companyNumberOfTrucks?: string;
      plcNumberOfTrucks?: string;
      truckLibrehNumber?: string;
      truckTinNumber?: string;
    };
    files: { [key: string]: File };
  }) => {
    try {
      // Step 1: Register the user
      const userData = {
        ...registrationData.formData,
        role: registrationData.selectedRole,
        carrierSubcategory: registrationData.carrierSubcategory,
        carrierData: registrationData.carrierData,
      };

      const registrationResult = await authApi.register(userData);

      if (!registrationResult.success) {
        throw new Error(registrationResult.message || 'Registration failed');
      }

      // Store tokens from registration
      if (registrationResult.data) {
        localStorage.setItem('access_token', registrationResult.data.access_token);
        localStorage.setItem('refresh_token', registrationResult.data.refresh_token);
      }

      // Step 2: Upload documents if any
      if (Object.keys(registrationData.files).length > 0) {
        const uploadResults = await authApi.uploadRegistrationDocuments(registrationData.files);

        // Check if any uploads failed
        const failedUploads = uploadResults.filter(result =>
          result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
        );

        if (failedUploads.length > 0) {
          console.warn('Some document uploads failed:', failedUploads);
          // Don't fail the entire registration if document uploads fail
          // The user can upload them later through the profile
        }
      }

      return {
        success: true,
        message: 'Registration completed successfully',
        data: registrationResult.data
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        data: null
      };
    }
  },
};

// Bids API
export const bidsApi = {
  getBids: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/bids/${queryString ? `?${queryString}` : ''}`;
    return authRequest(endpoint);
  },

  getBidDetails: async (bidId: number) => {
    return authRequest(`/bids/${bidId}/`);
  },

  createBid: async (bidData: Record<string, unknown>) => {
    return authRequest('/bids/', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  updateBid: async (bidId: number, bidData: Record<string, unknown>) => {
    return authRequest(`/bids/${bidId}/`, {
      method: 'PATCH',
      body: JSON.stringify(bidData),
    });
  },

  deleteBid: async (bidId: number) => {
    return authRequest(`/bids/${bidId}/`, {
      method: 'DELETE',
    });
  },

  getMyBids: async () => {
    return authRequest('/bids/my-bids/');
  },
};

// Offers API
export const offersApi = {
  getOffers: async () => {
    return authRequest('/offers/');
  },

  createOffer: async (offerData: Record<string, unknown>) => {
    return authRequest('/offers/', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },

  acceptOffer: async (offerId: number) => {
    return authRequest(`/offers/${offerId}/accept/`, {
      method: 'POST',
    });
  },

  rejectOffer: async (offerId: number) => {
    return authRequest(`/offers/${offerId}/reject/`, {
      method: 'POST',
    });
  },

  completeDelivery: async (offerId: number) => {
    return authRequest(`/offers/${offerId}/complete-delivery/`, {
      method: 'POST',
    });
  },
};

// Payments API
export const paymentsApi = {
  getPayments: async () => {
    return authRequest('/payments/');
  },

  createPayment: async (paymentData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: paymentData,
    });

    return handleApiResponse(response);
  },

  updatePaymentStatus: async (paymentId: number, status: string) => {
    return authRequest(`/payments/${paymentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// Verification API
export const verificationApi = {
  getDocuments: async () => {
    return authRequest('/verification/');
  },

  uploadDocument: async (documentData: FormData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/verification/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: documentData,
    });

    return handleApiResponse(response);
  },

  updateDocumentStatus: async (documentId: number, status: string, rejectionReason?: string) => {
    const data: { status: string; rejection_reason?: string } = { status };
    if (rejectionReason) {
      data.rejection_reason = rejectionReason;
    }

    return authRequest(`/verification/${documentId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Ratings API
export const ratingsApi = {
  getRatings: async () => {
    return authRequest('/ratings/');
  },

  createRating: async (ratingData: Record<string, unknown>) => {
    return authRequest('/ratings/', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  },

  createBidReview: async (reviewData: Record<string, unknown>) => {
    return authRequest('/ratings/reviews/create/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },
};

// Users API
export const usersApi = {
  getTopRated: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/users/top-rated/${queryString ? `?${queryString}` : ''}`;
    return authRequest(endpoint);
  },

  getDashboardOverview: async () => {
    return authRequest<DashboardOverview>('/users/dashboard-overview/');
  },

  getUserRating: async (userId: number) => {
    return authRequest(`/users/${userId}/rating/`);
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async () => {
    return authRequest<NotificationsPayload>('/notifications/');
  },

  markAsRead: async (notificationId: number) => {
    return authRequest(`/notifications/${notificationId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true }),
    });
  },

  markAllAsRead: async () => {
    return authRequest('/notifications/mark-all-read/', {
      method: 'POST',
    });
  },

  getUnreadCount: async () => {
    return authRequest('/notifications/unread-count/');
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    return authRequest<AdminStats>('/admin/dashboard/');
  },

  getUsers: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/admin/users/${queryString ? `?${queryString}` : ''}`;
    return authRequest(endpoint);
  },

  getBids: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/admin/bids/${queryString ? `?${queryString}` : ''}`;
    return authRequest<AdminBid[]>(endpoint);
  },

  getOffers: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/admin/offers/${queryString ? `?${queryString}` : ''}`;
    return authRequest(endpoint);
  },

  getRatings: async () => {
    return authRequest('/admin/ratings/');
  },

  getPendingReviews: async () => {
    return authRequest('/admin/pending-reviews/');
  },

  getVerificationDocuments: async () => {
    return authRequest<VerificationDocument[]>('/verification/');
  },
  getPayments: async (params?: QueryParams) => {
    const queryString = buildQueryString(params);
    const endpoint = `/admin/payments/${queryString ? `?${queryString}` : ''}`;
    return authRequest(endpoint);
  },
};
