import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../../../shared/components/Layout';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { colors } from '../../../core/theme/colors';
import { formatMoney } from '../../../shared/utils/format';
import { prisma } from '../../../lib/prisma';
import { toast } from 'react-toastify';
import CreateActModal from '../../../components/CreateActModal';
import SpecificationDisplayRenderer2210 from '../../../components/specifications/2210/SpecificationDisplayRenderer';
import SpecificationDisplayRenderer2240 from '../../../components/specifications/2240/SpecificationDisplayRenderer';
import SpecificationDisplayRenderer3110 from '../../../components/specifications/3110/SpecificationDisplayRenderer';

// Компонент для выбора правильного рендерера в зависимости от КЕКВ
const SpecificationRenderer = ({ specifications, kekvCode }) => {
  switch (kekvCode) {
    case '2210':
      return <SpecificationDisplayRenderer2210 specifications={specifications} />;
    case '2240':
      return <SpecificationDisplayRenderer2240 specifications={specifications} />;
    case '3110':
      return <SpecificationDisplayRenderer3110 specifications={specifications} />;
    default:
      return null;
  }
};

export default function SpecificationsPage({ contract, specifications }) {
  const router = useRouter();
  const { id: contractId } = router.query;
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [specs, setSpecs] = useState(specifications);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateActModal, setShowCreateActModal] = useState(false);

  // Вычисляем сумму для спецификации
  const calculateSpecTotal = (spec) => {
    const baseAmount = spec.price * spec.quantity;
    return spec.type === 'service' ? baseAmount * spec.serviceCount : baseAmount;
  };

  // Группируем спецификации по автомобилям и типу
  const groupedSpecs = specifications.reduce((acc, spec) => {
    const vehicleKey = spec.vehicleVin || 'no-vehicle';
    
    if (!acc[vehicleKey]) {
      acc[vehicleKey] = {
        vehicle: {
          brand: spec.vehicleBrand || 'Не вказано',
          vin: spec.vehicleVin || 'Не вказано',
          location: spec.vehicleLocation || 'Не вказано'
        },
        services: [],
        parts: []
      };
    }
    
    if (spec.type === 'service') {
      acc[vehicleKey].services.push(spec);
    } else {
      acc[vehicleKey].parts.push(spec);
    }
    
    return acc;
  }, {});

  // Вычисляем итоги для каждого автомобиля
  Object.values(groupedSpecs).forEach(group => {
    group.servicesTotal = group.services.reduce((sum, spec) => 
      sum + calculateSpecTotal(spec), 0
    );
    group.partsTotal = group.parts.reduce((sum, spec) => 
      sum + calculateSpecTotal(spec), 0
    );
    group.total = group.servicesTotal + group.partsTotal;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      unit: formData.get('unit'),
      quantity: parseFloat(formData.get('quantity')),
      price: parseFloat(formData.get('price')),
      amount: parseFloat(formData.get('quantity')) * parseFloat(formData.get('price')),
      description: formData.get('description'),
    };

    try {
      const response = await fetch(`/api/contracts/${contract.id}/specifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create specification');

      const newSpec = await response.json();
      setSpecs(prev => [...prev, newSpec]);
      toast.success('Специфікацію успішно додано!');
      event.target.reset();
    } catch (error) {
      toast.error('Помилка при створенні специфікації');
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
            <h2 className="text-2xl font-semibold text-[${colors.neutral[900]}] mb-4">
              {contract.name}
            </h2>
            <div className="space-y-2 text-[${colors.neutral[600]}]">
              <p>Договір №: {contract.number}</p>
              <p>Клієнт: {contract.client}</p>
              <p>КЕКВ: {contract.kekv.code}</p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-center">
            <p className="text-sm text-[${colors.neutral[600]}]">Загальна сума договору</p>
            <p className="text-3xl font-semibold text-[${colors.neutral[900]}]">
              {formatMoney(contract.amount)}
            </p>
            <div className="mt-4">
              <Button 
                onClick={() => setShowCreateActModal(true)}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                Створити акт
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Форма добавления спецификации */}
      {isAddingSpec && (
        <Card className="mb-6">
          <h3 className="text-lg font-medium text-[${colors.neutral[900]}] mb-4">
            Нова специфікація
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input label="Назва" placeholder="Введіть назву" name="name" />
              </div>
              <div>
                <Input label="Од. вим." placeholder="шт." name="unit" />
              </div>
              <div>
                <Input label="Кількість" type="number" placeholder="0" name="quantity" />
              </div>
              <div>
                <Input label="Ціна" type="number" placeholder="0.00" name="price" />
              </div>
              <div className="lg:col-span-5">
                <Input label="Опис" placeholder="Введіть опис" name="description" />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setIsAddingSpec(false)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Спецификации */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-[${colors.neutral[900]}]">
            Специфікації
          </h3>
          {!isAddingSpec && (
            <Button onClick={() => setIsAddingSpec(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Додати специфікацію
            </Button>
          )}
        </div>

        {/* Отображение спецификаций по автомобилям */}
        {Object.entries(groupedSpecs).map(([vehicleKey, group]) => (
          <div key={vehicleKey} className="mb-8 p-4 border rounded-lg">
            <h3 className="text-lg font-bold mb-4">
              {group.vehicle.brand} ({group.vehicle.vin})
              <span className="text-sm font-normal ml-2">
                Розташування: {group.vehicle.location}
              </span>
            </h3>

            {/* Услуги */}
            {group.services.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Послуги:</h4>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Назва</th>
                      <th>Од. вим.</th>
                      <th>К-сть</th>
                      <th>Ціна</th>
                      <th>К-сть обсл.</th>
                      <th>Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.services.map(spec => (
                      <tr key={spec.id}>
                        <td>{spec.name}</td>
                        <td>{spec.unit}</td>
                        <td>{spec.quantity}</td>
                        <td>{spec.price}</td>
                        <td>{spec.serviceCount}</td>
                        <td>{calculateSpecTotal(spec)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-right font-bold">Всього послуг:</td>
                      <td className="font-bold">{group.servicesTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Запчасти */}
            {group.parts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Запчастини:</h4>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Код</th>
                      <th>Назва</th>
                      <th>Од. вим.</th>
                      <th>К-сть</th>
                      <th>Ціна</th>
                      <th>Сума</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.parts.map(spec => (
                      <tr key={spec.id}>
                        <td>{spec.code}</td>
                        <td>{spec.name}</td>
                        <td>{spec.unit}</td>
                        <td>{spec.quantity}</td>
                        <td>{spec.price}</td>
                        <td>{calculateSpecTotal(spec)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="5" className="text-right font-bold">Всього запчастин:</td>
                      <td className="font-bold">{group.partsTotal}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="text-right font-bold">
              Загальна сума: {group.total}
            </div>
          </div>
        ))}

        <div className="text-right font-bold mt-6 text-lg">
          Загальна сума: {
            Object.values(groupedSpecs).reduce((total, group) => total + group.total, 0)
          }
        </div>
      </Card>

      {/* Модальное окно создания акта */}
      {showCreateActModal && (
        <CreateActModal
          contract={contract}
          onClose={() => setShowCreateActModal(false)}
          onSubmit={async (formData) => {
            try {
              const response = await fetch('/api/acts', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...formData,
                  contractId: contract.id,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to create act');
              }

              toast.success('Акт успішно створено!');
              setShowCreateActModal(false);
              
              // Обновляем данные на странице
              router.reload();
            } catch (error) {
              console.error('Error creating act:', error);
              toast.error('Помилка при створенні акту');
            }
          }}
        />
      )}
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        specifications: true,
        kekv: true,
      },
    });

    if (!contract) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        contract: JSON.parse(JSON.stringify(contract)),
        specifications: JSON.parse(JSON.stringify(contract.specifications)),
      },
    };
  } catch (error) {
    console.error('Error loading contract:', error);
    return {
      notFound: true,
    };
  }
}
