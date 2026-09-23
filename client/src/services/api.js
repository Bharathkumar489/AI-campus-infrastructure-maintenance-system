const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  getUsers: async (role) => {
    const url = role ? `${API_BASE}/auth/users?role=${role}` : `${API_BASE}/auth/users`;
    const res = await fetch(url);
    return res.json();
  },

  // Assets
  getAssets: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/assets${params ? `?${params}` : ''}`);
    return res.json();
  },

  getAsset: async (id) => {
    const res = await fetch(`${API_BASE}/assets/${id}`);
    if (!res.ok) throw new Error('Asset not found');
    return res.json();
  },

  createAsset: async (data) => {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create asset');
    }
    return res.json();
  },

  predictAssetRisk: async (id) => {
    const res = await fetch(`${API_BASE}/assets/${id}/predict`);
    return res.json();
  },

  // Requests
  getRequests: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/requests${params ? `?${params}` : ''}`);
    return res.json();
  },

  getRequest: async (id) => {
    const res = await fetch(`${API_BASE}/requests/${id}`);
    if (!res.ok) throw new Error('Request not found');
    return res.json();
  },

  checkDuplicate: async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/requests/check-duplicate?${query}`);
    return res.json();
  },

  upvoteRequest: async (requestId, userId) => {
    const res = await fetch(`${API_BASE}/requests/${requestId}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    return res.json();
  },

  deleteRequest: async (id, userId, role) => {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete request');
    }
    return res.json();
  },

  createRequest: async (formData) => {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      body: formData // multipart/form-data for image upload
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit request');
    }
    return res.json();
  },

  updateRequestStatus: async (id, status, remarks = '') => {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update status');
    }
    return res.json();
  },

  submitCompletionEvidence: async (requestId, formData) => {
    const res = await fetch(`${API_BASE}/requests/${requestId}/evidence`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit completion evidence');
    }
    return res.json();
  },

  // Assignments & Technicians
  getTechnicians: async () => {
    const res = await fetch(`${API_BASE}/technicians`);
    return res.json();
  },

  recommendTechnicians: async (requestId) => {
    const res = await fetch(`${API_BASE}/technicians/recommend/${requestId}`);
    return res.json();
  },

  updateTechnicianAvailability: async (techId, availability) => {
    const res = await fetch(`${API_BASE}/technicians/${techId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availability })
    });
    return res.json();
  },

  assignTechnician: async (requestId, technicianId, remarks = '') => {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, technician_id: technicianId, remarks })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign technician');
    }
    return res.json();
  },

  assignmentAction: async (assignmentId, action, remarks = '') => {
    const res = await fetch(`${API_BASE}/assignments/${assignmentId}/action`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, remarks })
    });
    return res.json();
  },

  // Feedback & Verification
  submitFeedback: async (requestId, userId, rating, comments = '') => {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, user_id: userId, rating, comments })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit feedback');
    }
    return res.json();
  },

  // Notifications
  getNotifications: async (userId) => {
    const url = userId ? `${API_BASE}/notifications?user_id=${userId}` : `${API_BASE}/notifications`;
    const res = await fetch(url);
    return res.json();
  },

  markNotificationRead: async (id) => {
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead: async (userId) => {
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
  },

  // Analytics
  getAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return res.json();
  },

  getAnalyticsCharts: async () => {
    const res = await fetch(`${API_BASE}/analytics/charts`);
    return res.json();
  },

  getHighRiskAssets: async () => {
    const res = await fetch(`${API_BASE}/analytics/high-risk-assets`);
    return res.json();
  },

  getExportData: async () => {
    const res = await fetch(`${API_BASE}/analytics/export`);
    return res.json();
  },

  // AI & ML
  analyzeComplaint: async ({ title, description, location, imageFile }) => {
    const formData = new FormData();
    formData.append('title', title || '');
    formData.append('description', description || '');
    formData.append('location', location || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const res = await fetch(`${API_BASE}/analyze-complaint`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  classifyText: async (text) => {
    const res = await fetch(`${API_BASE}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  calculatePriority: async (data) => {
    const res = await fetch(`${API_BASE}/priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getModelInfo: async () => {
    const res = await fetch(`${API_BASE}/model-info`);
    return res.json();
  }
};
