import React from 'react';
import { X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from '@/lib/utils';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UsageHistory({ specification, onClose }) {
  return (
    <div className="space-y-4">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle>Історія використання</DialogTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </DialogHeader>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">{specification.itemName}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Загальна кількість:</span>
            <span className="ml-2 font-medium">{specification.quantity} {specification.unit}</span>
          </div>
          <div>
            <span className="text-gray-500">Залишок:</span>
            <span className={`ml-2 font-medium ${
              specification.remaining > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {specification.remaining} {specification.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Ціна за одиницю:</span>
            <span className="ml-2 font-medium">
              {formatMoney(specification.pricePerUnit)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Загальна сума:</span>
            <span className="ml-2 font-medium">
              {formatMoney(specification.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {specification.usageHistory?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Номер акту</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead className="text-right">Кількість</TableHead>
              <TableHead className="text-right">Сума</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specification.usageHistory.map((usage) => (
              <TableRow key={usage.id || usage.documentNumber}>
                <TableCell>
                  {new Date(usage.date).toLocaleDateString('uk-UA')}
                </TableCell>
                <TableCell>{usage.documentNumber}</TableCell>
                <TableCell>{usage.description}</TableCell>
                <TableCell className="text-right">
                  {usage.quantityUsed} {specification.unit}
                </TableCell>
                <TableCell className="text-right">
                  {formatMoney(usage.quantityUsed * specification.pricePerUnit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <TableRow>
              <TableCell colSpan="3" className="text-sm font-medium text-gray-900">
                Всього використано:
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-gray-900">
                {specification.quantity - specification.remaining} {specification.unit}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-gray-900">
                {formatMoney((specification.quantity - specification.remaining) * specification.pricePerUnit)}
              </TableCell>
            </TableRow>
          </tfoot>
        </Table>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Історія використання відсутня
        </div>
      )}
    </div>
  );
}