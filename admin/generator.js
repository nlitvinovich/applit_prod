function cleanLine(line) {
  return line
    .replace(/\*\*/g, '')        // убираем markdown
    .replace(/🔥/g, '')          // убираем эмодзи
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // убираем любые эмодзи
    .trim();
}

const productRegex = /(.*?)-\s*([\d\s]+)\s*BYN/i;

for (let raw of lines) {
  const line = cleanLine(raw);

  const match = line.match(productRegex);
  if (!match) continue;

  const model = match[1].trim();
  const priceRaw = match[2].trim().replace(/\s+/g, '');

  const numericPrice = parseInt(priceRaw, 10);
  if (isNaN(numericPrice)) continue;

  const roundedPrice = Math.round(numericPrice / 10) * 10;
  const price = roundedPrice.toLocaleString('ru-RU');

  rows.push({ id, model, price });
  id++;
}
