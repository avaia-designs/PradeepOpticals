import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/user-store';
import { 
  Quotation, 
  QuotationFilters, 
  QuotationStats, 
  CreateQuotationRequest,
  ApproveQuotationRequest,
  RejectQuotationRequest,
  CustomerRejectQuotationRequest,
  StaffReplyRequest,
  QuotationResponse
} from '@/types/quotation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An error occurred');
  }
  return response.json();
};

export const useQuotations = (filters: QuotationFilters = {}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/quotations?${queryParams}`, {
        headers: getAuthHeaders()
      });

      const data: QuotationResponse = await handleApiResponse(response);
      
      setQuotations(Array.isArray(data.data) ? data.data : []);
      if (data.meta?.pagination) {
        setPagination(data.meta.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [filters.page, filters.limit, filters.status, filters.search]);

  return {
    quotations,
    loading,
    error,
    pagination,
    refetch: fetchQuotations
  };
};

export const useAllQuotations = (filters: QuotationFilters = {}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchAllQuotations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/quotations/all?${queryParams}`, {
        headers: getAuthHeaders()
      });

      const data: QuotationResponse = await handleApiResponse(response);
      
      setQuotations(Array.isArray(data.data) ? data.data : []);
      if (data.meta?.pagination) {
        setPagination(data.meta.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuotations();
  }, [filters.page, filters.limit, filters.status, filters.search]);

  return {
    quotations,
    loading,
    error,
    pagination,
    refetch: fetchAllQuotations
  };
};

export const useQuotation = (id: string) => {
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotation = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
        headers: getAuthHeaders()
      });

      const data: QuotationResponse = await handleApiResponse(response);
      setQuotation(data.data as Quotation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  return {
    quotation,
    loading,
    error,
    refetch: fetchQuotation
  };
};

export const useQuotationStats = () => {
  const [stats, setStats] = useState<QuotationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/stats`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotation stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export const useCreateQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuotation = async (data: CreateQuotationRequest): Promise<Quotation | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result: QuotationResponse = await handleApiResponse(response);
      return result.data as Quotation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quotation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createQuotation,
    loading,
    error
  };
};

export const useApproveQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveQuotation = async (id: string, data: ApproveQuotationRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve quotation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    approveQuotation,
    loading,
    error
  };
};

export const useRejectQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectQuotation = async (id: string, data: RejectQuotationRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject quotation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    rejectQuotation,
    loading,
    error
  };
};

export const useCustomerApproveQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerApproveQuotation = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/customer-approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve quotation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    customerApproveQuotation,
    loading,
    error
  };
};

export const useCustomerRejectQuotation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerRejectQuotation = async (id: string, data: CustomerRejectQuotationRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/customer-reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject quotation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    customerRejectQuotation,
    loading,
    error
  };
};

export const useStaffReply = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStaffReply = async (id: string, data: StaffReplyRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/staff-reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add staff reply');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addStaffReply,
    loading,
    error
  };
};

export const useConvertQuotationToOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertQuotationToOrder = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quotations/${id}/convert`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      await handleApiResponse(response);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert quotation to order');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    convertQuotationToOrder,
    loading,
    error
  };
};
