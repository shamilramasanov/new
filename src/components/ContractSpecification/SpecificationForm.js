// src/components/ContractSpecification/SpecificationForm.js
import React from 'react';
import { useForm } from 'react-hook-form';
import { DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';

export default function SpecificationForm({ specification, onSubmit, onCancel, kekv }) {
  // Проверяем, является ли это КЕКВ 2240
  const isKekv2240 = typeof kekv === 'string' ? kekv === '2240' : kekv?.code === '2240';

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    defaultValues: specification || {
      name: '',
      code: '',
      quantity: '',
      unit: '',
      price: '',
      section: 'Послуги',
      serviceCount: 1,
      vehicleBrand: '',
      vehicleVin: '',
      vehicleLocation: ''
    }
  });

  const quantity = watch('quantity');
  const price = watch('price');
  const code = watch('code');
  const serviceCount = watch('serviceCount');
  const section = watch('section');

  // Автоматически устанавливаем section в зависимости от наличия кода
  React.useEffect(() => {
    if (isKekv2240) {
      setValue('section', code ? 'Запчастини' : 'Послуги');
    }
  }, [code, isKekv2240, setValue]);

  const amount = React.useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    const s = section === 'Послуги' ? (parseInt(serviceCount) || 1) : 1;
    return q * p * s;
  }, [quantity, price, serviceCount, section]);

  const submitHandler = (data) => {
    const newSpec = {
      name: data.name,
      code: data.code,
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      price: parseFloat(data.price),
      section: data.section,
      serviceCount: section === 'Послуги' ? parseInt(data.serviceCount) : null,
      remaining: parseFloat(data.quantity),
      // Добавляем поля автомобиля для КЕКВ 2240
      ...(isKekv2240 && {
        vehicleBrand: data.vehicleBrand,
        vehicleVin: data.vehicleVin,
        vehicleLocation: data.vehicleLocation
      })
    };

    // Рассчитываем сумму с учетом количества обслуживаний
    newSpec.amount = newSpec.quantity * newSpec.price * (newSpec.serviceCount || 1);

    onSubmit(newSpec);
  };

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>
          {specification ? 'Редагувати позицію' : 'Нова позиція специфікації'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 mt-4">
        {isKekv2240 && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Марка автомобіля
                </label>
                <input
                  {...register("vehicleBrand", { 
                    required: "Обов'язкове поле" 
                  })}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Марка"
                />
                {errors.vehicleBrand && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleBrand.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Військовий номер
                </label>
                <input
                  {...register("vehicleVin", { 
                    required: "Обов'язкове поле" 
                  })}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="в/н"
                />
                {errors.vehicleVin && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleVin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Місце дислокації
                </label>
                <input
                  {...register("vehicleLocation", { 
                    required: "Обов'язкове поле" 
                  })}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Місце"
                />
                {errors.vehicleLocation && (
                  <p className="mt-1 text-sm text-red-600">{errors.vehicleLocation.message}</p>
                )}
              </div>
            </div>

            {section === 'Послуги' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Кількість обслуговувань
                </label>
                <input
                  {...register("serviceCount", { 
                    required: "Обов'язкове поле",
                    min: { value: 1, message: "Мінімальне значення 1" }
                  })}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="1"
                />
                {errors.serviceCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceCount.message}</p>
                )}
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Найменування
          </label>
          <input
            {...register("name", { 
              required: "Обов'язкове поле" 
            })}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Назва товару або послуги"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Код запчастини
          </label>
          <input
            {...register("code")}
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Тільки для запчастин"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Кількість
            </label>
            <input
              {...register("quantity", { 
                required: "Обов'язкове поле",
                min: { value: 0, message: "Мінімальне значення 0" }
              })}
              type="number"
              step="0.01"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="0.00"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Одиниця виміру
            </label>
            <input
              {...register("unit", { 
                required: "Обов'язкове поле" 
              })}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="шт, кг, л і т.д."
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ціна за одиницю
          </label>
          <input
            {...register("price", { 
              required: "Обов'язкове поле",
              min: { value: 0, message: "Мінімальне значення 0" }
            })}
            type="number"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="0.00"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="text-right font-medium">
            Сума: {amount.toFixed(2)} грн
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {specification ? 'Зберегти' : 'Додати'}
          </button>
        </div>
      </form>
    </div>
  );
}