const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, '..', 'products.csv');

if (!fs.existsSync(inputPath)) {
  console.error('❌ Файл input.txt не найден');
  process.exit(1);
}

const rawInput = fs.readFileSync(inputPath, 'utf-8');

const lines = rawInput
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

let id = 1;
const rows = [];

// Очистка строки
function cleanLine(line) {
  return line
    .normalize('NFKC')
    .replace(/\*\*/g, '')
    .replace(/🔥/g, '')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Классификация
function classify(model) {
  const m = model.toLowerCase().trim();

  // AIRPODS
  if (m.includes('airpods')) {
    return 'airpods';
  }

  // APPLE WATCH
  if (
    /^s\d+\s/.test(m) ||      // S11 42...
    /^se\d*/.test(m) ||       // SE3...
    m.includes('apple watch')
  ) {
    return 'apple watch';
  }

  // IPAD
  if (m.includes('ipad')) {
    return 'ipad';
  }

  // MACBOOK
  if (
    m.includes('macbook') ||
    m.includes('neo') ||
    /^air\s+13\b/.test(m) ||
    /^air\s+15\b/.test(m)
  ) {
    return 'macbook';
  }

  // IPHONE
  if (
    /^\d+/.test(m) ||                     // 13,14,15,16,17,18...
    m.includes('iphone') ||
    /^air\s+(128|256|512|1tb)/.test(m)    // iPhone Air
  ) {
    return 'iphone';
  }

  return 'аксессуары';
}

// Универсальный регекс
const productRegex = /(.*?)\s*-\s*([\d\s]+)\s*BYN/i;

for (const raw of lines) {
  const line = cleanLine(raw);

  const match = line.match(productRegex);
  if (!match) continue;

  const model = match[1].trim();
  const priceRaw = match[2].trim().replace(/\s+/g, '');

  const numericPrice = parseInt(priceRaw, 10);
  if (isNaN(numericPrice)) continue;

  const roundedPrice = Math.round(numericPrice / 10) * 10;
  const price = roundedPrice.toLocaleString('ru-RU');

  const category = classify(model);

  rows.push({
    id,
    model,
    price,
    category
  });

  id++;
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

// Сортировка категорий
rows.sort((a, b) => {
  const order = [
    'iphone',
    'ipad',
    'macbook',
    'airpods',
    'apple watch',
    'аксессуары'
  ];

  return (
    order.indexOf(a.category) -
    order.indexOf(b.category)
  );
});

// Время обновления
const now = new Date();

const formattedDate = now.toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Minsk'
}).replace(',', '');

// CSV
let csv = `last_update,${formattedDate}\n`;
csv += 'id,model,price,category\n';

csv += rows
  .map(r =>
    `${r.id},${r.model},${r.price},${r.category}`
  )
  .join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');

console.log(
  `✔ products.csv создан (${rows.length} товаров, обновлено ${formattedDate})`
);
