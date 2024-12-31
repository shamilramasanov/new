import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../shared/components/Layout';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Table } from '../../../shared/components/ui/Table';
import { colors } from '../../../core/theme/colors';
import { formatMoney, formatDate } from '../../../shared/utils/format';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { cn } from '../../../utils/cn';

// Используем существующий экземпляр prisma вместо создания нового
// const prisma = new PrismaClient();

export default function ContractPayments({ contract, payments, totalPaid, remainingAmount }) {
  const router = useRouter();
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Колонки для таблицы платежей
  const columns = [
    {
      key: 'date',
      title: 'Дата',
      render: (value) => formatDate(value),
    },
    {
      key: 'amount',
      title: 'Сума',
      render: (value) => formatMoney(value),
      className: 'text-right',
    },
    {
      key: 'description',
      title: 'Призначення платежу',
    },
  ];

  // Создание нового платежа
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const paymentData = {
      amount: parseFloat(formData.get('amount')),
      date: formData.get('date'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch(`/api/contracts/${contract.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Перезагружаем страницу для обновления данных
      router.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Информация о договоре */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className={cn(
              'text-2xl font-semibold mb-4',
              `text-[${colors.neutral[900]}]`
            )}>
              {contract.name}
            </h2>
            <div className={cn(
              'space-y-2',
              `text-[${colors.neutral[600]}]`
            )}>
              <p>Договір №: {contract.number}</p>
              <p>КЕКВ: {contract.kekv.code} - {contract.kekv.name}</p>
              <p>Кошторис: {contract.budget.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <div className="text-right">
              <p className={cn(
                'text-sm',
                `text-[${colors.neutral[600]}]`
              )}>
                Сума договору
              </p>
              <p className={cn(
                'text-2xl font-semibold',
                `text-[${colors.neutral[900]}]`
              )}>
                {formatMoney(contract.amount)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <span className={`text-[${colors.neutral[600]}]`}>Сплачено: </span>
                  <span className={cn(
                    'font-medium',
                    `text-[${colors.success.default}]`
                  )}>
                    {formatMoney(totalPaid)}
                  </span>
                </p>
                <p className="text-sm">
                  <span className={`text-[${colors.neutral[600]}]`}>Залишок: </span>
                  <span className={cn(
                    'font-medium',
                    `text-[${colors.primary.default}]`
                  )}>
                    {formatMoney(remainingAmount)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Форма добавления платежа */}
      {isAddingPayment && (
        <Card className="mb-6">
          <h3 className={cn(
            'text-lg font-medium mb-4',
            `text-[${colors.neutral[900]}]`
          )}>
            Новий платіж
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Дата"
                name="date"
                type="date"
                required
              />
              <Input
                label="Сума"
                name="amount"
                type="number"
                step="0.01"
                max={remainingAmount}
                required
              />
              <Input
                label="Призначення платежу"
                name="description"
                required
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsAddingPayment(false)}
                type="button"
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Таблица платежей */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className={cn(
            'text-lg font-medium',
            `text-[${colors.neutral[900]}]`
          )}>
            Платежі
          </h3>
          {!isAddingPayment && remainingAmount > 0 && (
            <Button onClick={() => setIsAddingPayment(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Додати платіж
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          data={payments}
          emptyMessage="Платежів ще немає"
        />

        {/* Прогресс выплат */}
        <div className="mt-6">
          <div className={cn(
            'h-2 rounded-full overflow-hidden',
            `bg-[${colors.neutral[100]}]`
          )}>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                `bg-[${colors.success.default}]`
              )}
              style={{ width: `${(totalPaid / contract.amount) * 100}%` }}
            />
          </div>
          <div className={cn(
            'mt-2 text-sm text-right',
            `text-[${colors.neutral[600]}]`
          )}>
            Виконано: {((totalPaid / contract.amount) * 100).toFixed(1)}%
          </div>
        </div>
      </Card>
    </Layout>
  );
}

// Получаем данные о договоре и платежах
export async function getServerSideProps({ params }) {
  const { id } = params;
  
  // Получаем договор
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      kekv: true,
      budget: true,
    },
  });

  if (!contract) {
    return {
      notFound: true,
    };
  }

  // Получаем платежи
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contracts/${id}/payments`);
  const { payments, totalPaid, remainingAmount } = await response.json();

  return {
    props: {
      contract: JSON.parse(JSON.stringify(contract)),
      payments: JSON.parse(JSON.stringify(payments)),
      totalPaid,
      remainingAmount,
    },
  };
}
