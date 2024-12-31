import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function UsageForm({ specification, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      quantityUsed: '',
      description: '',
      documentNumber: '',
    }
  });

  const onSubmitForm = (data) => {
    // Проверяем, что количество не превышает остаток
    const quantityUsed = parseFloat(data.quantityUsed);
    if (quantityUsed > specification.remaining) {
      alert('Кількість не може перевищувати залишок');
      return;
    }

    onSubmit({
      ...data,
      quantityUsed: parseFloat(data.quantityUsed),
      date: new Date(data.date),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Додати використання: {specification.name}
        </h2>
        <div className="text-sm text-gray-500 mb-4">
          <p>Залишок: {specification.remaining} {specification.unit}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Дата використання</Label>
        <Input
          id="date"
          type="date"
          {...register('date', { required: "Вкажіть дату" })}
        />
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantityUsed">Кількість</Label>
        <Input
          id="quantityUsed"
          type="number"
          step="0.01"
          {...register('quantityUsed', {
            required: "Вкажіть кількість",
            min: { value: 0.01, message: "Кількість повинна бути більше 0" },
            max: { value: specification.remaining, message: "Кількість не може перевищувати залишок" }
          })}
        />
        {errors.quantityUsed && (
          <p className="text-sm text-red-500">{errors.quantityUsed.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentNumber">Номер документа</Label>
        <Input
          id="documentNumber"
          type="text"
          {...register('documentNumber')}
          placeholder="Номер документа (за наявності)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Примітка</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Додаткова інформація"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Скасувати
        </Button>
        <Button type="submit">
          Зберегти
        </Button>
      </div>
    </form>
  );
}