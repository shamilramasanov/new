import { useState, useCallback } from 'react';
import { contractsAPI } from '../services/api';
import { toast } from 'react-toastify';

export function useContracts(initialContracts = []) {
  const [contracts, setContracts] = useState(initialContracts);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await contractsAPI.getAll();
      setContracts(data);
    } catch (error) {
      toast.error('Помилка при завантаженні договорів');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createContract = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const newContract = await contractsAPI.create(data);
      setContracts(prev => [...prev, newContract]);
      toast.success('Договір успішно створено!');
      return newContract;
    } catch (error) {
      toast.error('Помилка при створенні договору');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateContract = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const updatedContract = await contractsAPI.update(id, data);
      setContracts(prev =>
        prev.map(contract =>
          contract.id === id ? updatedContract : contract
        )
      );
      toast.success('Договір успішно оновлено!');
      return updatedContract;
    } catch (error) {
      toast.error('Помилка при оновленні договору');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteContract = useCallback(async (id) => {
    try {
      await contractsAPI.delete(id);
      setContracts(prev => prev.filter(contract => contract.id !== id));
      toast.success('Договір успішно видалено!');
    } catch (error) {
      toast.error('Помилка при видаленні договору');
      throw error;
    }
  }, []);

  return {
    contracts,
    isLoading,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}
