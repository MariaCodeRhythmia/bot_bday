import fs from 'fs';

// Чтение файлов
const file1Lines = fs.readFileSync('outp', 'utf-8').split('\n');
const file2Lines = fs.readFileSync('birthdays.txt', 'utf-8').split('\n');

// Функция для извлечения ID из строки
function extractID(line) {
  const match = line.match(/\[.*\]\(tg:\/\/user\?id=(\d+)\)/);
  if (match) {
    return match[1]; // Возвращаем ID
  }

  const match2 = line.match(/\d+\.\d+\s+(\d+)\s+(.+)/);
  if (match2) {
    return match2[1]; // Возвращаем ID
  }

  return null; // Если не удалось извлечь ID
}

// Поиск отсутствующих участников в каждом файле
const missingInFile1 = file2Lines.filter(line => !file1Lines.some(file1Line => extractID(file1Line) === extractID(line)));
const missingInFile2 = file1Lines.filter(line => !file2Lines.some(file2Line => extractID(file2Line) === extractID(line)));

// Вывод результата
console.log('Отсутствует в первом файле:');
missingInFile1.forEach(line => console.log(line));

console.log('\nОтсутствует во втором файле:');
missingInFile2.forEach(line => console.log(line));
