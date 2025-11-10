const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }
}

export const apiService = new ApiService();

// Menu API
export const menuApi = {
  getAll: () => apiService.get('/menu'),
  getById: (id: number) => apiService.get(`/menu/${id}`),
  getByCategory: (category: string) => apiService.get(`/menu/category/${category}`),
  create: (data: any) => apiService.post('/menu', data),
  update: (id: number, data: any) => apiService.put(`/menu/${id}`, data),
  delete: (id: number) => apiService.delete(`/menu/${id}`),
  seed: (data: any) => apiService.post('/menu/seed', data),
};

// Orders API
export const ordersApi = {
  create: (data: any) => apiService.post('/orders', data),
  getMyOrders: () => apiService.get('/orders/my-orders'),
  getById: (id: string) => apiService.get(`/orders/${id}`),
  getAll: (params?: any) => apiService.get(`/orders?${new URLSearchParams(params)}`),
  updateStatus: (id: string, status: string) => apiService.put(`/orders/${id}/status`, { status }),
  updatePayment: (id: string, paymentStatus: string) => apiService.put(`/orders/${id}/payment`, { paymentStatus }),
  getStats: () => apiService.get('/orders/stats/overview'),
};