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

// Классификация по 6 категориям
function classify(model) {
  const m = model.toLowerCase();

  // iphone — любые 13/14/15/16/17, pro, max, plus, e, air
  if (
    m.includes('iphone') ||
    m.startsWith('17') ||
    m.startsWith('16') ||
    m.startsWith('15') ||
    m.startsWith('14') ||
    m.startsWith('13/')
  ) {
    return 'iphone';
  }

  // ipad — любые iPad, iPad Air, iPad Pro
  if (m.includes('ipad')) {
    return 'ipad';
  }

  // macbook — любые MacBook, Air 13/15 M4/M5, Neo
  if (m.includes('macbook') || m.startsWith('air 13 m') || m.startsWith('air 15 m')) {
    return 'macbook';
  }

  // airpods — любые AirPods, AirPods Pro, Max, 4, ANC
  if (m.includes('airpods')) {
    return 'airpods';
  }

  // apple watch — SE3, S11, Ultra, Watch
  if (m.includes('watch') || m.includes('se3') || m.includes('s11') || m.includes('ultra')) {
    return 'apple watch';
  }

  // аксессуары — всё остальное: Pencil, Adapter, Magic Mouse, AirTag и прочее
  return 'аксессуары';
}

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

  rows.push({ id, model, price, category });
  id++;
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

rows.sort((a, b) => {
  const order = ['iphone', 'ipad', 'macbook', 'airpods', 'apple watch', 'аксессуары'];
  const ai = order.indexOf(a.category);
  const bi = order.indexOf(b.category);
  if (ai !== bi) return ai - bi;
  return 0;
});

const now = new Date();
const formattedDate = now.toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Minsk'
}).replace(',', '');

let csv = `last_update,${formattedDate}\n`;
csv += 'id,model,price,category\n';
csv += rows.map(r => `${r.id},${r.model},${r.price},${r.category}`).join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`✔ products.csv создан (${rows.length} товаров, обновлено ${formattedDate})`);
