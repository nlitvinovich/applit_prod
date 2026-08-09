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

let category = '';
let id = 1;
const rows = [];

const categoryRegex = /^📱\s*(.+)$/i;
const productRegex = /^(.+?)\s+(\d+(?:TB|GB)?)\s+(\w+)\s+([\w+]+)\s*-\s*(\d+)\s*BYN/i;

for (const line of lines) {
  const catMatch = categoryRegex.exec(line);
  if (catMatch) {
    category = catMatch[1].trim();
    continue;
  }

  const prodMatch = productRegex.exec(line);
  if (prodMatch) {
    const [_, name, memory, color, sim, price] = prodMatch;
    rows.push({ id, category, name, memory, color, sim, price });
    id++;
  }
}

if (rows.length === 0) {
  console.error('❌ Нет данных для генерации CSV');
  process.exit(1);
}

const header = 'id,category,name,memory,color,sim,price\n';
const csv = header + rows.map(r => `${r.id},${r.category},${r.name},${r.memory},${r.color},${r.sim},${r.price}`).join('\n');

fs.writeFileSync(outputPath, csv, 'utf-8');
console.log('✔ products.csv создан');
