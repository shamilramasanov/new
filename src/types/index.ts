export interface Budget {
  id: string;
  name: string;
  type: string;
  year: number;
  description?: string;
  totalAmount: number;
  usedAmount: number;
  kekv: KEKV[];
  contracts: Contract[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KEKV {
  id: string;
  code: string;
  name: string;
  plannedAmount: number;
  usedAmount: number;
  budgetId: string;
  contracts: Contract[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contract {
  id: string;
  number: string;
  name: string;
  description?: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  budgetId: string;
  kekvId: string;
  specifications: Specification[];
  payments: Payment[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface Specification {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  price: number;
  amount: number;
  description?: string;
  contractId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
  description?: string;
  contractId: string;
  createdAt: Date;
  updatedAt: Date;
}
