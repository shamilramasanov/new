import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Input } from '../shared/components/ui/Input';
import { Button } from '../shared/components/ui/Button';

export default function CreateContractModal({ vehicleId, onClose, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = {
      vehicleId,
      number: event.target.number.value,
      name: event.target.name.value,
      client: event.target.client.value,
      amount: parseFloat(event.target.amount.value),
      startDate: event.target.startDate.value,
      endDate: event.target.endDate.value,
      kekvCode: event.target.kekvCode.value,
    };

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto"
      onClose={onClose}
      open={true}
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Створити новий договір
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Номер договору"
              name="number"
              placeholder="Введіть номер договору"
              required
            />

            <Input
              label="Назва"
              name="name"
              placeholder="Введіть назву договору"
              required
            />

            <Input
              label="Клієнт"
              name="client"
              placeholder="Введіть назву клієнта"
              required
            />

            <Input
              label="Сума"
              name="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              required
            />

            <Input
              label="Дата початку"
              name="startDate"
              type="date"
              required
            />

            <Input
              label="Дата закінчення"
              name="endDate"
              type="date"
              required
            />

            <Input
              label="Код КЕКВ"
              name="kekvCode"
              placeholder="Наприклад: 2240"
              required
            />

            <div className="mt-4 flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Створення...' : 'Створити'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
