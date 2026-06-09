const express = require('express');
const path = require('path');
const { initDB, query, queryOne, run, DISCONTINUED_PRODUCT_SLUGS } = require('./database');

const app = express();
const PORT = 3000;
const dbReady = initDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(async (_req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error('Database init failed:', err);
    res.status(500).json({ error: 'Database init failed' });
  }
});

app.get('/api/products', (req, res) => {
  const { category, brand, min_price, max_price, fuel_type, min_power, max_power, in_stock, sort, search } = req.query;

  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           b.name as brand_name, b.slug as brand_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (DISCONTINUED_PRODUCT_SLUGS.length) {
    const ph = DISCONTINUED_PRODUCT_SLUGS.map(() => '?').join(',');
    sql += ` AND p.slug NOT IN (${ph})`;
    params.push(...DISCONTINUED_PRODUCT_SLUGS);
  }

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (brand) {
    const brands = brand.split(',');
    sql += ` AND b.slug IN (${brands.map(() => '?').join(',')})`;
    params.push(...brands);
  }
  if (min_price) {
    sql += ' AND p.price >= ?';
    params.push(Number(min_price));
  }
  if (max_price) {
    sql += ' AND p.price <= ?';
    params.push(Number(max_price));
  }
  if (fuel_type) {
    sql += ' AND p.fuel_type = ?';
    params.push(fuel_type);
  }
  if (min_power) {
    sql += ' AND p.power_kw >= ?';
    params.push(Number(min_power));
  }
  if (max_power) {
    sql += ' AND p.power_kw <= ?';
    params.push(Number(max_power));
  }
  if (in_stock === '1') {
    sql += ' AND p.in_stock = 1';
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  switch (sort) {
    case 'price_asc':  sql += ' ORDER BY p.price ASC'; break;
    case 'price_desc': sql += ' ORDER BY p.price DESC'; break;
    case 'name_asc':   sql += ' ORDER BY p.name ASC'; break;
    case 'name_desc':  sql += ' ORDER BY p.name DESC'; break;
    case 'new':        sql += ' ORDER BY p.is_new DESC, p.created_at DESC'; break;
    default:           sql += ' ORDER BY p.is_recommended DESC, p.id ASC';
  }

  const rows = query(sql, params);
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const row = queryOne(`
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           b.name as brand_name, b.slug as brand_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = ?
  `, [Number(req.params.id)]);

  if (!row || DISCONTINUED_PRODUCT_SLUGS.includes(row.slug)) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(row);
});

app.get('/api/categories', (_req, res) => {
  const rows = query('SELECT * FROM categories ORDER BY name');
  res.json(rows);
});

app.get('/api/brands', (_req, res) => {
  const rows = query('SELECT * FROM brands ORDER BY name');
  res.json(rows);
});

app.get('/api/stats', (_req, res) => {
  const productCount = queryOne('SELECT COUNT(*) as cnt FROM products').cnt;
  const brandCount = queryOne('SELECT COUNT(*) as cnt FROM brands').cnt;
  const categoryCount = queryOne('SELECT COUNT(*) as cnt FROM categories').cnt;
  res.json({ products: productCount, brands: brandCount, categories: categoryCount });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, customer_email, customer_city, customer_address, items } = req.body;

  if (!customer_name || !customer_phone || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let total = 0;
  items.forEach(item => {
    const product = queryOne('SELECT price FROM products WHERE id = ?', [item.product_id]);
    if (product) total += product.price * item.quantity;
  });

  const result = run(
    `INSERT INTO orders (customer_name, customer_phone, customer_email, customer_city, customer_address, total_price)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [customer_name, customer_phone, customer_email || '', customer_city || '', customer_address || '', total]
  );

  const orderId = result.lastInsertRowid;

  items.forEach(item => {
    const product = queryOne('SELECT price FROM products WHERE id = ?', [item.product_id]);
    if (product) {
      run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, product.price]);
    }
  });

  res.json({ success: true, order_id: orderId, total_price: total });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await dbReady;
  app.listen(PORT, () => {
    console.log(`QAZHEAT server running at http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
