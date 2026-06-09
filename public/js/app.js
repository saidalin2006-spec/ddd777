/* ========================================
   QAZHEAT — SPA Application
   ======================================== */

(function () {
  'use strict';

  const API = '/api';
  const WHATSAPP = '77088022363';
  const PHONE = '+7 708 802 2363';
  const PHONE_TEL = '+77088022363';

  const HIDDEN_PRODUCT_SLUGS = new Set(['aq50g2-aquor', 'aq80g2-aquor']);
  const HIDDEN_CART_NAMES = new Set(['Мотопомпа AQ50-G2 AQUOR', 'Мотопомпа AQ80-G2 AQUOR']);
  const RECENT_VIEWS_KEY = 'qh_recent_views';

  function omitHiddenProducts(list) {
    return (list || []).filter((p) => p && !HIDDEN_PRODUCT_SLUGS.has(p.slug));
  }

  // ---- State ----
  const cartRaw = JSON.parse(localStorage.getItem('qh_cart') || '[]');
  let cart = cartRaw.filter(
    (i) => !HIDDEN_PRODUCT_SLUGS.has(i.slug) && !(i.name && HIDDEN_CART_NAMES.has(i.name))
  );
  if (cart.length !== cartRaw.length) {
    localStorage.setItem('qh_cart', JSON.stringify(cart));
  }
  let city = localStorage.getItem('qh_city') || '';

  // ---- DOM refs ----
  const $app = document.getElementById('app');
  const $cartBadge = document.getElementById('cartBadge');
  const $header = document.getElementById('header');
  const $cityModal = document.getElementById('cityModal');
  const $fab = document.getElementById('fab');
  const $mobileMenu = document.getElementById('mobileMenu');
  const $burger = document.getElementById('burgerBtn');
  const $headerCityName = document.getElementById('headerCityName');
  const $footer = document.getElementById('footer');

  // ---- Utilities ----
  function formatPrice(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
  }

  function salePercentForProduct(p) {
    if (!p || p.old_price == null || p.price == null) return 0;
    const oldP = Number(p.old_price);
    const cur = Number(p.price);
    if (!oldP || oldP <= cur) return 0;
    return Math.max(1, Math.round(((oldP - cur) / oldP) * 100));
  }

  function getCategoryIcon(slug) {
    const icons = {
      'pumps': '💧',
      'stations': '🏠',
      'generators': '⚡',
      'compressors': '🔧',
      'heaters': '🔥',
      'motors': '⚙️',
      'tools': '🛠️',
      'tanks': '🛢️',
    };
    return icons[slug] || '🔧';
  }

  function getProductIcon(categorySlug) {
    return getCategoryIcon(categorySlug);
  }

  function getCategoryImage(slug) {
    const images = {
      'pumps': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80',
      'stations': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
      'generators': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
      'compressors': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
      'heaters': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
      'motors': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80',
    };
    return images[slug] || images.pumps;
  }

  function getCategoryCardImage(slug) {
    const images = {
      'pumps': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1600&q=80',
      'stations': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
      'generators': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1600&q=80',
      'compressors': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1600&q=80',
      'heaters': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1600&q=80',
      'motors': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1600&q=80',
    };
    return images[slug] || images.pumps;
  }

  const GRANDFAR_QDX_SUBMERSIBLE_IMAGE = '/images/catalog/grandfar-qdx-submersible.png';
  const GRANDFAR_QDX_SUBMERSIBLE_SLUGS = new Set([
    'qdx15-25-055-grandfar',
    'qdx40-6-11-grandfar',
    'qdx6-25-11-grandfar',
    'qdx15-17-037-grandfar',
  ]);

  const GRANDFAR_CHT4_CENTRIFUGAL_IMAGE = '/images/catalog/grandfar-cht4-centrifugal.png';
  const GRANDFAR_CHT4_CENTRIFUGAL_SLUGS = new Set(['cht4-40-grandfar', 'cht4-60-grandfar']);

  const GRANDFAR_SEM18_WELL_PUMP_IMAGE = '/images/catalog/grandfar-sem18-well-pump.png';
  const GRANDFAR_SEM18_WELL_PUMP_SLUGS = new Set(['sem18-14t-grandfar', 'sem18-10t-grandfar']);

  const GRANDFAR_DRAINAGE_PUMP_IMAGE = '/images/catalog/grandfar-drainage-gpe-gp.png';
  const GRANDFAR_DRAINAGE_PUMP_SLUGS = new Set(['gpe403f-grandfar', 'gp753f-grandfar']);

  const GRANDFAR_WQD_SEWAGE_PUMP_IMAGE = '/images/catalog/grandfar-wqd6-sewage.png';

  const GRANDFAR_QB_VORTEX_IMAGE = '/images/catalog/grandfar-qb-vortex.png';
  const GRANDFAR_QB_VORTEX_SLUGS = new Set(['qb60-grandfar', 'qb80-k1-grandfar']);

  const GRANDFAR_X15_BOOSTER_IMAGE = '/images/catalog/grandfar-x15-10a-booster.png';

  const AQUOR_AHFM_CENTRIFUGAL_IMAGE = '/images/catalog/aquor-ahfm-centrifugal.png';
  const AQUOR_AHFM_CENTRIFUGAL_SLUGS = new Set(['ahfm6ar-aquor', 'ahfm5bm-aquor']);

  const AQUOR_AUTOJET_STATION_IMAGE = '/images/catalog/aquor-autojet-station.png';
  const AQUOR_AUTOJET_STATION_SLUGS = new Set(['autojet750-aquor', 'autojet1100-aquor']);

  const AQUOR_QDX_SUBMERSIBLE_IMAGE = '/images/catalog/aquor-qdx-submersible.png';
  const AQUOR_QDX_SUBMERSIBLE_SLUGS = new Set([
    'qdx15-25-055f-aquor',
    'qdx15-17-037-aquor',
    'wqd6-16-075-aquor',
  ]);

  const AQUOR_QB70_VORTEX_IMAGE = '/images/catalog/aquor-qb70-vortex.png';

  const AQUOR_QJDY_WELL_PUMP_IMAGE = '/images/catalog/aquor-qjdy18-10-well.png';

  const TRIANGLE_TR80020_HEATER_IMAGE = '/images/catalog/triangle-tr80020-heater.png';
  const TRIANGLE_TR80030_HEATER_IMAGE = '/images/catalog/triangle-tr80030-heater.png';
  const TRIANGLE_TR83000_HEATER_IMAGE = '/images/catalog/triangle-tr83000-heater.png';
  const TRIANGLE_TR83009_HEATER_IMAGE = '/images/catalog/triangle-tr83009-heater.png';
  const TRIANGLE_TR911200_STATION_IMAGE = '/images/catalog/triangle-tr911200-station.png';

  const KUMO_KGFE3600ES_IMAGE = '/images/catalog/kumo-kgfe3600es-generator.png';
  const KUMO_KGFE7500ES_IMAGE = '/images/catalog/kumo-kgfe7500es-generator.png';
  const KUMO_KGFE12000ES_IMAGE = '/images/catalog/kumo-kgfe12000es-generator.png';
  const KUMO_QZ2050L_IMAGE = '/images/catalog/kumo-qz2050l-compressor.png';
  const KUMO_QZ2024L_IMAGE = '/images/catalog/kumo-qz2024l-compressor.png';
  const KUMO_QV2550_IMAGE = '/images/catalog/kumo-qv2550-compressor.png';
  const KUMO_KWP50S_IMAGE = '/images/catalog/kumo-kwp50s-motopump.png';
  const KUMO_KWP80S_IMAGE = '/images/catalog/kumo-kwp80s-motopump.png';

  const GRANDFAR_PW_STATION_IMAGE = '/images/catalog/grandfar-pw-station.png';
  const GRANDFAR_PW_STATION_SLUGS = new Set(['pw370-grandfar', 'pw550e-grandfar']);

  const GRANDFAR_PW750E_STATION_IMAGE = '/images/catalog/grandfar-pw750e-station.png';

  const GRANDFAR_AWZB125_STATION_IMAGE = '/images/catalog/grandfar-awzb125-station.png';

  const GRANDFAR_AUTOGJSM800_STATION_IMAGE = '/images/catalog/grandfar-autogjsm800-station.png';

  const GRANDFAR_GFV_GENERATOR_IMAGE = '/images/catalog/grandfar-gfv-e-g1-generator.png';
  const GRANDFAR_GFV_GENERATOR_SLUGS = new Set([
    'gfv2500e-grandfar',
    'gfv6500e-grandfar',
    'gfv9500e-grandfar',
    'gfh2500-grandfar',
  ]);

  const GRANDFAR_GFBM_COMPRESSOR_IMAGE = '/images/catalog/grandfar-gfbm-compressor.png';
  const GRANDFAR_GFBM_COMPRESSOR_SLUGS = new Set(['gfbm21120-grandfar', 'gfbm71550a-grandfar']);

  const GRANDFAR_GF2065_COMPRESSOR_IMAGE = '/images/catalog/grandfar-gf2065-150-compressor.png';

  const GRANDFAR_PRESSURE_TANK_IMAGE = '/images/catalog/grandfar-pressure-tank-gfc-gfv.png';
  const GRANDFAR_PRESSURE_TANK_SLUGS = new Set(['gfc24l-grandfar', 'gfv100t-grandfar']);

  const GRANDFAR_GF_MOTOPUMP_IMAGE = '/images/catalog/grandfar-gf-motopump.png';
  const GRANDFAR_GF_MOTOPUMP_SLUGS = new Set(['gf50g-grandfar', 'gf80g-grandfar', 'gf100g1-grandfar']);

  /** Единый URL фото товара (каталог, карточка, корзина) — общее фото GRANDFAR QDX важнее устаревшего image_url из API */
  function resolveProductImageUrl(p) {
    if (!p) return getCategoryImage('');
    if (p.slug && AQUOR_AHFM_CENTRIFUGAL_SLUGS.has(p.slug)) return AQUOR_AHFM_CENTRIFUGAL_IMAGE;
    if (p.slug && AQUOR_AUTOJET_STATION_SLUGS.has(p.slug)) return AQUOR_AUTOJET_STATION_IMAGE;
    if (p.slug && AQUOR_QDX_SUBMERSIBLE_SLUGS.has(p.slug)) return AQUOR_QDX_SUBMERSIBLE_IMAGE;
    if (p.slug === 'qb70-aquor') return AQUOR_QB70_VORTEX_IMAGE;
    if (p.slug === 'qjdy18-10-aquor') return AQUOR_QJDY_WELL_PUMP_IMAGE;
    if (p.slug === 'tr80020-triangle') return TRIANGLE_TR80020_HEATER_IMAGE;
    if (p.slug === 'tr80030-triangle') return TRIANGLE_TR80030_HEATER_IMAGE;
    if (p.slug === 'tr83000-triangle') return TRIANGLE_TR83000_HEATER_IMAGE;
    if (p.slug === 'tr83009-triangle') return TRIANGLE_TR83009_HEATER_IMAGE;
    if (p.slug === 'tr911200-triangle') return TRIANGLE_TR911200_STATION_IMAGE;
    if (p.slug === 'kgfe3600es-kumo') return KUMO_KGFE3600ES_IMAGE;
    if (p.slug === 'kgfe7500es-kumo') return KUMO_KGFE7500ES_IMAGE;
    if (p.slug === 'kgfe12000es-kumo') return KUMO_KGFE12000ES_IMAGE;
    if (p.slug === 'qz2050l-kumo') return KUMO_QZ2050L_IMAGE;
    if (p.slug === 'qz2024l-kumo') return KUMO_QZ2024L_IMAGE;
    if (p.slug === 'qv-2550-kumo') return KUMO_QV2550_IMAGE;
    if (p.slug === 'kwp50s-kumo') return KUMO_KWP50S_IMAGE;
    if (p.slug === 'kwp80s-kumo') return KUMO_KWP80S_IMAGE;
    if (p.slug && GRANDFAR_PW_STATION_SLUGS.has(p.slug)) return GRANDFAR_PW_STATION_IMAGE;
    if (p.slug === 'pw750e-grandfar') return GRANDFAR_PW750E_STATION_IMAGE;
    if (p.slug === 'awzb125-grandfar') return GRANDFAR_AWZB125_STATION_IMAGE;
    if (p.slug === 'autogjsm800-grandfar') return GRANDFAR_AUTOGJSM800_STATION_IMAGE;
    if (p.slug && GRANDFAR_GFV_GENERATOR_SLUGS.has(p.slug)) return GRANDFAR_GFV_GENERATOR_IMAGE;
    if (p.slug && GRANDFAR_GFBM_COMPRESSOR_SLUGS.has(p.slug)) return GRANDFAR_GFBM_COMPRESSOR_IMAGE;
    if (p.slug === 'gf2065-150-grandfar') return GRANDFAR_GF2065_COMPRESSOR_IMAGE;
    if (p.slug && GRANDFAR_PRESSURE_TANK_SLUGS.has(p.slug)) return GRANDFAR_PRESSURE_TANK_IMAGE;
    if (p.slug && GRANDFAR_GF_MOTOPUMP_SLUGS.has(p.slug)) return GRANDFAR_GF_MOTOPUMP_IMAGE;
    if (p.slug && GRANDFAR_QDX_SUBMERSIBLE_SLUGS.has(p.slug)) return GRANDFAR_QDX_SUBMERSIBLE_IMAGE;
    if (p.slug && GRANDFAR_CHT4_CENTRIFUGAL_SLUGS.has(p.slug)) return GRANDFAR_CHT4_CENTRIFUGAL_IMAGE;
    if (p.slug && GRANDFAR_SEM18_WELL_PUMP_SLUGS.has(p.slug)) return GRANDFAR_SEM18_WELL_PUMP_IMAGE;
    if (p.slug && GRANDFAR_DRAINAGE_PUMP_SLUGS.has(p.slug)) return GRANDFAR_DRAINAGE_PUMP_IMAGE;
    if (p.slug === 'wqd6-16-075-grandfar') return GRANDFAR_WQD_SEWAGE_PUMP_IMAGE;
    if (p.slug && GRANDFAR_QB_VORTEX_SLUGS.has(p.slug)) return GRANDFAR_QB_VORTEX_IMAGE;
    if (p.slug === 'x15-10a-grandfar') return GRANDFAR_X15_BOOSTER_IMAGE;
    const u = p.image_url != null ? String(p.image_url).trim() : '';
    if (u) return u;
    if (p.slug) return `/images/catalog/${p.slug}.jpg`;
    return getCategoryImage(p.category_slug);
  }

  /** Миниатюра в корзине */
  function cartItemThumbSrc(item) {
    return resolveProductImageUrl(item);
  }

  function cartItemThumbInnerHTML(item) {
    const src = cartItemThumbSrc(item);
    const alt = escapeHtml(item.name || 'Товар');
    const icon = getProductIcon(item.category_slug);
    return `<img class="cart-item__img" src="${src}" alt="${alt}" loading="lazy" decoding="async" onerror="this.style.display='none';var f=this.nextElementSibling;if(f)f.style.display='flex'"><div class="cart-item__img-fallback" aria-hidden="true">${icon}</div>`;
  }

  function escapeHtml(str) {
    if (str == null || str === '') return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncateText(str, maxLength) {
    if (!str) return '';
    const text = String(str).trim();
    return text.length <= maxLength ? text : text.slice(0, maxLength).trim() + '…';
  }

  function formatFuelLabel(ft) {
    const m = {
      0: 'Электро',
      1: 'Газ',
      2: 'Дизель',
      gas: 'Газ',
      diesel: 'Дизель',
      electric: 'Электро',
    };
    if (m[ft] != null) return m[ft];
    return String(ft);
  }

  /** Код модели для блока «Модель:» (первая часть артикула) */
  function productModelCode(p) {
    if (!p || !p.slug) return '—';
    return String(p.slug).split('-')[0].toUpperCase();
  }

  /** Только технические строки для таблицы под карточкой (без дубля бренда/наличия) */
  function productTechnicalSpecsRowsHTML(p) {
    const rows = [];
    if (p.category_name) rows.push(['Категория', p.category_name]);
    if (p.slug) rows.push(['Артикул', p.slug]);
    if (p.power_kw != null && p.power_kw !== '') {
      rows.push(['Мощность', `${Number(p.power_kw)} кВт`]);
    }
    if (p.area_sqm != null && p.area_sqm !== '') {
      rows.push(['Площадь', `${p.area_sqm} м²`]);
    }
    if (p.efficiency != null && p.efficiency !== '') {
      rows.push(['КПД / класс', String(p.efficiency)]);
    }
    if (p.fuel_type != null && p.fuel_type !== '') {
      rows.push(['Топливо / тип', formatFuelLabel(p.fuel_type)]);
    }
    return rows
      .map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
      .join('');
  }

  // ---- Cart ----
  function saveCart() {
    localStorage.setItem('qh_cart', JSON.stringify(cart));
    updateCartBadge();
  }

  function updateCartBadge() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $cartBadge.textContent = count;
    $cartBadge.dataset.count = count;
  }

  function addToCart(product, qtyAdd) {
    const n = Math.max(1, Math.min(99, Number(qtyAdd) || 1));
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += n;
      existing.image_url = resolveProductImageUrl({ ...existing, ...product });
    } else {
      cart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand_name: product.brand_name,
        price: product.price,
        category_slug: product.category_slug,
        image_url: resolveProductImageUrl(product),
        qty: n,
      });
    }
    saveCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
    saveCart();
  }

  function getCartTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  // ---- API Fetch ----
  async function fetchJSON(url) {
    const res = await fetch(url);
    return res.json();
  }

  // ---- Router ----
  function getRoute() {
    const hash = location.hash.slice(1) || '/';
    const [path, qs] = hash.split('?');
    const params = new URLSearchParams(qs || '');
    return { path, params };
  }

  async function router() {
    const { path, params } = getRoute();
    window.scrollTo(0, 0);
    updateActiveNav(path);

    if (path === '/' || path === '/home') {
      await renderHome();
    } else if (path === '/catalog') {
      await renderCatalog(params);
    } else if (path.startsWith('/product/')) {
      const id = path.split('/')[2];
      await renderProduct(id);
    } else if (path === '/cart') {
      renderCart();
    } else if (path === '/checkout') {
      renderCheckout();
    } else if (path === '/about') {
      renderAbout();
    } else if (path === '/contacts') {
      renderContacts();
    } else {
      await renderHome();
    }

    $footer.style.display = '';
    syncFooterAddressLink();
    initScrollReveal();
    window.dispatchEvent(new Event('scroll'));
  }

  /** Адрес в футере: ссылка на «Контакты» на всех страницах, кроме самой страницы контактов. */
  function syncFooterAddressLink() {
    const addr = document.getElementById('footerAddress');
    if (!addr) return;
    const { path } = getRoute();
    const text = 'г. Караганда, ул. Гоголя, 2/1';
    const onContacts = path === '/contacts';
    const isLink = addr.tagName === 'A';
    if (onContacts && isLink) {
      const p = document.createElement('p');
      p.id = 'footerAddress';
      p.className = 'footer__address-text';
      p.textContent = text;
      addr.replaceWith(p);
    } else if (!onContacts && !isLink) {
      const a = document.createElement('a');
      a.id = 'footerAddress';
      a.className = 'footer__address-text';
      a.href = '#/contacts';
      a.textContent = text;
      addr.replaceWith(a);
    }
  }

  function updateActiveNav(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const nav = link.dataset.nav;
      if ((path === '/' || path === '/home') && nav === 'home') link.classList.add('active');
      else if (path.startsWith('/catalog') && nav === 'catalog') link.classList.add('active');
      else if (path === '/about' && nav === 'about') link.classList.add('active');
      else if (path === '/contacts' && nav === 'contacts') link.classList.add('active');
    });
  }

  // ---- Pages ----

  async function renderHome() {
    const [productsRaw, categories] = await Promise.all([
      fetchJSON(`${API}/products?sort=recommended`),
      fetchJSON(`${API}/categories`),
    ]);
    const products = omitHiddenProducts(productsRaw);

    const featured = products.filter(p => p.is_recommended).slice(0, 8);
    if (featured.length < 4) featured.push(...products.slice(0, 8 - featured.length));

    $header.classList.add('header--dark');

    const mq = 'QAZHEAT · Насосы · Генераторы · Компрессоры · Обогреватели · Доставка по КЗ · GRANDFAR · AQUOR · KUMO · Оригинал · ';
    const mqHalf = `<span class="hero__marquee-seg">${mq}</span>`.repeat(4);
    const mqLoop = `<div class="hero__marquee-group">${mqHalf}</div>`.repeat(2);

    $app.innerHTML = `
      <section class="hero">
        <div class="hero__bg"><div class="hero__bg-accent"></div></div>
        <div class="hero__marquees" aria-hidden="true">
          <div class="hero__marquee hero__marquee--a">
            <div class="hero__marquee-track">${mqLoop}</div>
          </div>
          <div class="hero__marquee hero__marquee--b">
            <div class="hero__marquee-track hero__marquee-track--rev">${mqLoop}</div>
          </div>
          <div class="hero__marquee hero__marquee--c">
            <div class="hero__marquee-track">${mqLoop}</div>
          </div>
        </div>
        <div class="hero__particles" id="heroParticles"></div>
        <div class="container hero__container">
          <div class="hero__content hero__content--centered" id="heroContent">
            <div class="hero__badge">Официальный дилер GRANDFAR и AQUOR в Казахстане</div>
            <h1 class="hero__title">
              Оборудование для<br>вашего <span>дома</span>
            </h1>
            <p class="hero__desc">
              Насосы, генераторы, компрессоры и обогреватели от ведущих производителей.
              Бесплатная доставка по Караганде и всему Казахстану.
            </p>
            <div class="hero__actions">
              <a href="#/catalog" class="btn btn--primary btn--lg">Перейти в каталог</a>
              <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener" class="btn btn--ghost">Написать в WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section__header reveal">
            <div class="section__tag">Популярное</div>
            <h2 class="section__title">Рекомендуемые товары</h2>
            <p class="section__subtitle">Лучшие предложения по соотношению цена-качество</p>
          </div>
          <div class="products-grid reveal">
            ${featured.map(p => productCardHTML(p)).join('')}
          </div>
          <div style="text-align:center;margin-top:40px" class="reveal">
            <a href="#/catalog" class="btn btn--dark">Смотреть весь каталог</a>
          </div>
        </div>
      </section>

      <section class="section section--dark">
        <div class="container">
          <div class="section__header reveal">
            <div class="section__tag" style="color:var(--red)">Преимущества</div>
            <h2 class="section__title">Почему выбирают QAZHEAT?</h2>
            <p class="section__subtitle">Подбираем оборудование под вашу задачу и сопровождаем от консультации до запуска</p>
          </div>
          <div class="advantages-grid reveal">
            <div class="advantage-card">
              <div class="advantage-card__media" style="background-image:url('https://images.pexels.com/photos/2569842/pexels-photo-2569842.jpeg?auto=compress&cs=tinysrgb&w=1600')"></div>
              <h3 class="advantage-card__title">Точный подбор под объект</h3>
              <p class="advantage-card__text">Учитываем давление, глубину, расход воды и режим работы, чтобы оборудование служило долго и без переплат.</p>
            </div>
            <div class="advantage-card">
              <div class="advantage-card__media" style="background-image:url('https://images.pexels.com/photos/8867435/pexels-photo-8867435.jpeg?auto=compress&cs=tinysrgb&w=1600')"></div>
              <h3 class="advantage-card__title">Официальная гарантия</h3>
              <p class="advantage-card__text">Поставляем оригинальную технику от проверенных брендов с документами, гарантийной поддержкой и сервисом.</p>
            </div>
            <div class="advantage-card">
              <div class="advantage-card__media" style="background-image:url('https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=1600')"></div>
              <h3 class="advantage-card__title">Быстрая отгрузка по Казахстану</h3>
              <p class="advantage-card__text">Оперативно комплектуем заказ и отправляем в любой регион, чтобы вы не теряли время в сезон работ.</p>
            </div>
            <div class="advantage-card">
              <div class="advantage-card__media" style="background-image:url('https://images.pexels.com/photos/8867249/pexels-photo-8867249.jpeg?auto=compress&cs=tinysrgb&w=1600')"></div>
              <h3 class="advantage-card__title">Поддержка после покупки</h3>
              <p class="advantage-card__text">Помогаем с установкой, пуском и обслуживанием. Остаёмся на связи после продажи, а не только до оплаты.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section__header reveal">
            <div class="section__tag">Отзывы</div>
            <h2 class="section__title">Нам доверяют</h2>
            <p class="section__subtitle">Отзывы наших довольных клиентов</p>
          </div>
          <div class="reviews-grid reveal">
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Брали насос GRANDFAR для скважины на дачу. Ребята помогли подобрать нужную модель, привезли в тот же день. Уже полгода работает без нареканий!</p>
              <div class="review-card__author">
                <div class="review-card__avatar">АМ</div>
                <div><div class="review-card__name">Алексей М.</div><div class="review-card__city">Караганда</div></div>
              </div>
            </div>
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Заказывали генератор KUMO и компрессор. Цены ниже, чем на рынке. Доставили бесплатно, ещё и скидку сделали. Рекомендую QAZHEAT!</p>
              <div class="review-card__author">
                <div class="review-card__avatar">ДК</div>
                <div><div class="review-card__name">Дана К.</div><div class="review-card__city">Астана</div></div>
              </div>
            </div>
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Оформили станцию водоснабжения в рассрочку — никаких проблем. Менеджер всё объяснил, документы быстро. Через год выплачу. Спасибо!</p>
              <div class="review-card__author">
                <div class="review-card__avatar">ТА</div>
                <div><div class="review-card__name">Тимур А.</div><div class="review-card__city">Караганда</div></div>
              </div>
            </div>
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Купили обогреватель TRIANGLE для гаража — мощность отличная, место почти не занимает. Менеджер Самат подсказал по мощности, привезли на следующий день. Уже второй сезон греет без сбоев.</p>
              <div class="review-card__author">
                <div class="review-card__avatar">РС</div>
                <div><div class="review-card__name">Руслан С.</div><div class="review-card__city">Шымкент</div></div>
              </div>
            </div>
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Закажите насос AQUOR для полива участка. Консультант помог с расчётом производительности, всё пришло в сборе, инструкция на русском. Сосед тоже уже заказывает у вас.</p>
              <div class="review-card__author">
                <div class="review-card__avatar">НЗ</div>
                <div><div class="review-card__name">Наталья З.</div><div class="review-card__city">Актобе</div></div>
              </div>
            </div>
            <div class="review-card">
              <div class="review-card__stars">★★★★★</div>
              <p class="review-card__text">Брали компрессор KUMO для СТО. Довольны — тихий, давление держит стабильно. Оформили в рассрочку на 12 месяцев, переплата минимальная. Сервис на высоте, звонили уточнить как работает.</p>
              <div class="review-card__author">
                <div class="review-card__avatar">ЕВ</div>
                <div><div class="review-card__name">Евгений В.</div><div class="review-card__city">Павлодар</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--gray">
        <div class="container">
          <div class="section__header reveal">
            <div class="section__tag">FAQ</div>
            <h2 class="section__title">Частые вопросы</h2>
            <p class="section__subtitle">Ответы на самые популярные вопросы наших клиентов</p>
          </div>
          <div class="faq-list reveal">
            <div class="faq-item">
              <button class="faq-item__question">
                Как подобрать нужный насос?
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__answer"><p>Выбор насоса зависит от назначения: для скважины, полива, водоснабжения дома или откачки воды. Наши специалисты бесплатно подберут модель под ваши параметры — достаточно позвонить или написать в WhatsApp.</p></div>
            </div>
            <div class="faq-item">
              <button class="faq-item__question">
                Есть ли доставка в другие города Казахстана?
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__answer"><p>Да, мы доставляем по всему Казахстану. Доставка по Караганде — бесплатная. В другие города отправляем транспортными компаниями, срок доставки 1-5 дней.</p></div>
            </div>
            <div class="faq-item">
              <button class="faq-item__question">
                Можно ли оформить рассрочку?
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__answer"><p>Да, на многие товары доступна рассрочка до 24 месяцев через банки-партнёры. Товары с пометкой «Рассрочка» или «Кредит» можно оформить прямо при заказе.</p></div>
            </div>
            <div class="faq-item">
              <button class="faq-item__question">
                Какие бренды вы продаёте?
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__answer"><p>Мы являемся официальными дилерами GRANDFAR, AQUOR, KUMO и TRIANGLE. Вся продукция сертифицирована и имеет гарантию от производителя.</p></div>
            </div>
            <div class="faq-item">
              <button class="faq-item__question">
                Какая гарантия на оборудование?
                <span class="faq-item__icon">+</span>
              </button>
              <div class="faq-item__answer"><p>Гарантия зависит от производителя: от 1 до 3 лет. Мы являемся официальными дилерами, гарантийное обслуживание быстро и без сложностей.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container reveal">
          <div class="cta-banner">
            <h2>Нужна консультация?</h2>
            <p>Позвоните нам или напишите в WhatsApp — поможем подобрать оборудование</p>
            <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener" class="btn btn--white">Написать в WhatsApp</a>
          </div>
        </div>
      </section>
    `;

    createParticles();
    initHeroParallax();
    initFAQ();
  }

  function productCardHTML(p) {
    const badges = [];
    if (p.is_new) badges.push('<span class="badge badge--new">Новинка</span>');
    if (p.has_credit) badges.push('<span class="badge badge--credit">Кредит</span>');
    if (p.has_installment) badges.push('<span class="badge badge--installment">Рассрочка</span>');
    if (p.is_recommended) badges.push('<span class="badge badge--recommended">Хит</span>');

    const descText = (p.detailed_description || p.description || '').trim();
    const descSnippet = descText
      ? `<p class="product-card__desc">${escapeHtml(truncateText(descText, 180))}</p>`
      : '';

    const specs = [];
    if (p.power_kw) specs.push(`${p.power_kw} кВт`);

    const imgSrc = resolveProductImageUrl(p);
    const imageHTML = `<img src="${imgSrc}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="product-card__image-placeholder" style="display:none">${getProductIcon(p.category_slug)}</div>`;

    return `
      <div class="product-card">
        <div class="product-card__badges">${badges.join('')}</div>
        <div class="product-card__image">
          ${imageHTML}
        </div>
        <div class="product-card__body">
          <div class="product-card__brand">${escapeHtml(p.brand_name || '')}</div>
          <div class="product-card__name">
            <a href="#/product/${p.id}">${escapeHtml(p.name)}</a>
          </div>
          ${descSnippet}
          ${specs.length ? `<div class="product-card__specs">${specs.map(s => `<span class="product-card__spec">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
          <div class="product-card__footer">
            <div class="product-card__price">
              <span class="product-card__price-current">${formatPrice(p.price)}</span>
              ${p.old_price ? `<span class="product-card__price-old">${formatPrice(p.old_price)}</span>` : ''}
            </div>
            <button class="product-card__cart-btn" data-add-cart='${JSON.stringify({ id: p.id, slug: p.slug, name: p.name, brand_name: p.brand_name, price: p.price, category_slug: p.category_slug, image_url: resolveProductImageUrl(p) })}' title="В корзину">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async function renderCatalog(params) {
    $header.classList.remove('header--dark');

    const [productsRaw, categories, brands] = await Promise.all([
      fetchJSON(`${API}/products?${params.toString()}`),
      fetchJSON(`${API}/categories`),
      fetchJSON(`${API}/brands`),
    ]);
    const products = omitHiddenProducts(productsRaw);

    const selectedCategory = params.get('category') || '';
    const selectedBrands = (params.get('brand') || '').split(',').filter(Boolean);
    const selectedSort = params.get('sort') || '';

    $app.innerHTML = `
      <div class="catalog section">
        <div class="container">
          <div class="section__header" style="margin-bottom:32px">
            <h2 class="section__title">Каталог оборудования</h2>
            <p class="section__subtitle">Подберите идеальное решение для вашего дома</p>
          </div>

          <button class="btn btn--outline filter-toggle-btn" id="filterToggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Фильтры
          </button>
          <div class="catalog__sidebar-overlay" id="sidebarOverlay"></div>

          <div class="catalog__layout">
            <aside class="catalog__sidebar" id="catalogSidebar">
              <div class="sidebar__title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Фильтры
              </div>

              <div class="filter-group">
                <div class="filter-group__title">Категория</div>
                ${categories.map(c => `
                  <label class="filter-checkbox">
                    <input type="radio" name="category" value="${c.slug}" ${c.slug === selectedCategory ? 'checked' : ''}>
                    ${c.name}
                  </label>
                `).join('')}
                <label class="filter-checkbox">
                  <input type="radio" name="category" value="" ${!selectedCategory ? 'checked' : ''}>
                  Все категории
                </label>
              </div>

              <div class="filter-group">
                <div class="filter-group__title">Бренд</div>
                ${brands.map(b => `
                  <label class="filter-checkbox">
                    <input type="checkbox" name="brand" value="${b.slug}" ${selectedBrands.includes(b.slug) ? 'checked' : ''}>
                    ${b.name}
                  </label>
                `).join('')}
              </div>

              <div class="filter-group">
                <div class="filter-group__title">Цена, ₸</div>
                <div class="filter-price">
                  <input type="number" placeholder="от" id="priceMin" value="${params.get('min_price') || ''}">
                  <span>—</span>
                  <input type="number" placeholder="до" id="priceMax" value="${params.get('max_price') || ''}">
                </div>
              </div>

              <button class="btn btn--primary btn--sm" id="applyFilters" style="width:100%">Применить</button>
            </aside>

            <div class="catalog__main">
              <div class="catalog__header">
                <div class="catalog__count">Найдено: <strong>${products.length}</strong> товаров</div>
                <div class="catalog__sort">
                  <select id="catalogSort">
                    <option value="" ${!selectedSort ? 'selected' : ''}>По умолчанию</option>
                    <option value="price_asc" ${selectedSort === 'price_asc' ? 'selected' : ''}>Сначала дешевле</option>
                    <option value="price_desc" ${selectedSort === 'price_desc' ? 'selected' : ''}>Сначала дороже</option>
                    <option value="name_asc" ${selectedSort === 'name_asc' ? 'selected' : ''}>По названию (А-Я)</option>
                    <option value="new" ${selectedSort === 'new' ? 'selected' : ''}>Новинки</option>
                  </select>
                </div>
              </div>

              ${products.length
                ? `<div class="products-grid">${products.map(p => productCardHTML(p)).join('')}</div>`
                : `<div class="catalog__empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <p>Товары не найдены. Попробуйте изменить фильтры.</p>
                  </div>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    initCatalogFilters(params);
  }

  function initCatalogFilters(currentParams) {
    const applyBtn = document.getElementById('applyFilters');
    const sortSelect = document.getElementById('catalogSort');
    const filterToggle = document.getElementById('filterToggle');
    const sidebar = document.getElementById('catalogSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (filterToggle) {
      filterToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
      });
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }

    function buildParams() {
      const p = new URLSearchParams();
      const cat = document.querySelector('input[name="category"]:checked');
      if (cat && cat.value) p.set('category', cat.value);

      const brandChecked = [...document.querySelectorAll('input[name="brand"]:checked')].map(cb => cb.value);
      if (brandChecked.length) p.set('brand', brandChecked.join(','));

      const minP = document.getElementById('priceMin').value;
      const maxP = document.getElementById('priceMax').value;
      if (minP) p.set('min_price', minP);
      if (maxP) p.set('max_price', maxP);

      const sort = sortSelect.value;
      if (sort) p.set('sort', sort);

      return p;
    }

    applyBtn.addEventListener('click', () => {
      const p = buildParams();
      location.hash = `/catalog?${p.toString()}`;
    });

    sortSelect.addEventListener('change', () => {
      const p = buildParams();
      location.hash = `/catalog?${p.toString()}`;
    });
  }

  function readRecentViewIds() {
    try {
      const raw = JSON.parse(localStorage.getItem(RECENT_VIEWS_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(Number).filter((n) => !Number.isNaN(n)) : [];
    } catch {
      return [];
    }
  }

  function writeRecentViewIds(ids) {
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(ids.slice(0, 14)));
  }

  function pushRecentView(productId) {
    const id = Number(productId);
    if (!id) return;
    const next = [id, ...readRecentViewIds().filter((x) => x !== id)];
    writeRecentViewIds(next);
  }

  async function fetchProductsByIds(ids) {
    const unique = [...new Set(ids)].slice(0, 10);
    const rows = await Promise.all(
      unique.map((pid) => fetch(`${API}/products/${pid}`).then((r) => (r.ok ? r.json() : null)))
    );
    return omitHiddenProducts(rows.filter(Boolean).filter((x) => !x.error));
  }

  function bindProductQtyControls() {
    const wrap = document.querySelector('.pd-buy');
    if (!wrap) return;
    const input = wrap.querySelector('.pd-buy-qty');
    const minBtn = wrap.querySelector('.pd-qty-min');
    const maxBtn = wrap.querySelector('.pd-qty-plus');
    const clamp = () => {
      let v = parseInt(input.value, 10);
      if (Number.isNaN(v) || v < 1) v = 1;
      if (v > 99) v = 99;
      input.value = String(v);
    };
    minBtn &&
      minBtn.addEventListener('click', () => {
        input.value = String(Math.max(1, (parseInt(input.value, 10) || 1) - 1));
        clamp();
      });
    maxBtn &&
      maxBtn.addEventListener('click', () => {
        input.value = String(Math.min(99, (parseInt(input.value, 10) || 1) + 1));
        clamp();
      });
    input.addEventListener('change', clamp);
    input.addEventListener('input', () => {
      const v = parseInt(input.value, 10);
      if (!Number.isNaN(v) && (v < 1 || v > 99)) clamp();
    });
  }

  async function renderProduct(id) {
    $header.classList.remove('header--dark');
    const p = await fetchJSON(`${API}/products/${id}`);

    if (!p || p.error || HIDDEN_PRODUCT_SLUGS.has(p.slug)) {
      $app.innerHTML = '<div class="container" style="padding:200px 0;text-align:center"><h2>Товар не найден</h2><a href="#/catalog" class="btn btn--primary" style="margin-top:20px">Вернуться в каталог</a></div>';
      return;
    }

    const recentBefore = readRecentViewIds().filter((rid) => rid !== p.id);
    pushRecentView(p.id);

    const similarRaw = await fetchJSON(`${API}/products?category=${encodeURIComponent(p.category_slug || '')}`);
    const similar = omitHiddenProducts(similarRaw || [])
      .filter((x) => x.id !== p.id)
      .slice(0, 8);

    const recentOthers = await fetchProductsByIds(recentBefore.slice(0, 8));

    const shortDesc = (p.description || '').trim();
    const longDesc = (p.detailed_description || '').trim();
    const descLead = shortDesc
      ? `<p class="pd-desc__lead">${escapeHtml(shortDesc)}</p>`
      : '';
    const descBody = longDesc
      ? `<div class="pd-desc__body">${escapeHtml(longDesc)}</div>`
      : (!shortDesc ? '<p class="pd-desc__muted">Подробное описание уточняйте у менеджера.</p>' : '');

    const stockLabel = p.in_stock ? '' : 'Под заказ';
    const stockClass = p.in_stock ? 'pd-meta__value--ok' : 'pd-meta__value--no';
    const imgSrc = resolveProductImageUrl(p);
    const modelCode = productModelCode(p);
    const waText = `Здравствуйте! Интересует: ${p.name} (модель ${modelCode}). Цена: ${formatPrice(p.price)}`;

    const techRows = productTechnicalSpecsRowsHTML(p);
    const specsBlock =
      techRows.trim().length > 0
        ? `<table class="specs-table pd-specs-table pd-specs-table--striped"><tbody>${techRows}</tbody></table>`
        : '<p class="pd-desc__muted">Технические характеристики уточняйте у менеджера.</p>';

    const similarBlock =
      similar.length > 0
        ? `<section class="pd-section pd-section--related"><h2 class="pd-section__title">Похожие товары</h2><div class="products-grid products-grid--related">${similar.map((x) => productCardHTML(x)).join('')}</div></section>`
        : '';

    const recentBlock =
      recentOthers.length > 0
        ? `<section class="pd-section pd-section--recent"><h2 class="pd-section__title">Недавно просмотренные</h2><div class="products-grid products-grid--related">${recentOthers.map((x) => productCardHTML(x)).join('')}</div></section>`
        : '';

    const icShield =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    const icCard =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>';
    const icTruck =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';

    $app.innerHTML = `
      <div class="product-detail product-detail--store product-detail--sbs container">
        <nav class="pd-breadcrumb" aria-label="Навигация">
          <a href="#/">Главная</a> <span class="pd-breadcrumb__sep">/</span>
          <a href="#/catalog">Каталог</a> <span class="pd-breadcrumb__sep">/</span>
          <a href="#/catalog?category=${encodeURIComponent(p.category_slug || '')}">${escapeHtml(p.category_name || '')}</a>
          <span class="pd-breadcrumb__sep">/</span>
          <span class="pd-breadcrumb__current">${escapeHtml(p.name)}</span>
        </nav>

        <div class="pd-hero-card">
        <div class="pd-top">
          <div class="pd-gallery">
            <div class="pd-gallery__inner">
              <img class="pd-gallery__img" src="${imgSrc}" alt="${escapeHtml(p.name)}" width="640" height="640"
                onerror="this.style.display='none';this.nextElementSibling.classList.add('pd-gallery__fallback--show')">
              <div class="pd-gallery__fallback" aria-hidden="true">${getProductIcon(p.category_slug)}</div>
            </div>
          </div>

          <div class="pd-buy">
            <h1 class="pd-buy__title">${escapeHtml(p.name)}</h1>

            <div class="pd-meta pd-meta--lines">
              <div class="pd-meta__row"><span class="pd-meta__key">Модель:</span> <span class="pd-meta__value">${escapeHtml(modelCode)}</span></div>
              <div class="pd-meta__row"><span class="pd-meta__key">Бренд:</span> <span class="pd-meta__value">${escapeHtml(p.brand_name || '—')}</span></div>
              <div class="pd-meta__row">
                <span class="pd-meta__key">Наличие:</span>
                <span class="pd-meta__value ${stockClass}"${p.in_stock ? ' title="В наличии"' : ''}>${p.in_stock ? '<span class="pd-meta__tick" aria-label="В наличии">✓</span>' : escapeHtml(stockLabel)}</span>
              </div>
            </div>

            <div class="pd-price-row">
              <span class="pd-price">${formatPrice(p.price)}</span>
              ${p.old_price ? `<span class="pd-price-old">${formatPrice(p.old_price)}</span>` : ''}
            </div>
            <p class="pd-price-note">Цена указана за 1 шт. товара.</p>

            <div class="pd-qty-actions">
              <div class="pd-qty">
                <button type="button" class="pd-qty-btn pd-qty-min" aria-label="Меньше">−</button>
                <input type="number" class="pd-buy-qty" min="1" max="99" value="1" inputmode="numeric" aria-label="Количество">
                <button type="button" class="pd-qty-btn pd-qty-plus" aria-label="Больше">+</button>
              </div>
              <div class="pd-actions">
                <button type="button" class="btn pd-btn pd-btn--cart pd-actions__cart" data-add-cart='${JSON.stringify({ id: p.id, slug: p.slug, name: p.name, brand_name: p.brand_name, price: p.price, category_slug: p.category_slug, image_url: resolveProductImageUrl(p) })}'>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  В корзину
                </button>
                <a class="btn pd-btn pd-btn--wa pd-actions__wa" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener">
                  Купить по WhatsApp
                </a>
              </div>
            </div>

            <div class="pd-trust-plain">
              <p class="pd-trust-plain__line"><span class="pd-trust-plain__ico">${icShield}</span><span> Срок гарантии <strong>12 месяцев</strong></span></p>
              <p class="pd-trust-plain__line"><span class="pd-trust-plain__ico">${icCard}</span><span> Оплата <strong>Kaspi QR, VISA / Mastercard</strong></span></p>
              <p class="pd-trust-plain__line"><span class="pd-trust-plain__ico">${icTruck}</span><span> Доставка <strong>по всему Казахстану</strong></span></p>
            </div>
          </div>
        </div>
        </div>

        <section class="pd-section">
          <h2 class="pd-section__title">Характеристики</h2>
          ${specsBlock}
        </section>

        <section class="pd-section pd-section--desc">
          <h2 class="pd-section__title">Описание</h2>
          <div class="pd-desc">
            ${descLead}
            ${descBody}
          </div>
        </section>

        ${similarBlock}
        ${recentBlock}
      </div>
    `;

    bindProductQtyControls();
  }

  function renderCart() {
    $header.classList.remove('header--dark');

    if (!cart.length) {
      $app.innerHTML = `
        <div class="cart-page container">
          <div class="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <h2>Корзина пуста</h2>
            <p>Добавьте товары из каталога</p>
            <a href="#/catalog" class="btn btn--primary">Перейти в каталог</a>
          </div>
        </div>
      `;
      return;
    }

    const total = getCartTotal();

    $app.innerHTML = `
      <div class="cart-page container">
        <h1>Корзина</h1>
        <div class="cart-items">
          ${cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
              <div class="cart-item__image">${cartItemThumbInnerHTML(item)}</div>
              <div class="cart-item__info">
                <div class="cart-item__name"><a href="#/product/${item.id}">${item.name}</a></div>
                <div class="cart-item__brand">${item.brand_name || ''}</div>
              </div>
              <div class="cart-item__qty">
                <button class="cart-qty-btn" data-id="${item.id}" data-delta="-1">−</button>
                <span>${item.qty}</span>
                <button class="cart-qty-btn" data-id="${item.id}" data-delta="1">+</button>
              </div>
              <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
              <button class="cart-item__remove cart-remove-btn" data-id="${item.id}" title="Удалить">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
        <div class="cart-summary">
          <div class="cart-summary__row"><span>Товары (${cart.reduce((s, i) => s + i.qty, 0)} шт.)</span><span>${formatPrice(total)}</span></div>
          <div class="cart-summary__row"><span>Доставка</span><span style="color:#059669">Бесплатно</span></div>
          <div class="cart-summary__row cart-summary__row--total"><span>Итого</span><span>${formatPrice(total)}</span></div>
          <a href="#/checkout" class="btn btn--primary">Оформить заказ</a>
        </div>
      </div>
    `;

    document.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        changeQty(Number(btn.dataset.id), Number(btn.dataset.delta));
        renderCart();
      });
    });

    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(Number(btn.dataset.id));
        renderCart();
      });
    });
  }

  function renderCheckout() {
    $header.classList.remove('header--dark');

    if (!cart.length) {
      location.hash = '/cart';
      return;
    }

    const total = getCartTotal();

    $app.innerHTML = `
      <div class="checkout container">
        <h1>Оформление заказа</h1>
        <div class="checkout__layout">
          <form class="checkout__form" id="checkoutForm">
            <div class="form-group">
              <label>Имя *</label>
              <input type="text" name="name" required placeholder="Ваше имя">
            </div>
            <div class="form-group">
              <label>Телефон *</label>
              <input type="tel" name="phone" required placeholder="+7 (___) ___-__-__">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="example@mail.com">
            </div>
            <div class="form-group">
              <label>Город</label>
              <input type="text" name="city" value="${city}" placeholder="Ваш город">
            </div>
            <div class="form-group">
              <label>Адрес доставки</label>
              <textarea name="address" placeholder="Улица, дом, квартира"></textarea>
            </div>
            <button type="submit" class="btn btn--primary" style="align-self:flex-start">Подтвердить заказ</button>
          </form>

          <div class="checkout__summary">
            <div class="cart-summary">
              <h3 style="margin-bottom:20px;font-size:1.1rem">Ваш заказ</h3>
              ${cart.map(item => `
                <div class="cart-summary__row" style="font-size:0.85rem">
                  <span>${item.name} × ${item.qty}</span>
                  <span>${formatPrice(item.price * item.qty)}</span>
                </div>
              `).join('')}
              <div class="cart-summary__row"><span>Доставка</span><span style="color:#059669">Бесплатно</span></div>
              <div class="cart-summary__row cart-summary__row--total"><span>Итого</span><span>${formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {
        customer_name: fd.get('name'),
        customer_phone: fd.get('phone'),
        customer_email: fd.get('email'),
        customer_city: fd.get('city'),
        customer_address: fd.get('address'),
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
      };

      try {
        const res = await fetch(`${API}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (data.success) {
          cart = [];
          saveCart();
          $app.innerHTML = `
            <div class="checkout container">
              <div class="order-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2>Заказ №${data.order_id} оформлен!</h2>
                <p>Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.</p>
                <a href="#/" class="btn btn--primary">На главную</a>
              </div>
            </div>
          `;
        }
      } catch (err) {
        alert('Ошибка при оформлении заказа. Попробуйте позже или напишите в WhatsApp.');
      }
    });
  }

  function renderAbout() {
    $header.classList.add('header--dark');

    $app.innerHTML = `
      <div class="about-hero" style="background:linear-gradient(135deg, #1A1A1A 0%, #2d1a1a 50%, #3d2424 100%);padding:80px 0;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;right:0;width:400px;height:400px;background:rgba(220,38,38,0.1);border-radius:50%;transform:translate(100px,-100px)"></div>
        <div class="container" style="position:relative;z-index:2">
          <h1 style="color:white;font-size:3.5rem;margin-bottom:20px"><span style="color:#DC2626">QAZ</span>HEAT</h1>
          <p style="color:#fee2e2;font-size:1.2rem;max-width:600px">Официальный представитель премиум-оборудования в Центральном Казахстане. Надёжные решения для вашего комфорта и производительности.</p>
          <div class="about-stats reveal" style="display:grid;grid-template-columns:repeat(4,1fr);gap:30px;margin-top:50px">
            <div style="text-align:center">
              <div style="font-size:2.5rem;font-weight:700;color:#FF6B6B;margin-bottom:8px">5+</div>
              <div style="color:#cbd5e1;font-size:0.95rem">Лет успешной работы</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:2.5rem;font-weight:700;color:#FF6B6B;margin-bottom:8px">2000+</div>
              <div style="color:#cbd5e1;font-size:0.95rem">Благодарных клиентов</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:2.5rem;font-weight:700;color:#FF6B6B;margin-bottom:8px">50+</div>
              <div style="color:#cbd5e1;font-size:0.95rem">Моделей в каталоге</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:2.5rem;font-weight:700;color:#FF6B6B;margin-bottom:8px">18</div>
              <div style="color:#cbd5e1;font-size:0.95rem">Городов доставки</div>
            </div>
          </div>
        </div>
      </div>

      <section class="section" style="padding:80px 0;background:#1A1A1A">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center" class="reveal">
            <div>
              <div style="font-size:0.85rem;color:#DC2626;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:15px">Кто мы</div>
              <h2 style="font-size:2.2rem;line-height:1.3;margin-bottom:25px;color:#ffffff"><span style="color:#FF6B6B">QAZHEAT</span> — ваш надёжный партнер в инженерии</h2>
              <p style="font-size:1rem;line-height:1.8;color:#d1d5db;margin-bottom:18px">
                Мы более пяти лет работаем на рынке Казахстана, специализируясь на поставке высокотехнологичного оборудования для систем водоснабжения, отопления и энергоснабжения. Наша команда состоит из опытных инженеров и менеджеров, которые глубоко разбираются в каждом типе оборудования.
              </p>
              <p style="font-size:1rem;line-height:1.8;color:#d1d5db;margin-bottom:18px">
                <strong>Наша специализация:</strong> мы помогаем частным домовладельцам, фермерам, предпринимателям и коммунальным предприятиям выбрать оптимальное решение под их конкретные нужды. Каждый проект уникален, и мы это понимаем.
              </p>
              <p style="font-size:1rem;line-height:1.8;color:#d1d5db">
                Мы не просто продаём оборудование — мы строим долгосрочные отношения с клиентами, обеспечивая их полной технической поддержкой до и после покупки.
              </p>
            </div>
            <div style="position:relative;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(15,23,42,0.1)">
              <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80" alt="Инженерное оборудование" style="width:100%;height:100%;object-fit:cover;display:block">
              <div style="position:absolute;top:20px;right:20px;background:#DC2626;color:white;padding:12px 20px;border-radius:8px;font-weight:600">Качество №1</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--gray" style="background:#2d2d2d;padding:80px 0">
        <div class="container">
          <div style="text-align:center;margin-bottom:60px" class="reveal">
            <div style="font-size:0.85rem;color:#DC2626;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:15px">Почему мы</div>
            <h2 style="font-size:2.2rem;color:#ffffff;margin-bottom:15px">Шесть причин выбрать QAZHEAT</h2>
            <p style="font-size:1.05rem;color:#d1d5db;max-width:600px;margin:0 auto">Мы не конкуренты, мы партнёры. Вот что нас отличает на рынке</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px" class="reveal">
            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">🏅</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Официальные дилеры</h3>
              <p style="color:#d1d5db;line-height:1.7">Мы имеем прямые партнёрские отношения с GRANDFAR, AQUOR, KUMO и TRIANGLE. Каждая единица оборудования поставляется с оригинальными сертификатами и гарантией производителя.</p>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">🎯</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Точный подбор</h3>
              <p style="color:#d1d5db;line-height:1.7">Наши инженеры проанализируют давление в сети, глубину скважины, расход воды и другие параметры, чтобы подобрать идеальное решение именно для вас.</p>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">📦</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Быстрая логистика</h3>
              <p style="color:#d1d5db;line-height:1.7">Доставка по Караганде — бесплатная. По всему Казахстану — через проверенные компании за 1-5 дней. Отслеживаем каждый заказ от склада до дверей.</p>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">💳</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Гибкая оплата</h3>
              <p style="color:#d1d5db;line-height:1.7">Рассрочка до 24 месяцев, кредит через банки-партнёры. Приём платежей через Kaspi QR, VISA, Mastercard. Никаких скрытых комиссий.</p>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">🔧</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Монтаж и пуск</h3>
              <p style="color:#d1d5db;line-height:1.7">Помощь с установкой оборудования, первым пуском и настройкой. Нашу команду вы можете вызвать в любой момент для консультации или решения проблемы.</p>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626;transition:transform 0.3s,box-shadow 0.3s" onmouseover="this.style.transform='translateY(-8px)';this.style.boxShadow='0 12px 24px rgba(220,38,38,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.3)'">
              <div style="font-size:2.5rem;margin-bottom:15px">💬</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Поддержка 24/7</h3>
              <p style="color:#d1d5db;line-height:1.7">Телефон, WhatsApp, email. Мы отвечаем быстро. Если проблема — помогаем её решить. Если вопрос — даём полный ответ. Вы в центре внимания.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding:80px 0;background:#1A1A1A">
        <div class="container">
          <div style="text-align:center;margin-bottom:60px" class="reveal">
            <h2 style="font-size:2.2rem;color:#ffffff;margin-bottom:15px">Полный спектр оборудования</h2>
            <p style="font-size:1.05rem;color:#d1d5db">Какую бы задачу вы ни ставили, у нас есть готовое решение</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px" class="reveal">
            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">💧</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Насосные системы</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Погружные, центробежные, скважинные, дренажные насосы. От компактных бытовых до промышленных агрегатов мощностью до 22 кВт.</p>
            </div>

            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">⚡</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Станции водоснабжения</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Автоматические системы с гидроаккумуляторами. Стабильное давление в доме, никаких скачков. От 0.37 до 1.1 кВт на любой бюджет.</p>
            </div>

            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">🔥</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Генераторы и компрессоры</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Бензиновые генераторы 2.5–9.5 кВт. Поршневые компрессоры для инструмента. Резервное питание и энергия производства.</p>
            </div>

            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">🛢️</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Баки и мембраны</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Мембранные баки от 2 до 100 литров. Стабилизируют давление, снижают нагрузку на насос, увеличивают общий ресурс системы.</p>
            </div>

            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">🔧</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Комплектующие и аксессуары</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Обратные клапаны, фланцы, переходники, фильтры. Оригинальные запчасти для всех популярных моделей оборудования.</p>
            </div>

            <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:32px;border-radius:12px;position:relative;overflow:hidden">
              <div style="font-size:3rem;margin-bottom:15px;opacity:0.8">🏠</div>
              <h4 style="font-size:1.15rem;margin-bottom:10px;font-weight:700">Газовые обогреватели</h4>
              <p style="font-size:0.95rem;line-height:1.6;opacity:0.95">Газовые и электрические обогреватели для дома и коммерческих объектов. Экономичное отопление для любого климата.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--gray" style="background:#2d2d2d;padding:80px 0">
        <div class="container">
          <div style="text-align:center;margin-bottom:60px" class="reveal">
            <h2 style="font-size:2.2rem;color:white;margin-bottom:15px">Мировые бренды, локальная поддержка</h2>
            <p style="font-size:1.05rem;color:#d1d5db">Мы работаем с признанными мировыми лидерами, но остаёмся доступны для вас в Казахстане</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px" class="reveal">
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(220,38,38,0.3);padding:24px;border-radius:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:700;color:#FF6B6B">GRANDFAR</div>
              <p style="color:#d1d5db;font-size:0.9rem;margin-top:10px">Иран. Погружные и центробежные насосы. Надёжность проверена годами.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(220,38,38,0.3);padding:24px;border-radius:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:700;color:#FF6B6B">AQUOR</div>
              <p style="color:#d1d5db;font-size:0.9rem;margin-top:10px">Казахстан. Отечественный производитель высокого качества.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(220,38,38,0.3);padding:24px;border-radius:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:700;color:#FF6B6B">KUMO</div>
              <p style="color:#d1d5db;font-size:0.9rem;margin-top:10px">Китай. Генераторы и компрессоры мирового уровня.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(220,38,38,0.3);padding:24px;border-radius:12px;text-align:center">
              <div style="font-size:1.3rem;font-weight:700;color:#FF6B6B">TRIANGLE</div>
              <p style="color:#d1d5db;font-size:0.9rem;margin-top:10px">Украина. Обогреватели и климатическое оборудование.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding:80px 0;background:#1A1A1A">
        <div class="container reveal">
          <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:60px;border-radius:16px;text-align:center">
            <h2 style="font-size:2rem;margin-bottom:15px">Начните сегодня</h2>
            <p style="font-size:1.1rem;margin-bottom:30px;opacity:0.95">Нужна консультация? Давайте разберём вашу задачу вместе</p>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
              <a href="tel:+77088022363" class="btn btn--white" style="color:#DC2626;border:none">☎️ +7 708 802 2363</a>
              <a href="https://wa.me/77088022363" target="_blank" rel="noopener" class="btn btn--white" style="color:#DC2626;border:none">💬 WhatsApp</a>
              <a href="#/catalog" class="btn" style="background:white;color:#DC2626;border:none">📦 В каталог</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderContacts() {
    $header.classList.add('header--dark');

    $app.innerHTML = `
      <div class="about-hero" style="background:linear-gradient(135deg, #1A1A1A 0%, #2d1a1a 50%, #3d2424 100%);padding:80px 0;position:relative;overflow:hidden">
        <div style="position:absolute;top:0;right:0;width:400px;height:400px;background:rgba(220,38,38,0.1);border-radius:50%;transform:translate(100px,-100px)"></div>
        <div class="container" style="position:relative;z-index:2">
          <h1 style="color:white;font-size:3.5rem;margin-bottom:20px">Контакты</h1>
          <p style="color:#fee2e2;font-size:1.2rem;max-width:600px">Мы всегда рады помочь вам с выбором оборудования и ответить на любые вопросы. Свяжитесь с нами удобным способом.</p>
        </div>
      </div>

      <section class="section" style="padding:80px 0;background:#1A1A1A">
        <div class="container">
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:32px;margin-bottom:60px" class="reveal">
            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626">
              <div style="font-size:2.5rem;margin-bottom:15px">📞</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Телефон</h3>
              <p style="color:#d1d5db;line-height:1.7;margin-bottom:15px">Звоните с 09:00 до 18:00, пн-пт. Мы ответим быстро.</p>
              <a href="tel:${PHONE_TEL}" style="color:#FF6B6B;text-decoration:none;font-weight:600;font-size:1.15rem">${PHONE}</a>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626">
              <div style="font-size:2.5rem;margin-bottom:15px">💬</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">WhatsApp</h3>
              <p style="color:#d1d5db;line-height:1.7;margin-bottom:15px">Пишите в любой момент. Ответим в течение часа.</p>
              <a href="https://wa.me/${WHATSAPP}" target="_blank" rel="noopener" style="color:#FF6B6B;text-decoration:none;font-weight:600;font-size:1.15rem">Написать в WhatsApp</a>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626">
              <div style="font-size:2.5rem;margin-bottom:15px">📧</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Email</h3>
              <p style="color:#d1d5db;line-height:1.7;margin-bottom:15px">Отправьте письмо — обычно отвечаем за 24 часа.</p>
              <a href="mailto:info@qazheat.kz" style="color:#FF6B6B;text-decoration:none;font-weight:600;font-size:1.15rem">info@qazheat.kz</a>
            </div>

            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626">
              <div style="font-size:2.5rem;margin-bottom:15px">📍</div>
              <h3 style="font-size:1.2rem;color:#ffffff;margin-bottom:12px">Офис</h3>
              <p style="color:#d1d5db;line-height:1.7">г. Караганда,<br>ул. Гоголя, 2/1</p>
            </div>
          </div>

          <div class="reveal" style="border-radius:12px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.3)">
<iframe
    src="https://yandex.ru/map-widget/v1/?ll=73.093166,49.826639&z=17&pt=73.093166,49.826639,pm2rdm"
    width="100%"
    height="450"
    frameborder="0"
    allowfullscreen>
</iframe>
          </div>
        </div>
      </section>

      <section class="section" style="padding:80px 0;background:#2d2d2d">
        <div class="container">
          <div style="text-align:center;margin-bottom:60px" class="reveal">
            <div style="font-size:0.85rem;color:#DC2626;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:15px">Режим работы</div>
            <h2 style="font-size:2.2rem;color:#ffffff;margin-bottom:15px">График работы</h2>
          </div>

          <div class="reveal" style="max-width:480px;margin:0 auto">
            <div style="background:#3d3d3d;padding:32px;border-radius:12px;border-left:4px solid #DC2626">
              <div style="padding-bottom:16px;margin-bottom:16px;border-bottom:1px solid #555">
                <div style="color:#999;font-weight:500;margin-bottom:6px">Пн — Пт</div>
                <div style="color:#FF6B6B;font-weight:700;font-size:1.1rem">09:00 — 18:00</div>
              </div>
              <div style="color:#999;font-weight:500;margin-bottom:6px">Сб — Вс</div>
              <div style="color:#999;font-weight:600;font-size:1rem">Выходной день</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="padding:80px 0;background:#1A1A1A">
        <div class="container reveal">
          <div style="background:linear-gradient(135deg, #DC2626 0%, #991B1B 100%);color:white;padding:60px;border-radius:16px;text-align:center">
            <h2 style="font-size:2rem;margin-bottom:15px">Готовы помочь</h2>
            <p style="font-size:1.1rem;margin-bottom:30px;opacity:0.95">Задавайте вопросы, мы ответим быстро и развёрнуто</p>
            <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
              <a href="tel:+77088022363" class="btn btn--white" style="color:#DC2626;border:none;font-weight:600">☎️ Позвонить</a>
              <a href="https://wa.me/77088022363" target="_blank" rel="noopener" class="btn btn--white" style="color:#DC2626;border:none;font-weight:600">💬 WhatsApp</a>
              <a href="#/catalog" class="btn btn--ghost">📦 Каталог</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ---- Hero Particles ----
  function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        bottom: ${Math.random() * 30}%;
        animation-duration: ${Math.random() * 6 + 4}s;
        animation-delay: ${Math.random() * 5}s;
        background: ${Math.random() > 0.5 ? '#DC2626' : '#B91C1C'};
        opacity: ${Math.random() * 0.4 + 0.1};
      `;
      container.appendChild(p);
    }
  }

  // ---- Hero Parallax ----
  function initHeroParallax() {
    const heroContent = document.getElementById('heroContent');
    if (!heroContent) return;

    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `translate(${x * 15}px, ${y * 10}px)`;
    });
  }

  // ---- FAQ ----
  function initFAQ() {
    document.querySelectorAll('.faq-item__question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ---- Scroll Reveal ----
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // ---- Header Scroll ----
  function initHeaderScroll() {
    function syncHeaderScroll() {
      const scrollY = window.scrollY;
      const { path } = getRoute();
      const darkOverHero =
        path === '/' ||
        path === '/home' ||
        path === '/about' ||
        path === '/contacts';

      if (scrollY > 50) {
        $header.classList.add('header--solid');
        $header.classList.remove('header--dark');
      } else {
        $header.classList.remove('header--solid');
        if (darkOverHero) {
          $header.classList.add('header--dark');
        } else {
          $header.classList.remove('header--dark');
        }
      }
    }

    window.addEventListener('scroll', syncHeaderScroll, { passive: true });
    syncHeaderScroll();
  }

  // ---- City Modal ----
  function initCityModal() {
    $headerCityName.textContent = city || 'Караганда';

    document.getElementById('cityConfirm').addEventListener('click', () => {
      city = document.getElementById('cityName').textContent;
      localStorage.setItem('qh_city', city);
      $headerCityName.textContent = city;
      $cityModal.classList.remove('show');
    });

    document.getElementById('cityClose').addEventListener('click', () => {
      $cityModal.classList.remove('show');
    });

    document.getElementById('cityChange').addEventListener('click', () => {
      document.getElementById('cityList').classList.remove('hidden');
    });

    document.getElementById('citySearch').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.city-list__items button').forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    document.querySelectorAll('.city-list__items button').forEach(btn => {
      btn.addEventListener('click', () => {
        city = btn.dataset.city;
        localStorage.setItem('qh_city', city);
        $headerCityName.textContent = city;
        $cityModal.classList.remove('show');
      });
    });

    document.getElementById('headerCity').addEventListener('click', () => {
      $cityModal.classList.add('show');
      document.getElementById('cityList').classList.remove('hidden');
    });

    if (!city) {
      setTimeout(() => {
        $cityModal.classList.add('show');
      }, 800);
    }
  }

  // ---- FAB ----
  function initFAB() {
    const trigger = document.getElementById('fabTrigger');
    trigger.addEventListener('click', () => {
      $fab.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!$fab.contains(e.target)) {
        $fab.classList.remove('open');
      }
    });
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    $burger.addEventListener('click', () => {
      const opening = !$mobileMenu.classList.contains('open');
      $burger.classList.toggle('open');
      $mobileMenu.classList.toggle('open');
      document.body.style.overflow = opening ? 'hidden' : '';
      if (opening) {
        $header.classList.add('header--menu-open');
      } else {
        $header.classList.remove('header--menu-open');
      }
    });

    $mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        $burger.classList.remove('open');
        $mobileMenu.classList.remove('open');
        $header.classList.remove('header--menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Global Click Delegation ----
  function initGlobalClicks() {
    document.addEventListener('click', (e) => {
      const addCartBtn = e.target.closest('[data-add-cart]');
      if (addCartBtn) {
        e.preventDefault();
        const product = JSON.parse(addCartBtn.dataset.addCart);
        const buy = addCartBtn.closest('.pd-buy');
        const qtyInput = buy && buy.querySelector('.pd-buy-qty');
        const qty = qtyInput ? Number(qtyInput.value) : 1;
        addToCart(product, qty);
      }
    });
  }

  // ---- Init ----
  function init() {
    updateCartBadge();
    initHeaderScroll();
    initCityModal();
    initFAB();
    initMobileMenu();
    initGlobalClicks();

    window.addEventListener('hashchange', router);
    router();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
