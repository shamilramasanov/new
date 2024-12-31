import { Contract, Payment, Specification, Budget, KEKV } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function handleResponse(response: Response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
}

// Контракты
export const contractsApi = {
  getAll: () => 
    fetch(`${API_URL}/api/contracts`).then(handleResponse),
  
  getById: (id: string) => 
    fetch(`${API_URL}/api/contracts/${id}`).then(handleResponse),
  
  create: (data: Partial<Contract>) => 
    fetch(`${API_URL}/api/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  update: (id: string, data: Partial<Contract>) => 
    fetch(`${API_URL}/api/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};

// Платежи
export const paymentsApi = {
  getByContract: (contractId: string) => 
    fetch(`${API_URL}/api/contracts/${contractId}/payments`).then(handleResponse),
  
  create: (contractId: string, data: Partial<Payment>) => 
    fetch(`${API_URL}/api/contracts/${contractId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};

// Спецификации
export const specificationsApi = {
  getByContract: (contractId: string) => 
    fetch(`${API_URL}/api/contracts/${contractId}/specifications`).then(handleResponse),
  
  create: (contractId: string, data: Partial<Specification>) => 
    fetch(`${API_URL}/api/contracts/${contractId}/specifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};

// Кошториси
export const budgetsApi = {
  getAll: () => 
    fetch(`${API_URL}/api/budgets`).then(handleResponse),
  
  getById: (id: string) => 
    fetch(`${API_URL}/api/budgets/${id}`).then(handleResponse),
  
  create: (data: Partial<Budget>) => 
    fetch(`${API_URL}/api/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  
  getKEKV: (budgetId: string) => 
    fetch(`${API_URL}/api/budgets/${budgetId}/kekv`).then(handleResponse),
  
  createKEKV: (budgetId: string, data: Partial<KEKV>) => 
    fetch(`${API_URL}/api/budgets/${budgetId}/kekv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
};
