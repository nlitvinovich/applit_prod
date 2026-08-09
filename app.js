async function loadCatalog() {
  const response = await fetch("products.csv?v=" + Date.now());
  const text = await response.text();

  const lines = text.split("\n").slice(2); // пропускаем last_update и заголовок
  const catalog = document.getElementById("catalog");

  lines.forEach(line => {
    const [id, model, price, category] = line.split(",");

    if (!model || !price || !category) return;

    const item = document.createElement("div");
    item.className = "product-item";
    item.dataset.category = category;

    item.innerHTML = `
      <div class="product-title">${model}</div>
      <div class="product-price">${price} BYN</div>
    `;

    catalog.appendChild(item);
  });
}

loadCatalog();

// Фильтрация по категориям
document.querySelectorAll('.category-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;

    document.querySelectorAll('.category-buttons button')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    document.querySelectorAll('.product-item').forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
