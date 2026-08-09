let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

/* Badge */
function updateCartCount() {
  const tabCart = document.getElementById('tab-cart');
  const badge = tabCart.querySelector('.tab-badge');
  badge.textContent = cart.length;
}
updateCartCount();

/* Загрузка CSV */
fetch('products.csv?' + Date.now())
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split('\n');

    const first = lines[0].split(',');
    const lastUpdate = first[1]?.trim();

    const headers = lines[1].split(',');

    products = lines.slice(2).map(line => {
      const cols = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h.trim()] = cols[i]?.trim());
      return obj;
    });

    renderCatalog(products);
    updateTime(lastUpdate);
  });

function updateTime(lastUpdate) {
  document.getElementById('update-time').textContent = `Обновлено: ${lastUpdate}`;
}

/* Рендер каталога */
function renderCatalog(data) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-title">${item.model}</div>
      <button class="add-to-cart">🛒</button>
      <div class="card-price">${item.price} BYN</div>
    `;

    card.querySelector('.add-to-cart').addEventListener('click', () => {
      cart.push(item);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
    });

    catalog.appendChild(card);
  });
}

/* Поиск */
document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtered = products.filter(p =>
    (p.model || '').toLowerCase().includes(q)
  );
  renderCatalog(filtered);
});

/* Открытие корзины */
document.getElementById('tab-cart').addEventListener('click', () => {
  const modal = document.getElementById('cart-modal');
  const items = document.getElementById('cart-items');

  items.innerHTML = cart.map((i, index) => `
    <div class="cart-item">
      <span>${i.model} — ${i.price} BYN</span>
      <button class="cart-remove" data-index="${index}">×</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  document.getElementById('cart-total').textContent = `Итого: ${total} BYN`;

  modal.style.display = 'flex';
});

/* Удаление товара */
document.addEventListener('click', e => {
  if (e.target.classList.contains('cart-remove')) {
    const index = Number(e.target.dataset.index);
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    document.getElementById('tab-cart').click();
  }
});

/* Закрытие корзины */
document.getElementById('cart-close').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'none';
});

/* Кнопка заказать — отправка по нику */
document.getElementById('cart-order-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    alert("Корзина пуста");
    return;
  }

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const text =
    "🛒 Заказ appLit:\n" +
    cart.map(i => `• ${i.model} — ${i.price} BYN`).join("\n") +
    `\nИтого: ${total} BYN`;

  const encoded = encodeURIComponent(text).replace(/%0A/g, "%0A");

  window.location.href = `https://t.me/ilitvinovich?text=${encoded}`;
});

/* Кнопка поделиться каталогом — нативное окно */
document.getElementById('share-catalog-btn').addEventListener('click', async () => {
  const shareText =
    "Лови каталог appLit!\nОткрой в Safari → Поделиться → Добавить на экран Домой\nКороче, как мы делали с АльфаБанком :)\nhttps://applitcat.vercel.app/";

  const shareData = {
    title: "Каталог appLit",
    text: shareText
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      alert("Не удалось открыть окно поделиться");
    }
  } else {
    window.location.href =
      `https://t.me/ilitvinovich?text=${encodeURIComponent(shareText)}`;
  }
});

/* Анимация таббара */
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const tabbar = document.querySelector('.tabbar');
  const currentScroll = window.scrollY;

  if (currentScroll > lastScroll + 10) {
    tabbar.classList.add('lifted');
  } else if (currentScroll < lastScroll - 10) {
    tabbar.classList.remove('lifted');
  }

  lastScroll = currentScroll;
});
