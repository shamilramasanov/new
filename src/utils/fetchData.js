// src/utils/fetchData.js

export async function fetchBudgets() {
    // Приклад отримання даних з API
    // const res = await fetch('https://api.example.com/budgets');
    // const budgets = await res.json();
    // return budgets;
  
    // Для демонстрації використаємо статичні дані
    return {
      'main-zf': {
        name: 'Основний кошторис ЗФ',
        totals: {
          '2210': 4010100.00,
          '2240': 5318136.00,
          '3110': 500000.00
        },
        used: {
          '2210': 4000000.00,
          '2240': 5319834.25,
          '3110': 491498.68
        }
      },
      'sf-9': {
        name: 'Додатковий кошторис СФ №9',
        totals: {
          '2210': 300000.00,
          '2240': 789040.00,
          '3110': 0.00
        },
        used: {
          '2210': 300000.00,
          '2240': 789040.00,
          '3110': 0.00
        }
      },
      'sf-32-45': {
        name: 'Додатковий кошторис СФ №32; №45',
        totals: {
          '2210': 700000.00,
          '2240': 1400000.00,
          '3110': 0.00
        },
        used: {
          '2210': 697831.80,
          '2240': 1343455.19,
          '3110': 0.00
        }
      }
    };
  }
  
  export async function fetchContracts() {
    // Приклад отримання даних з API
    // const res = await fetch('https://api.example.com/contracts');
    // const contracts = await res.json();
    // return contracts;
  
    // Для демонстрації використаємо статичні дані
    return [
      {
        id: '1',
        budgetName: 'Основний кошторис ЗФ',
        dkCode: '09210000-4',
        name: 'Мастильні засоби',
        kekv: '2210',
        plannedAmount: 36280.00,
        usedAmount: 36280.00,
        remaining: 0.00,
        contractor: 'ТОВ "Автодеталі"'
      },
      {
        id: '2',
        budgetName: 'Основний кошторис ЗФ',
        dkCode: '50110000-9',
        name: 'Послуги з ремонту і технічного обслуговування автомобілів',
        kekv: '2240',
        plannedAmount: 5250836.00,
        usedAmount: 5252534.25,
        remaining: -1698.25,
        contractor: 'ТОВ ВіДі Автосіті Кільцева'
      }
    ];
  }
  