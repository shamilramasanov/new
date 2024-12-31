import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import SpecificationUploadRenderer from './SpecificationUploadRenderer';
import SpecificationDisplayRenderer from './SpecificationDisplayRenderer';
import { SpecificationProps } from '../common/types';

export default function Specification2210({ kekv, onSpecificationsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specifications, setSpecifications] = useState([]);

  const downloadTemplate = async () => {
    try {
      setError('');
      const response = await fetch(`/api/specifications/template?kekv=${kekv}&type=withoutVAT`);
      if (!response.ok) {
        throw new Error('Помилка при завантаженні шаблону');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `specification_template_${kekv}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Помилка при завантаженні шаблону');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kekv', kekv);
    formData.append('type', 'withoutVAT');

    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/specifications/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Помилка при завантаженні файлу');
      }

      const data = await response.json();
      console.log('Received specifications:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        throw new Error('Неправильний формат даних від сервера');
      }

      setSpecifications(data);
      onSpecificationsLoaded(data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Помилка при завантаженні файлу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button variant="secondary" onClick={downloadTemplate}>
          Завантажити шаблон
        </Button>

        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button variant="primary">
            Завантажити специфікацію
          </Button>
        </div>
      </div>

      {loading ? (
        <SpecificationUploadRenderer loading={true} />
      ) : specifications.length > 0 ? (
        <SpecificationDisplayRenderer specifications={specifications} />
      ) : null}

      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
    </div>
  );
}
