import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from '@/lib/utils';
import { FileText, Edit, Trash } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSpecificationUsage } from '@/hooks/useSpecificationUsage';
import SpecificationForm from './SpecificationForm';
import UsageForm from './UsageForm';
import UsageHistory from './UsageHistory';

export function SpecificationTable({ specifications = [], onUpdate, onDelete }) {
  const [editingSpec, setEditingSpec] = React.useState(null);
  const [selectedSpec, setSelectedSpec] = React.useState(null);
  const [addingUsage, setAddingUsage] = React.useState(null);
  const { addUsage, getUsageHistory } = useSpecificationUsage();

  // Группируем спецификации по автомобилям для КЕКВ 2240
  const groupedSpecifications = React.useMemo(() => {
    // Проверяем КЕКВ из контракта
    const kekvCode = specifications[0]?.contract?.kekv?.code;
    if (kekvCode !== '2240') {
      return { default: specifications };
    }

    return specifications.reduce((acc, spec) => {
      const vehicleKey = spec.vehicleVin || 'default';
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
      
      if (spec.section === 'Послуги') {
        acc[vehicleKey].services.push(spec);
      } else {
        acc[vehicleKey].parts.push(spec);
      }
      
      return acc;
    }, {});
  }, [specifications]);

  const handleEditSubmit = async (data) => {
    try {
      const response = await fetch(`/api/specifications/${editingSpec.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Помилка при оновленні специфікації');
      }

      onUpdate();
      setEditingSpec(null);
    } catch (error) {
      console.error('Error updating specification:', error);
      alert(error.message);
    }
  };

  const handleUsageSubmit = async (specificationId, usageData) => {
    try {
      await addUsage(specificationId, usageData);
      onUpdate();
      setAddingUsage(null);
    } catch (error) {
      console.error('Error adding usage:', error);
    }
  };

  const handleViewHistory = async (specification) => {
    try {
      const history = await getUsageHistory(specification.id);
      setSelectedSpec(history);
    } catch (error) {
      console.error('Error fetching usage history:', error);
    }
  };

  const renderActions = (spec) => (
    <div className="flex justify-end space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setAddingUsage(spec)}
        title="Додати використання"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleViewHistory(spec)}
        title="Історія використання"
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setEditingSpec(spec)}
        title="Редагувати"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (window.confirm('Видалити цю позицію?')) {
            onDelete(spec.id);
          }
        }}
        title="Видалити"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );

  if (!specifications?.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        Специфікації відсутні
      </div>
    );
  }

  // Для КЕКВ 2240 отображаем спецификации, сгруппированные по автомобилям
  const kekvCode = specifications[0]?.contract?.kekv?.code;
  if (kekvCode === '2240') {
    return (
      <div className="space-y-6">
        {Object.entries(groupedSpecifications).map(([vehicleKey, data]) => (
          <div key={vehicleKey} className="border rounded-lg overflow-hidden">
            {/* Информация об автомобиле */}
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h3 className="font-medium">
                Марка: {data.vehicle.brand}; в/н: {data.vehicle.vin}; Місце: {data.vehicle.location}
              </h3>
            </div>

            {/* Услуги */}
            {data.services.length > 0 && (
              <div className="px-4 py-2">
                <h4 className="font-medium mb-2">Послуги</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Найменування</TableHead>
                      <TableHead>Од. вим.</TableHead>
                      <TableHead className="text-right">К-сть</TableHead>
                      <TableHead className="text-right">Ціна</TableHead>
                      <TableHead className="text-right">К-сть обсл.</TableHead>
                      <TableHead className="text-right">Сума</TableHead>
                      <TableHead className="text-right">Залишок</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.services.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell>{spec.name}</TableCell>
                        <TableCell>{spec.unit}</TableCell>
                        <TableCell className="text-right">{spec.quantity}</TableCell>
                        <TableCell className="text-right">{formatMoney(spec.price)}</TableCell>
                        <TableCell className="text-right">{spec.serviceCount}</TableCell>
                        <TableCell className="text-right">{formatMoney(spec.amount)}</TableCell>
                        <TableCell className="text-right">{spec.remaining}</TableCell>
                        <TableCell>{renderActions(spec)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Запчасти */}
            {data.parts.length > 0 && (
              <div className="px-4 py-2 border-t">
                <h4 className="font-medium mb-2">Використані запчастини</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Найменування</TableHead>
                      <TableHead>Код</TableHead>
                      <TableHead>Од. вим.</TableHead>
                      <TableHead className="text-right">К-сть</TableHead>
                      <TableHead className="text-right">Ціна</TableHead>
                      <TableHead className="text-right">Сума</TableHead>
                      <TableHead className="text-right">Залишок</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.parts.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell>{spec.name}</TableCell>
                        <TableCell>{spec.code}</TableCell>
                        <TableCell>{spec.unit}</TableCell>
                        <TableCell className="text-right">{spec.quantity}</TableCell>
                        <TableCell className="text-right">{formatMoney(spec.price)}</TableCell>
                        <TableCell className="text-right">{formatMoney(spec.amount)}</TableCell>
                        <TableCell className="text-right">{spec.remaining}</TableCell>
                        <TableCell>{renderActions(spec)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}

        {editingSpec && (
          <Dialog open={!!editingSpec} onOpenChange={() => setEditingSpec(null)}>
            <DialogContent>
              <SpecificationForm
                specification={editingSpec}
                onSubmit={handleEditSubmit}
                kekv={kekvCode}
              />
            </DialogContent>
          </Dialog>
        )}

        {addingUsage && (
          <Dialog open={!!addingUsage} onOpenChange={() => setAddingUsage(null)}>
            <DialogContent>
              <UsageForm
                specification={addingUsage}
                onSubmit={(data) => handleUsageSubmit(addingUsage.id, data)}
              />
            </DialogContent>
          </Dialog>
        )}

        {selectedSpec && (
          <Dialog open={!!selectedSpec} onOpenChange={() => setSelectedSpec(null)}>
            <DialogContent>
              <UsageHistory
                specification={selectedSpec}
                onClose={() => setSelectedSpec(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Для остальных КЕКВ отображаем обычную таблицу
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Найменування</TableHead>
          <TableHead>Код</TableHead>
          <TableHead>Од. вим.</TableHead>
          <TableHead className="text-right">К-сть</TableHead>
          <TableHead className="text-right">Ціна</TableHead>
          <TableHead className="text-right">Сума</TableHead>
          <TableHead className="text-right">Залишок</TableHead>
          <TableHead className="text-right">Дії</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {specifications.map((spec) => (
          <TableRow key={spec.id}>
            <TableCell>{spec.name}</TableCell>
            <TableCell>{spec.code}</TableCell>
            <TableCell>{spec.unit}</TableCell>
            <TableCell className="text-right">{spec.quantity}</TableCell>
            <TableCell className="text-right">{formatMoney(spec.price)}</TableCell>
            <TableCell className="text-right">{formatMoney(spec.amount)}</TableCell>
            <TableCell className="text-right">{spec.remaining}</TableCell>
            <TableCell>{renderActions(spec)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}