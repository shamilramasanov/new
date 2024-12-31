// src/components/ContractSpecification/index.js
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import SpecificationForm from './SpecificationForm';
import SpecificationTable from './SpecificationTable';
import UsageForm from './UsageForm';
import UsageHistory from './UsageHistory';
import { fetchApi } from '@/utils/api';
import { toast } from 'react-toastify';

const ContractSpecification = ({ contract, onUpdate }) => {
  const [selectedSpec, setSelectedSpec] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddSpecification = async (newSpec) => {
    setIsLoading(true);
    try {
      await fetchApi(`/api/contracts/${contract.id}/specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpec),
      });

      // Получаем обновленные спецификации
      const specifications = await fetchApi(`/api/contracts/${contract.id}/specifications`);
      onUpdate({ ...contract, specifications });
    } catch (error) {
      console.error('Error adding specification:', error);
      toast.error(error.message || 'Помилка при додаванні специфікації');
    } finally {
      setIsLoading(false);
      setSelectedSpec(null);
    }
  };

  const handleUpdateSpecification = async (updatedSpec) => {
    setIsLoading(true);
    try {
      await fetchApi(`/api/specifications/${updatedSpec.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSpec),
      });

      // Получаем обновленные спецификации
      const specifications = await fetchApi(`/api/contracts/${contract.id}/specifications`);
      onUpdate({ ...contract, specifications });
    } catch (error) {
      console.error('Error updating specification:', error);
      toast.error(error.message || 'Помилка при оновленні специфікації');
    } finally {
      setIsLoading(false);
      setSelectedSpec(null);
    }
  };

  const handleDeleteSpecification = async (specId) => {
    if (!window.confirm('Видалити цю позицію?')) return;

    setIsLoading(true);
    try {
      await fetchApi(`/api/specifications/${specId}`, {
        method: 'DELETE',
      });

      // Получаем обновленные спецификации
      const specifications = await fetchApi(`/api/contracts/${contract.id}/specifications`);
      onUpdate({ ...contract, specifications });
      toast.success('Специфікацію видалено');
    } catch (error) {
      console.error('Error deleting specification:', error);
      toast.error(error.message || 'Помилка при видаленні специфікації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Специфікація договору</h2>
        <Dialog>
          <DialogTrigger asChild>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
              {isLoading ? 'Додавання...' : 'Додати позицію'}
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Нова позиція специфікації</DialogTitle>
            </DialogHeader>
            <SpecificationForm 
              onSubmit={handleAddSpecification} 
              kekv={contract.kekv?.code}
            />
          </DialogContent>
        </Dialog>
      </div>

      <SpecificationTable
        specifications={contract.specifications || []}
        onUpdate={handleUpdateSpecification}
        onDelete={handleDeleteSpecification}
        onSelectSpec={setSelectedSpec}
        kekv={contract.kekv?.code}
      />

      {selectedSpec && (
        <UsageHistory
          specification={selectedSpec}
          onClose={() => setSelectedSpec(null)}
          onUpdate={handleUpdateSpecification}
        />
      )}
    </div>
  );
};

export default ContractSpecification;