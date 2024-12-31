// Импортируем базу кодов ДК
import dkCodes from '../../data/dk-codes.json';

export default async function handler(req, res) {
  const { search } = req.query;

  if (!search || search.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
  }

  const searchLower = search.toLowerCase();
  
  // Поиск по коду и названию
  const results = dkCodes.filter(
    item => 
      item.code.toLowerCase().includes(searchLower) ||
      item.name.toLowerCase().includes(searchLower)
  ).slice(0, 50); // Ограничиваем результаты до 50 записей

  res.json(results);
}
