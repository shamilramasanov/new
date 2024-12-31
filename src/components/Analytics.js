// src/components/Analytics.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from './ui/dialog';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';

// Реєстрація компонентів Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [budgets, setBudgets] = React.useState([
    {
      id: '1',
      budgetName: 'Основний кошторис ЗФ',
      annualPlanKEKV: 'KEKV-001',
      plannedAmount: 500000,
      usedAmount: 300000,
      remainingAmount: 200000,
    },
    {
      id: '2',
      budgetName: 'Додатковий кошторис СФ №9',
      annualPlanKEKV: 'KEKV-002',
      plannedAmount: 300000,
      usedAmount: 350000,
      remainingAmount: -50000,
    },
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    const newBudget = {
      id: String(budgets.length + 1),
      budgetName: data.budgetName,
      annualPlanKEKV: data.annualPlanKEKV,
      plannedAmount: parseFloat(data.plannedAmount),
      usedAmount: parseFloat(data.usedAmount),
      remainingAmount: parseFloat(data.plannedAmount) - parseFloat(data.usedAmount),
    };
    setBudgets([...budgets, newBudget]);
    reset();
    toast.success('Новий кошторис успішно додано!');
  };

  // Налаштування даних для графіка
  const chartData = {
    labels: budgets.map(budget => budget.budgetName),
    datasets: [
      {
        label: 'Планова сума',
        data: budgets.map(budget => budget.plannedAmount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)', // blue
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Використана сума',
        data: budgets.map(budget => budget.usedAmount),
        backgroundColor: 'rgba(16, 185, 129, 0.5)', // green
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Залишок',
        data: budgets.map(budget => budget.remainingAmount),
        backgroundColor: 'rgba(139, 92, 246, 0.5)', // purple
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Налаштування опцій графіка
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Аналітика використання коштів',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return `${new Intl.NumberFormat('uk-UA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value)} грн`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800">Аналітика</h1>
      
      {/* Графік */}
      <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      {/* Таблиця */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-blue-600">
              <th className="px-4 py-2 text-left text-white font-semibold">Назва Кошторису</th>
              <th className="px-4 py-2 text-left text-white font-semibold">Річний план КЕКВ</th>
              <th className="px-4 py-2 text-right text-white font-semibold">Планова сума (грн)</th>
              <th className="px-4 py-2 text-right text-white font-semibold">Використана сума (грн)</th>
              <th className="px-4 py-2 text-right text-white font-semibold">Залишок (грн)</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((budget, index) => (
              <tr 
                key={budget.id} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
              >
                <td className="px-4 py-2 border">{budget.budgetName}</td>
                <td className="px-4 py-2 border">{budget.annualPlanKEKV}</td>
                <td className="px-4 py-2 border text-right">
                  {budget.plannedAmount.toLocaleString('uk-UA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} грн
                </td>
                <td className="px-4 py-2 border text-right">
                  {budget.usedAmount.toLocaleString('uk-UA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} грн
                </td>
                <td className={`px-4 py-2 border text-right ${
                  budget.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {budget.remainingAmount.toLocaleString('uk-UA', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} грн
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Кнопка додавання */}
      <div className="flex justify-center">
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-5 w-5" />
              Додати Кошторис
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новий Кошторис</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Назва Кошторису
                  </label>
                  <input
                    {...register("budgetName", { required: "Введіть назву кошторису" })}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {errors.budgetName && (
                    <p className="mt-1 text-sm text-red-600">{errors.budgetName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Річний план КЕКВ
                  </label>
                  <input
                    {...register("annualPlanKEKV", { required: "Введіть річний план КЕКВ" })}
                    type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="Наприклад: KEKV-003"
                  />
                  {errors.annualPlanKEKV && (
                    <p className="mt-1 text-sm text-red-600">{errors.annualPlanKEKV.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Планова сума (грн)
                  </label>
                  <input
                    {...register("plannedAmount", { 
                      required: "Введіть планову суму",
                      min: { value: 0, message: "Сума не може бути від'ємною" }
                    })}
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                  {errors.plannedAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.plannedAmount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Використана сума (грн)
                  </label>
                  <input
                    {...register("usedAmount", { 
                      required: "Введіть використану суму",
                      min: { value: 0, message: "Сума не може бути від'ємною" }
                    })}
                    type="number"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                  {errors.usedAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.usedAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Скасувати
                  </button>
                </DialogClose>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}