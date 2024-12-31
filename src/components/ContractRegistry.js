'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "./ui/dialog";
import { Plus, Edit, Trash, ClipboardList } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import ContractSpecification from './ContractSpecification';
import Link from 'next/link';

const ContractRegistry = ({ initialContracts = [] }) => {
  const [contracts, setContracts] = React.useState(initialContracts);
  const [editingContract, setEditingContract] = React.useState(null);
  const [selectedContract, setSelectedContract] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      setContracts(data);
    } catch (error) {
      toast.error('Помилка при завантаженні договорів');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.name,
          number: data.contractNumber,
          content: data.description || '',
          startDate: new Date(data.startDate),
          amount: parseFloat(data.plannedAmount),
          status: 'Активний',
          userId: '1', // Временно хардкодим ID пользователя
        }),
      });

      if (!response.ok) throw new Error('Помилка при створенні договору');

      const newContract = await response.json();
      setContracts(prev => [...prev, newContract]);
      reset();
      toast.success('Договір успішно додано!');
    } catch (error) {
      toast.error('Помилка при створенні договору');
    } finally {
      setIsLoading(false);
    }
  };

  const onEdit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.name,
          number: data.contractNumber,
          content: data.description || '',
          startDate: new Date(data.startDate),
          amount: parseFloat(data.plannedAmount),
        }),
      });

      if (!response.ok) throw new Error('Помилка при оновленні договору');

      const updatedContract = await response.json();
      setContracts(prev =>
        prev.map(contract =>
          contract.id === editingContract.id ? updatedContract : contract
        )
      );
      setEditingContract(null);
      toast.success('Договір успішно оновлено!');
    } catch (error) {
      toast.error('Помилка при оновленні договору');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей договір?')) return;

    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Помилка при видаленні договору');

      setContracts(prev => prev.filter(contract => contract.id !== id));
      toast.success('Договір успішно видалено!');
    } catch (error) {
      toast.error('Помилка при видаленні договору');
    }
  };

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Реєстр договорів</h2>
          <p className="text-sm text-gray-500">
            Кількість договорів: {filteredContracts.length}
            {searchTerm && ` (знайдено: ${filteredContracts.length} з ${contracts.length})`}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Пошук договорів..."
            className="p-2 border rounded-lg w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Dialog>
            <DialogTrigger className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus size={20} />
              Додати договір
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Додати новий договір</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Назва договору</label>
                  <input
                    {...register('name', { required: true })}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                  {errors.name && <span className="text-red-500">Це поле обов'язкове</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Номер договору</label>
                  <input
                    {...register('contractNumber', { required: true })}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                  {errors.contractNumber && <span className="text-red-500">Це поле обов'язкове</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата початку</label>
                  <input
                    type="date"
                    {...register('startDate', { required: true })}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                  {errors.startDate && <span className="text-red-500">Це поле обов'язкове</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Сума</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('plannedAmount', { required: true, min: 0 })}
                    className="mt-1 block w-full p-2 border rounded-md"
                  />
                  {errors.plannedAmount && <span className="text-red-500">Введіть коректну суму</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Опис</label>
                  <textarea
                    {...register('description')}
                    className="mt-1 block w-full p-2 border rounded-md"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <DialogClose className="px-4 py-2 border rounded-lg">
                    Скасувати
                  </DialogClose>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Збереження...' : 'Зберегти'}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredContracts.map(contract => (
          <div
            key={contract.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{contract.title}</h3>
                <p className="text-sm text-gray-600">Номер: {contract.number}</p>
                <p className="text-sm text-gray-600">
                  Дата: {new Date(contract.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Сума: {contract.amount.toLocaleString()} грн
                </p>
                <Link
                  href={`/contracts/${contract.id}/specifications`}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  Переглянути специфікації →
                </Link>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingContract(contract)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDelete(contract.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingContract && (
        <Dialog open={!!editingContract} onOpenChange={() => setEditingContract(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагувати договір</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва договору</label>
                <input
                  {...register('name', { required: true })}
                  defaultValue={editingContract.title}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.name && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Номер договору</label>
                <input
                  {...register('contractNumber', { required: true })}
                  defaultValue={editingContract.number}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.contractNumber && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Дата початку</label>
                <input
                  type="date"
                  {...register('startDate', { required: true })}
                  defaultValue={editingContract.startDate}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.startDate && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Сума</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('plannedAmount', { required: true, min: 0 })}
                  defaultValue={editingContract.amount}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.plannedAmount && <span className="text-red-500">Введіть коректну суму</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Опис</label>
                <textarea
                  {...register('description')}
                  defaultValue={editingContract.content}
                  className="mt-1 block w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-2">
                <DialogClose className="px-4 py-2 border rounded-lg">
                  Скасувати
                </DialogClose>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContractRegistry;