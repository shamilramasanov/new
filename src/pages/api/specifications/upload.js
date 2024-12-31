import formidable from 'formidable';
import ExcelJS from 'exceljs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Starting file upload processing...');

  const form = formidable({
    keepExtensions: true,
  });

  try {
    const [fields, files] = await form.parse(req);
    console.log('Form parsed:', {
      fields,
      files: Object.keys(files),
    });

    const kekv = fields.kekv?.[0];
    const file = files.file?.[0];

    if (!file) {
      console.error('No file found in request');
      return res.status(400).json({ message: 'Файл обов\'язковий' });
    }

    if (!kekv) {
      console.error('No KEKV provided');
      return res.status(400).json({ message: 'КЕКВ обов\'язковий' });
    }

    console.log('Processing file:', {
      filename: file.originalFilename,
      filepath: file.filepath,
      kekv: kekv
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.filepath);

    let worksheet = workbook.getWorksheet('Специфікація') || workbook.worksheets[0];
    if (!worksheet) {
      console.error('No worksheet found');
      return res.status(400).json({ message: 'Файл Excel не містить жодного листа' });
    }

    console.log('Found worksheet:', worksheet.name);

    const specifications = [];
    
    // Для КЕКВ 2210 и 3110 используем простой формат
    if (kekv === '2210' || kekv === '3110') {
      let headerRow = null;

      // Найдем строку с заголовками
      worksheet.eachRow((row, rowNumber) => {
        const firstCell = row.getCell(1).value?.toString().trim();
        if (firstCell === '№' || firstCell === 'N' || firstCell === '#') {
          headerRow = rowNumber;
          return false;
        }
      });

      if (!headerRow) {
        throw new Error('Не знайдено заголовки таблиці');
      }

      // Обрабатываем строки
      for (let rowNumber = headerRow + 1; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const firstCell = row.getCell(1).value?.toString().trim();
        
        if (!firstCell || (isNaN(firstCell) && !firstCell.match(/^\d+$/))) continue;

        try {
          const spec = {
            number: firstCell,
            name: row.getCell(2).value?.toString().trim(),
            code: row.getCell(3).value?.toString().trim(),
            unit: row.getCell(4).value?.toString().trim(),
            quantity: parseFloat(row.getCell(5).value) || 0,
            price: parseFloat(row.getCell(6).value) || 0,
            section: kekv === '2210' ? 'Матеріали' : 'Обладнання',
            remaining: parseFloat(row.getCell(5).value) || 0,
          };

          if (!spec.name || !spec.unit) continue;

          spec.amount = spec.quantity * spec.price;

          if (!isNaN(spec.amount)) {
            specifications.push(spec);
          }
        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
        }
      }
    } else if (kekv === '2240') {
      // Для КЕКВ 2240 используем формат с автомобилями
      let currentVehicle = null;
      let currentSection = null;
      let number = 1;

      console.log('Processing KEKV 2240 specifications...');

      const parseVehicleInfo = (vehicleStr) => {
        try {
          const parts = vehicleStr.split(';').map(part => part.trim());
          const brand = parts[0].split('Марка:')[1]?.trim() || '';
          const vin = parts.find(p => p.includes('в/н:'))?.split('в/н:')[1]?.trim() || '';
          const location = parts.find(p => p.includes('Місце:'))?.split('Місце:')[1]?.trim() || '';
          return { brand, vin, location };
        } catch (error) {
          console.error('Error parsing vehicle info:', error);
          return { brand: '', vin: '', location: '' };
        }
      };

      worksheet.eachRow((row, rowNumber) => {
        try {
          const firstCell = row.getCell(1).value?.toString().trim() || '';
          const secondCell = row.getCell(2).value?.toString().trim() || '';
          
          console.log(`Row ${rowNumber}:`, { firstCell, secondCell });

          if (!firstCell && !secondCell) return;

          // Проверяем, является ли это строкой с информацией об автомобиле
          if (firstCell.toLowerCase().includes('марка:')) {
            currentVehicle = firstCell;
            currentSection = null;
            console.log('Found vehicle:', currentVehicle);
            return;
          }

          // Проверяем, является ли это заголовком раздела
          if (firstCell === 'Послуги' || firstCell === 'Використані запчастини') {
            currentSection = firstCell;
            console.log('Found section:', currentSection);
            return;
          }

          // Пропускаем строку с заголовками колонок
          if (firstCell === '№' || firstCell === 'Найменування') {
            console.log('Skipping header row');
            return;
          }

          // Если у нас есть автомобиль и раздел, обрабатываем строку спецификации
          if (currentVehicle && currentSection && (firstCell || secondCell)) {
            try {
              const vehicleInfo = parseVehicleInfo(currentVehicle);
              const spec = {
                number: number.toString(),
                name: secondCell || row.getCell(2).value?.toString().trim(),
                code: row.getCell(3).value?.toString().trim() || '',
                unit: row.getCell(4).value?.toString().trim() || 'норм/год',
                quantity: parseFloat(row.getCell(5).value) || 0,
                price: parseFloat(row.getCell(6).value) || 0,
                serviceCount: parseFloat(row.getCell(7).value) || 1,
                serviceAmount: parseFloat(row.getCell(8).value) || 0,
                total: parseFloat(row.getCell(9).value) || 0,
                section: currentSection,
                vehicleBrand: vehicleInfo.brand,
                vehicleVin: vehicleInfo.vin,
                vehicleLocation: vehicleInfo.location
              };

              console.log('Created specification:', spec);

              // Для услуг устанавливаем единицу измерения по умолчанию
              if (currentSection === 'Послуги' && !spec.unit) {
                spec.unit = 'норм/год';
              }

              if (spec.name) { // Убираем проверку unit для услуг
                spec.amount = spec.total || (spec.quantity * spec.price * spec.serviceCount);
                if (!isNaN(spec.amount) && spec.amount > 0) {
                  specifications.push(spec);
                  number++;
                  console.log('Added specification. Total count:', specifications.length);
                } else {
                  console.log('Skipping specification with zero or invalid amount');
                }
              } else {
                console.log('Skipping invalid specification - missing name');
              }
            } catch (error) {
              console.error(`Error processing specification row ${rowNumber}:`, error);
            }
          } else {
            console.log('Skipping row - missing vehicle or section');
          }
        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
        }
      });
    }

    if (specifications.length === 0) {
      console.error('No specifications found in file');
      return res.status(400).json({ message: 'Не знайдено жодної специфікації у файлі' });
    }

    console.log(`Successfully processed ${specifications.length} specifications`);
    return res.status(200).json(specifications);
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ message: error.message });
  }
}
