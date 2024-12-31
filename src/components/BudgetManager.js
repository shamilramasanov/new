import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "./ui/dialog";
import { Plus, Edit, Trash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const BudgetManager = ({ initialBudgets = [] }) => {
  const [budgets, setBudgets] = React.useState(initialBudgets);
  const [editingBudget, setEditingBudget] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [kekvFields, setKekvFields] = React.useState([{ code: '', name: '', plannedAmount: '' }]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const addKekvField = () => {
    setKekvFields([...kekvFields, { code: '', name: '', plannedAmount: '' }]);
  };

  const removeKekvField = (index) => {
    const newFields = [...kekvFields];
    newFields.splice(index, 1);
    setKekvFields(newFields);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          year: data.year,
          description: data.description,
          userId: '1', // Временно хардкодим ID пользователя
          kekv: kekvFields.map(field => ({
            code: field.code,
            name: field.name,
            plannedAmount: parseFloat(field.plannedAmount),
          })),
        }),
      });

      if (!response.ok) throw new Error('Помилка при створенні кошторису');

      const newBudget = await response.json();
      setBudgets(prev => [...prev, newBudget]);
      reset();
      setKekvFields([{ code: '', name: '', plannedAmount: '' }]);
      toast.success('Кошторис успішно створено!');
    } catch (error) {
      toast.error('Помилка при створенні кошторису');
    } finally {
      setIsLoading(false);
    }
  };

  const onEdit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          year: data.year,
          description: data.description,
        }),
      });

      if (!response.ok) throw new Error('Помилка при оновленні кошторису');

      const updatedBudget = await response.json();
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === editingBudget.id ? updatedBudget : budget
        )
      );
      setEditingBudget(null);
      toast.success('Кошторис успішно оновлено!');
    } catch (error) {
      toast.error('Помилка при оновленні кошторису');
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей кошторис?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Помилка при видаленні кошторису');

      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast.success('Кошторис успішно видалено!');
    } catch (error) {
      toast.error('Помилка при видаленні кошторису');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Кошториси</h2>
        
        <Dialog>
          <DialogTrigger className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Plus size={20} />
            Додати кошторис
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Додати новий кошторис</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва кошторису</label>
                <input
                  {...register('name', { required: true })}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.name && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Тип</label>
                <select
                  {...register('type', { required: true })}
                  className="mt-1 block w-full p-2 border rounded-md"
                >
                  <option value="">Оберіть тип</option>
                  <option value="Загальний фонд">Загальний фонд</option>
                  <option value="Спеціальний фонд">Спеціальний фонд</option>
                </select>
                {errors.type && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Рік</label>
                <input
                  type="number"
                  {...register('year', { required: true, min: 2000, max: 2100 })}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.year && <span className="text-red-500">Введіть коректний рік</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Опис</label>
                <textarea
                  {...register('description')}
                  className="mt-1 block w-full p-2 border rounded-md"
                  rows="2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">КЕКВ</label>
                  <button
                    type="button"
                    onClick={addKekvField}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Додати КЕКВ
                  </button>
                </div>
                
                {kekvFields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        placeholder="Код"
                        value={field.code}
                        onChange={(e) => {
                          const newFields = [...kekvFields];
                          newFields[index].code = e.target.value;
                          setKekvFields(newFields);
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        placeholder="Назва"
                        value={field.name}
                        onChange={(e) => {
                          const newFields = [...kekvFields];
                          newFields[index].name = e.target.value;
                          setKekvFields(newFields);
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Сума"
                        value={field.plannedAmount}
                        onChange={(e) => {
                          const newFields = [...kekvFields];
                          newFields[index].plannedAmount = e.target.value;
                          setKekvFields(newFields);
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeKekvField(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash size={20} />
                      </button>
                    )}
                  </div>
                ))}
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

      <div className="grid gap-4">
        {budgets.map(budget => (
          <div
            key={budget.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{budget.name}</h3>
                <p className="text-sm text-gray-600">Тип: {budget.type}</p>
                <p className="text-sm text-gray-600">Рік: {budget.year}</p>
                {budget.description && (
                  <p className="text-sm text-gray-600">{budget.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBudget(budget)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">КЕКВ:</h4>
              <div className="space-y-2">
                {budget.kekv.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.code} - {item.name}</span>
                    <span className="font-medium">
                      {item.plannedAmount.toLocaleString()} грн
                      {item.usedAmount > 0 && (
                        <span className="text-gray-500 ml-2">
                          (використано: {item.usedAmount.toLocaleString()} грн)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingBudget && (
        <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редагувати кошторис</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onEdit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Назва кошторису</label>
                <input
                  {...register('name', { required: true })}
                  defaultValue={editingBudget.name}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.name && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Тип</label>
                <select
                  {...register('type', { required: true })}
                  defaultValue={editingBudget.type}
                  className="mt-1 block w-full p-2 border rounded-md"
                >
                  <option value="Загальний фонд">Загальний фонд</option>
                  <option value="Спеціальний фонд">Спеціальний фонд</option>
                </select>
                {errors.type && <span className="text-red-500">Це поле обов'язкове</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Рік</label>
                <input
                  type="number"
                  {...register('year', { required: true, min: 2000, max: 2100 })}
                  defaultValue={editingBudget.year}
                  className="mt-1 block w-full p-2 border rounded-md"
                />
                {errors.year && <span className="text-red-500">Введіть коректний рік</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Опис</label>
                <textarea
                  {...register('description')}
                  defaultValue={editingBudget.description}
                  className="mt-1 block w-full p-2 border rounded-md"
                  rows="2"
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

export default BudgetManager;
