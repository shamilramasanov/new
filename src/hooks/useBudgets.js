import { useState, useCallback } from 'react';
import { budgetsAPI } from '../services/api';
import { toast } from 'react-toastify';

export function useBudgets(initialBudgets = []) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await budgetsAPI.getAll();
      setBudgets(data);
    } catch (error) {
      toast.error('Помилка при завантаженні кошторисів');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBudget = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const newBudget = await budgetsAPI.create(data);
      setBudgets(prev => [...prev, newBudget]);
      toast.success('Кошторис успішно створено!');
      return newBudget;
    } catch (error) {
      toast.error('Помилка при створенні кошторису');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const updatedBudget = await budgetsAPI.update(id, data);
      setBudgets(prev =>
        prev.map(budget =>
          budget.id === id ? updatedBudget : budget
        )
      );
      toast.success('Кошторис успішно оновлено!');
      return updatedBudget;
    } catch (error) {
      toast.error('Помилка при оновленні кошторису');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    try {
      await budgetsAPI.delete(id);
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast.success('Кошторис успішно видалено!');
    } catch (error) {
      toast.error('Помилка при видаленні кошторису');
      throw error;
    }
  }, []);

  return {
    budgets,
    isLoading,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  };
}
