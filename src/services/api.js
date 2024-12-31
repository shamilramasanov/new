const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const contractsAPI = {
  getAll: () => fetchAPI('/api/contracts'),
  getById: (id) => fetchAPI(`/api/contracts/${id}`),
  create: (data) => fetchAPI('/api/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/api/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/api/contracts/${id}`, {
    method: 'DELETE',
  }),
};

export const budgetsAPI = {
  getAll: () => fetchAPI('/api/budgets'),
  getById: (id) => fetchAPI(`/api/budgets/${id}`),
  create: (data) => fetchAPI('/api/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => fetchAPI(`/api/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => fetchAPI(`/api/budgets/${id}`, {
    method: 'DELETE',
  }),
};
