const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'input.txt');
const outputPath = path.join(__dirname, '..', 'products.csv');

if (!fs.existsSync(inputPath)) {
  console.error('❌ Файл input.txt не найден');
  process.exit(1);
}

const input = fs.readFileSync(inputPath, 'utf-8');
const lines = input.split('\n').map(l => l.trim()).filter(Boolean);

let id = 1;
const rows = [];

const productRegex = /^(.+?)\s+(\d+(?:TB|GB)?)\s+(\w+)\s+([\w+]+)\s*-\s*(\d+)\s*BYN/i;

for (const line of lines) {
  const match = productRegex.exec(line);
  if (match) {
    const [_, name, memory, color, sim, priceRaw] = match;
    const model = `${name} ${memory} ${color} ${sim}`;
    const price = Number(priceRaw).toLocaleString('ru-RU', { minimumFractionDigits: 0 });
    rows.push({ id, model, price });
    id++;
  }
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

// === Форматирование даты ===
const now = new Date();
const formattedDate = now.toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).replace(',', '');

// === Формируем CSV ===
let csv = `last_update,${formattedDate}\n`;
csv += 'id,model,price\n';
csv += rows.map(r => `${r.id},${r.model},${r.price}`).join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`✔ products.csv создан (${rows.length} товаров, обновлено ${formattedDate})`);
