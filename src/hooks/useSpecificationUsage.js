import { useState } from 'react';
import { toast } from 'sonner';

export function useSpecificationUsage() {
  const [isLoading, setIsLoading] = useState(false);

  const addUsage = async (specificationId, usageData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/specifications/${specificationId}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usageData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка при додаванні використання');
      }

      const result = await response.json();
      toast.success('Використання успішно додано');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageHistory = async (specificationId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/specifications/${specificationId}/usage`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Помилка при отриманні історії використання');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addUsage,
    getUsageHistory,
  };
}
