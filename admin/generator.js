function parseTelegramToCSV(inputText) {
  const lines = inputText.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  let category = "";
  let id = 1;
  const rows = [];

  const categoryRegex = /^📱\s*(.+)$/i;
  const productRegex = /^(.+?)\s+(\d+(?:TB|GB)?)\s+(\w+)\s+([\w+]+)\s*-\s*(\d+)\s*BYN/i;

  for (const line of lines) {
    // Категория
    const catMatch = line.match(categoryRegex);
    if (catMatch) {
      category = catMatch[1].trim();
      continue;
    }

    // Товар
    const prodMatch = line.match(productRegex);
    if (prodMatch) {
      const name = prodMatch[1].trim();
      const memory = prodMatch[2].trim();
      const color = prodMatch[3].trim();
      const sim = prodMatch[4].trim();
      const price = prodMatch[5].trim();

      rows.push({
        id: id++,
        category,
        name,
        memory,
        color,
        sim,
        price
      });
    }
  }

  // Формируем CSV
  let csv = "id,category,name,memory,color,sim,price\n";
  rows.forEach(r => {
    csv += `${r.id},${r.category},${r.name},${r.memory},${r.color},${r.sim},${r.price}\n`;
  });

  return csv;
}
