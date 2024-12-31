import ExcelJS from 'exceljs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { kekv, type = 'withVAT' } = req.query;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Специфікація');

    if (kekv === '2240') {
      // Настройка ширины колонок
      worksheet.columns = [
        { header: '№', key: 'number', width: 5 },
        { header: 'Найменування', key: 'name', width: 40 },
        { header: 'Код запчастини', key: 'code', width: 15 },
        { header: 'Од. виміру', key: 'unit', width: 10 },
        { header: 'Кількість', key: 'quantity', width: 10 },
        { header: 'Ціна', key: 'price', width: 12 },
        { header: 'К-сть обсл.', key: 'serviceCount', width: 12 },
        { header: 'Сума за обсл.', key: 'serviceAmount', width: 15 },
        { header: 'Сума з ПДВ', key: 'total', width: 15 }
      ];

      // Стили
      const headerStyle = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        },
        font: { bold: true, size: 10 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      };

      const sectionStyle = {
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        },
        font: { bold: true, size: 10 },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };

      // Пример для первого автомобиля
      let currentRow = 1;

      // Информация об автомобиле
      worksheet.mergeCells(currentRow, 1, currentRow, 9);
      const vehicleCell = worksheet.getCell(currentRow, 1);
      vehicleCell.value = 'Авто: Марка:Toyota Land Cruiser 200 VR9(бронь.);в/н:0102 А1;VIN:JTMHY05J0K4075306;Місце:2 АК';
      vehicleCell.font = { bold: true };
      currentRow++;

      // Заголовки колонок
      const headerRow = worksheet.getRow(currentRow);
      headerRow.values = ['№', 'Найменування', 'Код запчастини', 'Одиниця виміру', 'Кількість', 'Ціна', 'К-сть обсл.', 'Сума за обсл.', 'Сума з ПДВ'];
      headerRow.eachCell(cell => Object.assign(cell, headerStyle));
      currentRow++;

      // Раздел "Послуги"
      worksheet.mergeCells(currentRow, 1, currentRow, 9);
      const servicesHeader = worksheet.getCell(currentRow, 1);
      servicesHeader.value = 'Послуги';
      Object.assign(servicesHeader, sectionStyle);
      currentRow++;

      // Пример услуги
      worksheet.getRow(currentRow).values = ['1', 'Тяга рульова зн/вст', '', 'норм/год', '2', '900.00', '1.00', '600.00', '600.00'];
      currentRow++;

      // Раздел "Використані запчастини"
      worksheet.mergeCells(currentRow, 1, currentRow, 9);
      const partsHeader = worksheet.getCell(currentRow, 1);
      partsHeader.value = 'Використані запчастини';
      Object.assign(partsHeader, sectionStyle);
      currentRow++;

      // Пример запчасти
      worksheet.getRow(currentRow).values = ['1', 'Шток рейки рульової', 'MA207C', 'шт', '1', '2884.33', '1', '2884.33', '2884.33'];
      currentRow++;

      // Пустая строка между автомобилями
      currentRow++;

      // Повторяем для второго автомобиля
      worksheet.mergeCells(currentRow, 1, currentRow, 9);
      const vehicle2Cell = worksheet.getCell(currentRow, 1);
      vehicle2Cell.value = 'Авто: Марка:Тайота Hilux;в/н:7261 А1; VIN:AHTKB8CD702987171;Місце:2 АК';
      vehicle2Cell.font = { bold: true };
      currentRow++;

      // И так далее...

      // Применяем границы к таблице
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

    } else {
      // Базовые колонки для других КЕКВ
      worksheet.columns = [
        { header: '№', key: 'number', width: 5 },
        { header: 'Найменування', key: 'name', width: 40 },
        { header: 'Код', key: 'code', width: 15 },
        { header: 'Од. вим.', key: 'unit', width: 10 },
        { header: 'К-сть', key: 'quantity', width: 10 },
        { header: 'Ціна', key: 'price', width: 12 },
        { header: 'Сума', key: 'total', width: 15 }
      ];

      // Стили для заголовка
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }

    // Отправляем файл
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=specification_template_${kekv}_${type}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Error generating template' });
  }
}
