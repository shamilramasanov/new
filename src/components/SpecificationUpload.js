import React, { useState } from 'react';
import { Button } from '../shared/components/ui/Button';

export default function SpecificationUpload({ kekv, onSpecificationsLoaded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadType, setUploadType] = useState('withVAT');

  const downloadTemplate = async () => {
    try {
      setError('');
      const response = await fetch(`/api/specifications/template?kekv=${kekv}&type=${uploadType}`);
      if (!response.ok) {
        throw new Error('Помилка при завантаженні шаблону');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `specification_template_${kekv}_${uploadType}.xlsx`;
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

    // Проверяем расширение файла
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx') {
      setError('Будь ласка, завантажте файл Excel (.xlsx)');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('kekv', kekv);
    formData.append('type', uploadType);

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/specifications/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Помилка при завантаженні файлу');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Не вдалося знайти специфікації у файлі');
      }

      // Добавляем section для каждой спецификации
      const processedData = data.map(spec => ({
        ...spec,
        section: spec.code ? 'Використані запчастини' : 'Послуги'
      }));

      onSpecificationsLoaded(processedData);
      // Очищаем input file
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Помилка при завантаженні файлу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          disabled={loading}
        >
          Завантажити шаблон
        </Button>

        <div className="relative">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Завантаження...' : 'Завантажити специфікацію'}
          </Button>
        </div>
      </div>
    </div>
  );
}
