// src/components/ContractSpecification/index.js
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import SpecificationForm from './SpecificationForm';
import SpecificationTable from './SpecificationTable';
import UsageForm from './UsageForm';
import UsageHistory from './UsageHistory';

const ContractSpecification = ({ contract, onUpdate }) => {
  const [selectedSpec, setSelectedSpec] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddSpecification = async (newSpec) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contracts/${contract.id}/specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSpec),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка при додаванні специфікації');
      }

      // Получаем обновленные спецификации
      const specsResponse = await fetch(`/api/contracts/${contract.id}/specifications`);
      const specifications = await specsResponse.json();

      onUpdate({
        ...contract,
        specifications
      });
    } catch (error) {
      console.error('Error adding specification:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSpecification = async (updatedSpec) => {
    try {
      const response = await fetch(`/api/specifications/${updatedSpec.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSpec),
      });

      if (!response.ok) {
        throw new Error('Помилка при оновленні специфікації');
      }

      // Получаем обновленные спецификации
      const specsResponse = await fetch(`/api/contracts/${contract.id}/specifications`);
      const specifications = await specsResponse.json();

      onUpdate({
        ...contract,
        specifications
      });
    } catch (error) {
      console.error('Error updating specification:', error);
      alert(error.message);
    }
  };

  const handleDeleteSpecification = async (specId) => {
    if (!window.confirm('Видалити цю позицію?')) return;

    try {
      const response = await fetch(`/api/specifications/${specId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Помилка при видаленні специфікації');
      }

      // Получаем обновленные спецификации
      const specsResponse = await fetch(`/api/contracts/${contract.id}/specifications`);
      const specifications = await specsResponse.json();

      onUpdate({
        ...contract,
        specifications
      });
    } catch (error) {
      console.error('Error deleting specification:', error);
      alert(error.message);
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