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
    .normalize('NFKC') // сохраняет буквы, включая "u" в Blue
    .replace(/\*\*/g, '') // markdown
    .replace(/🔥/g, '') // конкретный эмодзи
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // безопасное удаление эмодзи
    .replace(/\s+/g, ' ') // лишние пробелы
    .trim();
}

// Классификация по 6 категориям
function classify(model) {
  const m = model.toLowerCase();

  // === IPHONE ===
  if (
    m.includes('iphone') ||          // любые iPhone
    m.startsWith('17') ||            // 17 / 17 pro / 17 pro max / 17e / 17 air
    m.startsWith('16') ||            // 16 / 16 plus / 16e
    m.startsWith('15') ||
    m.startsWith('14') ||
    m.startsWith('13/') ||
    (
      m.startsWith('air ') &&        // Air 256 / Air 512 → iPhone Air
      !m.includes('ipad')            // но НЕ iPad Air
    ) ||
    m.match(/^air\s*\d+/)            // Air + число → iPhone Air
  ) {
    return 'iphone';
  }

  // === IPAD ===
  if (m.includes('ipad')) {
    return 'ipad';
  }

  // === MACBOOK ===
  if (
    m.includes('macbook') ||
    m.startsWith('air 13 m') ||       // Air 13 M4/M5
    m.startsWith('air 15 m') ||       // Air 15 M5
    m.includes('neo')                 // MacBook Neo
  ) {
    return 'macbook';
  }

  // === AIRPODS ===
  if (m.includes('airpods')) {
    return 'airpods';
  }

  // === APPLE WATCH ===
  if (
    m.includes('watch') ||
    m.includes('se3') ||
    m.includes('s11') ||
    m.includes('ultra')
  ) {
    return 'apple watch';
  }

  // === АКСЕССУАРЫ ===
  return 'аксессуары';
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

  const category = classify(model);

  rows.push({ id, model, price, category });
  id++;
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

// Сортировка по категориям
rows.sort((a, b) => {
  const order = ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch', 'аксессуары'];
  return order.indexOf(a.category) - order.indexOf(b.category);
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
csv += 'id,model,price,category\n';
csv += rows.map(r => `${r.id},${r.model},${r.price},${r.category}`).join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`✔ products.csv создан (${rows.length} товаров, обновлено ${formattedDate})`);
