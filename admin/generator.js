const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, '..', 'products.csv');

if (!fs.existsSync(inputPath)) {
  console.error('❌ Файл input.txt не найден');
  process.exit(1);
}

const rawInput = fs.readFileSync(inputPath, 'utf-8');

// Разбиваем на строки
const lines = rawInput
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

let id = 1;
const rows = [];

// Очистка строки от Markdown, эмодзи, мусора + нормализация Unicode
function cleanLine(line) {
  return line
    .normalize('NFKC') // 🔥 сохраняет буквы, включая "u" в Blue
    .replace(/\*\*/g, '') // markdown
    .replace(/🔥/g, '') // конкретный эмодзи
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // безопасное удаление эмодзи
    .replace(/\s+/g, ' ') // лишние пробелы
    .trim();
}

// Универсальный регекс: модель - цена BYN
const productRegex = /(.*?)\s*-\s*([\d\s]+)\s*BYN/i;

for (const raw of lines) {
  const line = cleanLine(raw);

  const match = line.match(productRegex);
  if (!match) continue;

  const model = match[1].trim();
  const priceRaw = match[2].trim().replace(/\s+/g, '');

  const numericPrice = parseInt(priceRaw, 10);
  if (isNaN(numericPrice)) continue;

  // Округление до ближайших 10
  const roundedPrice = Math.round(numericPrice / 10) * 10;
  const price = roundedPrice.toLocaleString('ru-RU');

  rows.push({ id, model, price });
  id++;
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

// Сортировка: сначала iPhone
rows.sort((a, b) => {
  const aIsIphone = a.model.toLowerCase().startsWith("iphone") || /^\d/.test(a.model);
  const bIsIphone = b.model.toLowerCase().startsWith("iphone") || /^\d/.test(b.model);

  if (aIsIphone && !bIsIphone) return -1;
  if (!aIsIphone && bIsIphone) return 1;
  return 0;
});

// Дата Минск
const now = new Date();
const formattedDate = now.toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Minsk'
}).replace(',', '');

// Формируем CSV
let csv = `last_update,${formattedDate}\n`;
csv += 'id,model,price\n';
csv += rows.map(r => `${r.id},${r.model},${r.price}`).join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`✔ products.csv создан (${rows.length} товаров, обновлено ${formattedDate})`);
