const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'qazheat.db');
const PRODUCT_COPY_BACKFILL = require('./productCopyBackfill');
const IS_VERCEL = !!process.env.VERCEL;

/** Снятые с витрины товары (slug) — удаление из БД при старте и фильтр в API. */
const DISCONTINUED_PRODUCT_SLUGS = ['aq50g2-aquor', 'aq80g2-aquor'];

let db = null;

function saveDB() {
  if (IS_VERCEL) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      detailed_description TEXT,
      brand_id INTEGER,
      category_id INTEGER,
      price INTEGER NOT NULL,
      old_price INTEGER,
      image_url TEXT,
      power_kw REAL,
      area_sqm INTEGER,
      efficiency REAL,
      fuel_type TEXT,
      has_credit INTEGER DEFAULT 0,
      has_installment INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      is_recommended INTEGER DEFAULT 0,
      in_stock INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      customer_city TEXT,
      customer_address TEXT,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  seed();
  backfillProductImages();
  backfillGrandfarQdxSubmersibleImages();
  backfillGrandfarCht4CentrifugalImages();
  backfillGrandfarSem18WellPumpImages();
  backfillGrandfarDrainagePumpsImages();
  backfillGrandfarWqdSewagePumpImage();
  backfillGrandfarQbVortexPumpImages();
  backfillGrandfarX15BoosterPumpImage();
  backfillAquorAhfmCentrifugalImages();
  backfillAquorAutojetStationImages();
  backfillAquorQdxSubmersibleImages();
  backfillAquorQb70VortexPumpImage();
  backfillAquorQjdyWellPumpImage();
  backfillTriangleTr80020HeaterImage();
  backfillTriangleTr80030HeaterImage();
  backfillTriangleTr83000HeaterImage();
  backfillTriangleTr83009HeaterImage();
  backfillTriangleTr911200StationImage();
  backfillKumoKgfe3600esImage();
  backfillKumoKgfe7500esImage();
  backfillKumoKgfe12000esImage();
  backfillKumoQz2050lImage();
  backfillKumoQz2024lImage();
  backfillKumoQv2550Image();
  backfillKumoKwp50sImage();
  backfillKumoKwp80sImage();
  backfillGrandfarPwStationImages();
  backfillGrandfarPw750eStationImage();
  backfillGrandfarAwzb125StationImage();
  backfillGrandfarAutogjsm800StationImage();
  backfillGrandfarGfvGeneratorImages();
  backfillGrandfarGfbmCompressorImages();
  backfillGrandfarGf2065CompressorImage();
  backfillGrandfarPressureTankImages();
  backfillGrandfarGfMotopumpImages();
  removeDiscontinuedProducts();
  backfillRichProductCopy();
  saveDB();

  return db;
}

function backfillProductImages() {
  if (!db) return;
  try {
    db.run(`
      UPDATE products
      SET image_url = '/images/catalog/' || slug || '.jpg'
      WHERE image_url IS NULL OR length(trim(coalesce(image_url, ''))) = 0
    `);
  } catch (e) {
    console.warn('backfillProductImages:', e.message);
  }
}

/** Одно фото для линейки погружных GRANDFAR QDX (каталог, карточка, корзина по image_url) */
const GRANDFAR_QDX_SUBMERSIBLE_IMAGE = '/images/catalog/grandfar-qdx-submersible.png';
const GRANDFAR_QDX_SUBMERSIBLE_SLUGS = [
  'qdx40-6-11-grandfar',
  'qdx6-25-11-grandfar',
  'qdx15-17-037-grandfar',
];

function backfillGrandfarQdxSubmersibleImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_QDX_SUBMERSIBLE_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_QDX_SUBMERSIBLE_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarQdxSubmersibleImages:', e.message);
  }
}

/** Одно фото для CHT4-40 / CHT4-60 GRANDFAR */
const GRANDFAR_CHT4_CENTRIFUGAL_IMAGE = '/images/catalog/grandfar-cht4-centrifugal.png';
const GRANDFAR_CHT4_CENTRIFUGAL_SLUGS = ['cht4-40-grandfar', 'cht4-60-grandfar'];

function backfillGrandfarCht4CentrifugalImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_CHT4_CENTRIFUGAL_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_CHT4_CENTRIFUGAL_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarCht4CentrifugalImages:', e.message);
  }
}

/** Одно фото для 3SEm1.8/14T и 3SEm1.8/10T GRANDFAR */
const GRANDFAR_SEM18_WELL_PUMP_IMAGE = '/images/catalog/grandfar-sem18-well-pump.png';
const GRANDFAR_SEM18_WELL_PUMP_SLUGS = ['sem18-14t-grandfar', 'sem18-10t-grandfar'];

function backfillGrandfarSem18WellPumpImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_SEM18_WELL_PUMP_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_SEM18_WELL_PUMP_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarSem18WellPumpImages:', e.message);
  }
}

/** Одно фото для GPE403F и GP753F GRANDFAR */
const GRANDFAR_DRAINAGE_PUMP_IMAGE = '/images/catalog/grandfar-drainage-gpe-gp.png';
const GRANDFAR_DRAINAGE_PUMP_SLUGS = ['gpe403f-grandfar', 'gp753f-grandfar'];

function backfillGrandfarDrainagePumpsImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_DRAINAGE_PUMP_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_DRAINAGE_PUMP_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarDrainagePumpsImages:', e.message);
  }
}

/** Фото WQD6-16-0.75L3 GRANDFAR */
const GRANDFAR_WQD_SEWAGE_PUMP_IMAGE = '/images/catalog/grandfar-wqd6-sewage.png';

function backfillGrandfarWqdSewagePumpImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_WQD_SEWAGE_PUMP_IMAGE,
      'wqd6-16-075-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarWqdSewagePumpImage:', e.message);
  }
}

/** Одно фото для QB60 и QB80 K1 GRANDFAR (вихревые поверхностные) */
const GRANDFAR_QB_VORTEX_IMAGE = '/images/catalog/grandfar-qb-vortex.png';
const GRANDFAR_QB_VORTEX_SLUGS = ['qb60-grandfar', 'qb80-k1-grandfar'];

function backfillGrandfarQbVortexPumpImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_QB_VORTEX_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_QB_VORTEX_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarQbVortexPumpImages:', e.message);
  }
}

/** Фото X15-10A GRANDFAR */
const GRANDFAR_X15_BOOSTER_IMAGE = '/images/catalog/grandfar-x15-10a-booster.png';

function backfillGrandfarX15BoosterPumpImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_X15_BOOSTER_IMAGE,
      'x15-10a-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarX15BoosterPumpImage:', e.message);
  }
}

/** Одно фото для AHFm6AR и AHFm5BM AQUOR */
const AQUOR_AHFM_CENTRIFUGAL_IMAGE = '/images/catalog/aquor-ahfm-centrifugal.png';
const AQUOR_AHFM_CENTRIFUGAL_SLUGS = ['ahfm6ar-aquor', 'ahfm5bm-aquor'];

function backfillAquorAhfmCentrifugalImages() {
  if (!db) return;
  try {
    for (const slug of AQUOR_AHFM_CENTRIFUGAL_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        AQUOR_AHFM_CENTRIFUGAL_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillAquorAhfmCentrifugalImages:', e.message);
  }
}

/** Одно фото для AUTOJET750 и AUTOJET1100 AQUOR */
const AQUOR_AUTOJET_STATION_IMAGE = '/images/catalog/aquor-autojet-station.png';
const AQUOR_AUTOJET_STATION_SLUGS = ['autojet750-aquor', 'autojet1100-aquor'];

function backfillAquorAutojetStationImages() {
  if (!db) return;
  try {
    for (const slug of AQUOR_AUTOJET_STATION_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        AQUOR_AUTOJET_STATION_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillAquorAutojetStationImages:', e.message);
  }
}

/** Одно фото: QDX1.5-25-0.55F, QDX1.5-17-0.37 и WQD6-16-0.75L3 AQUOR */
const AQUOR_QDX_SUBMERSIBLE_IMAGE = '/images/catalog/aquor-qdx-submersible.png';
const AQUOR_QDX_SUBMERSIBLE_SLUGS = [
  'qdx15-25-055f-aquor',
  'qdx15-17-037-aquor',
  'wqd6-16-075-aquor',
];

function backfillAquorQdxSubmersibleImages() {
  if (!db) return;
  try {
    for (const slug of AQUOR_QDX_SUBMERSIBLE_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        AQUOR_QDX_SUBMERSIBLE_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillAquorQdxSubmersibleImages:', e.message);
  }
}

/** Фото QB70 AQUOR */
const AQUOR_QB70_VORTEX_IMAGE = '/images/catalog/aquor-qb70-vortex.png';

function backfillAquorQb70VortexPumpImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      AQUOR_QB70_VORTEX_IMAGE,
      'qb70-aquor',
    ]);
  } catch (e) {
    console.warn('backfillAquorQb70VortexPumpImage:', e.message);
  }
}

/** Фото 3QJDY1.8/10 AQUOR */
const AQUOR_QJDY_WELL_PUMP_IMAGE = '/images/catalog/aquor-qjdy18-10-well.png';

function backfillAquorQjdyWellPumpImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      AQUOR_QJDY_WELL_PUMP_IMAGE,
      'qjdy18-10-aquor',
    ]);
  } catch (e) {
    console.warn('backfillAquorQjdyWellPumpImage:', e.message);
  }
}

/** Фото TR80020 TRIANGLE */
const TRIANGLE_TR80020_HEATER_IMAGE = '/images/catalog/triangle-tr80020-heater.png';

function backfillTriangleTr80020HeaterImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      TRIANGLE_TR80020_HEATER_IMAGE,
      'tr80020-triangle',
    ]);
  } catch (e) {
    console.warn('backfillTriangleTr80020HeaterImage:', e.message);
  }
}

/** Фото TR80030 TRIANGLE */
const TRIANGLE_TR80030_HEATER_IMAGE = '/images/catalog/triangle-tr80030-heater.png';

function backfillTriangleTr80030HeaterImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      TRIANGLE_TR80030_HEATER_IMAGE,
      'tr80030-triangle',
    ]);
  } catch (e) {
    console.warn('backfillTriangleTr80030HeaterImage:', e.message);
  }
}

/** Фото TR83000 TRIANGLE */
const TRIANGLE_TR83000_HEATER_IMAGE = '/images/catalog/triangle-tr83000-heater.png';

function backfillTriangleTr83000HeaterImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      TRIANGLE_TR83000_HEATER_IMAGE,
      'tr83000-triangle',
    ]);
  } catch (e) {
    console.warn('backfillTriangleTr83000HeaterImage:', e.message);
  }
}

/** Фото TR83009 TRIANGLE */
const TRIANGLE_TR83009_HEATER_IMAGE = '/images/catalog/triangle-tr83009-heater.png';

function backfillTriangleTr83009HeaterImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      TRIANGLE_TR83009_HEATER_IMAGE,
      'tr83009-triangle',
    ]);
  } catch (e) {
    console.warn('backfillTriangleTr83009HeaterImage:', e.message);
  }
}

/** Фото TR911200 TRIANGLE */
const TRIANGLE_TR911200_STATION_IMAGE = '/images/catalog/triangle-tr911200-station.png';

function backfillTriangleTr911200StationImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      TRIANGLE_TR911200_STATION_IMAGE,
      'tr911200-triangle',
    ]);
  } catch (e) {
    console.warn('backfillTriangleTr911200StationImage:', e.message);
  }
}

/** Фото KGFE3600ES KUMO */
const KUMO_KGFE3600ES_IMAGE = '/images/catalog/kumo-kgfe3600es-generator.png';

function backfillKumoKgfe3600esImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_KGFE3600ES_IMAGE,
      'kgfe3600es-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoKgfe3600esImage:', e.message);
  }
}

/** Фото KGFE7500ES KUMO */
const KUMO_KGFE7500ES_IMAGE = '/images/catalog/kumo-kgfe7500es-generator.png';

function backfillKumoKgfe7500esImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_KGFE7500ES_IMAGE,
      'kgfe7500es-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoKgfe7500esImage:', e.message);
  }
}

/** Фото KGFE12000ES KUMO */
const KUMO_KGFE12000ES_IMAGE = '/images/catalog/kumo-kgfe12000es-generator.png';

function backfillKumoKgfe12000esImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_KGFE12000ES_IMAGE,
      'kgfe12000es-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoKgfe12000esImage:', e.message);
  }
}

/** Фото QZ2050L KUMO */
const KUMO_QZ2050L_IMAGE = '/images/catalog/kumo-qz2050l-compressor.png';

function backfillKumoQz2050lImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_QZ2050L_IMAGE,
      'qz2050l-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoQz2050lImage:', e.message);
  }
}

/** Фото QZ2024L KUMO */
const KUMO_QZ2024L_IMAGE = '/images/catalog/kumo-qz2024l-compressor.png';

function backfillKumoQz2024lImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_QZ2024L_IMAGE,
      'qz2024l-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoQz2024lImage:', e.message);
  }
}

/** Фото QV-2550 KUMO */
const KUMO_QV2550_IMAGE = '/images/catalog/kumo-qv2550-compressor.png';

function backfillKumoQv2550Image() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_QV2550_IMAGE,
      'qv-2550-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoQv2550Image:', e.message);
  }
}

/** Фото KWP-50S KUMO */
const KUMO_KWP50S_IMAGE = '/images/catalog/kumo-kwp50s-motopump.png';

function backfillKumoKwp50sImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_KWP50S_IMAGE,
      'kwp50s-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoKwp50sImage:', e.message);
  }
}

/** Фото KWP-80S KUMO */
const KUMO_KWP80S_IMAGE = '/images/catalog/kumo-kwp80s-motopump.png';

function backfillKumoKwp80sImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      KUMO_KWP80S_IMAGE,
      'kwp80s-kumo',
    ]);
  } catch (e) {
    console.warn('backfillKumoKwp80sImage:', e.message);
  }
}

/** Одно фото для PW370 и PW550E GRANDFAR */
const GRANDFAR_PW_STATION_IMAGE = '/images/catalog/grandfar-pw-station.png';
const GRANDFAR_PW_STATION_SLUGS = ['pw370-grandfar', 'pw550e-grandfar'];

function backfillGrandfarPwStationImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_PW_STATION_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_PW_STATION_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarPwStationImages:', e.message);
  }
}

/** Фото PW750E GRANDFAR (на снимке табличка PW550) */
const GRANDFAR_PW750E_STATION_IMAGE = '/images/catalog/grandfar-pw750e-station.png';

function backfillGrandfarPw750eStationImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_PW750E_STATION_IMAGE,
      'pw750e-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarPw750eStationImage:', e.message);
  }
}

/** Фото 1AWZB125 GRANDFAR (на снимке маркировка 1AWZB550) */
const GRANDFAR_AWZB125_STATION_IMAGE = '/images/catalog/grandfar-awzb125-station.png';

function backfillGrandfarAwzb125StationImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_AWZB125_STATION_IMAGE,
      'awzb125-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarAwzb125StationImage:', e.message);
  }
}

/** Фото AUTOGJSm800L1S K1 GRANDFAR */
const GRANDFAR_AUTOGJSM800_STATION_IMAGE = '/images/catalog/grandfar-autogjsm800-station.png';

function backfillGrandfarAutogjsm800StationImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_AUTOGJSM800_STATION_IMAGE,
      'autogjsm800-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarAutogjsm800StationImage:', e.message);
  }
}

/** Одно фото для GFV…E-G1 и GFH2500-G1 GRANDFAR (на снимке GFV2500E-G1) */
const GRANDFAR_GFV_GENERATOR_IMAGE = '/images/catalog/grandfar-gfv-e-g1-generator.png';
const GRANDFAR_GFV_GENERATOR_SLUGS = [
  'gfv2500e-grandfar',
  'gfv6500e-grandfar',
  'gfv9500e-grandfar',
  'gfh2500-grandfar',
];

function backfillGrandfarGfvGeneratorImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_GFV_GENERATOR_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_GFV_GENERATOR_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarGfvGeneratorImages:', e.message);
  }
}

/** Одно фото для GFBM21120 и GFBM71550A-G2 GRANDFAR */
const GRANDFAR_GFBM_COMPRESSOR_IMAGE = '/images/catalog/grandfar-gfbm-compressor.png';
const GRANDFAR_GFBM_COMPRESSOR_SLUGS = ['gfbm21120-grandfar', 'gfbm71550a-grandfar'];

function backfillGrandfarGfbmCompressorImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_GFBM_COMPRESSOR_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_GFBM_COMPRESSOR_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarGfbmCompressorImages:', e.message);
  }
}

/** Фото GF2065-150 GRANDFAR */
const GRANDFAR_GF2065_COMPRESSOR_IMAGE = '/images/catalog/grandfar-gf2065-150-compressor.png';

function backfillGrandfarGf2065CompressorImage() {
  if (!db) return;
  try {
    db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
      GRANDFAR_GF2065_COMPRESSOR_IMAGE,
      'gf2065-150-grandfar',
    ]);
  } catch (e) {
    console.warn('backfillGrandfarGf2065CompressorImage:', e.message);
  }
}

/** Одно фото для GFC-24L и GFV100T GRANDFAR (на снимке компактный бак) */
const GRANDFAR_PRESSURE_TANK_IMAGE = '/images/catalog/grandfar-pressure-tank-gfc-gfv.png';
const GRANDFAR_PRESSURE_TANK_SLUGS = ['gfc24l-grandfar', 'gfv100t-grandfar'];

function backfillGrandfarPressureTankImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_PRESSURE_TANK_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_PRESSURE_TANK_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarPressureTankImages:', e.message);
  }
}

/** Одно фото для GF50-G, GF80-G и GF100-G1 GRANDFAR */
const GRANDFAR_GF_MOTOPUMP_IMAGE = '/images/catalog/grandfar-gf-motopump.png';
const GRANDFAR_GF_MOTOPUMP_SLUGS = ['gf50g-grandfar', 'gf80g-grandfar', 'gf100g1-grandfar'];

function backfillGrandfarGfMotopumpImages() {
  if (!db) return;
  try {
    for (const slug of GRANDFAR_GF_MOTOPUMP_SLUGS) {
      db.run(`UPDATE products SET image_url = ? WHERE slug = ?`, [
        GRANDFAR_GF_MOTOPUMP_IMAGE,
        slug,
      ]);
    }
  } catch (e) {
    console.warn('backfillGrandfarGfMotopumpImages:', e.message);
  }
}

function removeDiscontinuedProducts() {
  if (!db) return;
  for (const slug of DISCONTINUED_PRODUCT_SLUGS) {
    try {
      db.run(
        'DELETE FROM order_items WHERE product_id IN (SELECT id FROM products WHERE slug = ?)',
        [slug]
      );
      db.run('DELETE FROM products WHERE slug = ?', [slug]);
    } catch (e) {
      console.warn('removeDiscontinuedProducts:', slug, e.message);
    }
  }
}

function backfillRichProductCopy() {
  if (!db || !PRODUCT_COPY_BACKFILL.length) return;
  const stmt = db.prepare(
    'UPDATE products SET description = ?, detailed_description = ? WHERE slug = ?'
  );
  try {
    for (const row of PRODUCT_COPY_BACKFILL) {
      stmt.run([row.description, row.detailed_description, row.slug]);
    }
  } catch (e) {
    console.warn('backfillRichProductCopy:', e.message);
  }
  stmt.free();
}

function seed() {
  const res = db.exec('SELECT COUNT(*) as cnt FROM products');
  if (res.length && res[0].values[0][0] > 0) return;

  const cats = [
    ['Насосы', 'pumps'],
    ['Станции водоснабжения', 'stations'],
    ['Генераторы', 'generators'],
    ['Компрессоры', 'compressors'],
    ['Обогреватели', 'heaters'],
    ['Мотопомпы', 'motors'],
  ];
  cats.forEach(c => db.run('INSERT INTO categories (name, slug) VALUES (?, ?)', c));

  const brs = [
    ['GRANDFAR', 'grandfar'],
    ['AQUOR', 'aquor'],
    ['KUMO', 'kumo'],
    ['TRIANGLE', 'triangle'],
  ];
  brs.forEach(b => db.run('INSERT INTO brands (name, slug) VALUES (?, ?)', b));

  const sql = `INSERT INTO products
    (name, slug, description, detailed_description, brand_id, category_id,
     price, old_price, power_kw, area_sqm, efficiency, fuel_type,
     has_credit, has_installment, is_new, is_recommended, in_stock)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const products = [
    // cat 1 = Насосы, brand 1 = GRANDFAR
    ['Погружной насос QDX1.5-25-0.55 GRANDFAR', 'qdx15-25-055-grandfar',
      'Погружной насос для чистой воды, 0.55 кВт',
      'Погружной насос QDX1.5-25-0.55 GRANDFAR — надёжный насос для перекачки чистой воды. Мощность 0.55 кВт, напор до 25 м, производительность 1.5 м³/ч. Корпус из нержавеющей стали.',
      1, 1, 45800, null, 0.55, null, null, null, 0, 1, 1, 1, 1],
    ['Погружной насос QDX6-25-1.1 GRANDFAR', 'qdx6-25-11-grandfar',
      'Погружной насос 1.1 кВт, напор 25 м',
      'Погружной насос QDX6-25-1.1 GRANDFAR — мощный насос для перекачки воды. Производительность 6 м³/ч, напор 25 м.',
      1, 1, 80500, null, 1.1, null, null, null, 1, 1, 0, 1, 1],
    ['Погружной насос QDX40-6-1.1 GRANDFAR', 'qdx40-6-11-grandfar',
      'Погружной насос высокой производительности 1.1 кВт',
      'QDX40-6-1.1 GRANDFAR — насос с высокой производительностью 40 м³/ч. Идеален для дренажных работ.',
      1, 1, 63400, null, 1.1, null, null, null, 1, 0, 0, 0, 1],
    ['Погружной насос QDX1.5-17-0.37 GRANDFAR', 'qdx15-17-037-grandfar',
      'Компактный погружной насос 0.37 кВт',
      'QDX1.5-17-0.37 GRANDFAR — экономичный насос для бытового использования. Напор 17 м, производительность 1.5 м³/ч.',
      1, 1, 37500, null, 0.37, null, null, null, 0, 0, 0, 0, 1],
    ['Погружной дренажный насос GPE403F GRANDFAR', 'gpe403f-grandfar',
      'Дренажный насос с поплавковым выключателем',
      'GPE403F GRANDFAR — дренажный насос для откачки воды из подвалов, бассейнов, колодцев. Поплавковый выключатель для автоматической работы.',
      1, 1, 31400, null, 0.4, null, null, null, 0, 0, 1, 0, 1],
    ['Погружной дренажный насос GP753F GRANDFAR', 'gp753f-grandfar',
      'Дренажный насос 0.75 кВт с поплавком',
      'GP753F GRANDFAR — мощный дренажный насос для откачки загрязнённой воды. Мощность 0.75 кВт.',
      1, 1, 34000, null, 0.75, null, null, null, 0, 0, 0, 0, 1],
    ['Погружной фекальный насос WQD6-16-0.75L3 GRANDFAR', 'wqd6-16-075-grandfar',
      'Фекальный насос для сточных вод 0.75 кВт',
      'WQD6-16-0.75L3 GRANDFAR — фекальный насос для перекачки сточных вод. Производительность 6 м³/ч, напор 16 м.',
      1, 1, 78300, null, 0.75, null, null, null, 1, 1, 0, 0, 1],
    ['Насос поверхностный вихревой QB60 GRANDFAR', 'qb60-grandfar',
      'Вихревой поверхностный насос QB60',
      'QB60 GRANDFAR — компактный поверхностный насос вихревого типа. Идеален для повышения давления в системе водоснабжения.',
      1, 1, 32500, null, 0.37, null, null, null, 0, 0, 0, 0, 1],
    ['Насос поверхностный вихревой QB80 K1 GRANDFAR', 'qb80-k1-grandfar',
      'Вихревой насос повышенной мощности',
      'QB80 K1 GRANDFAR — поверхностный вихревой насос для систем водоснабжения. Увеличенная мощность для стабильного напора.',
      1, 1, 42800, null, 0.55, null, null, null, 0, 0, 1, 0, 1],
    ['Центробежный насос CHT4-40 GRANDFAR', 'cht4-40-grandfar',
      'Центробежный насос из нержавеющей стали',
      'CHT4-40 GRANDFAR — промышленный центробежный насос из нержавеющей стали. Производительность 4 м³/ч, напор 40 м.',
      1, 1, 140000, null, 1.5, null, null, null, 1, 1, 0, 1, 1],
    ['Центробежный насос CHT4-60 GRANDFAR', 'cht4-60-grandfar',
      'Центробежный насос из нерж. стали, напор 60 м',
      'CHT4-60 GRANDFAR — мощный центробежный насос. Напор до 60 м для промышленного применения.',
      1, 1, 204000, null, 2.2, null, null, null, 1, 1, 0, 0, 1],
    ['Скважинный насос 3SEm1.8/14T GRANDFAR', 'sem18-14t-grandfar',
      'Скважинный насос для бытовых скважин',
      '3SEm1.8/14T GRANDFAR — скважинный насос для скважин диаметром от 76 мм. Производительность 1.8 м³/ч, напор 14 м.',
      1, 1, 69300, null, 0.37, null, null, null, 0, 1, 0, 1, 1],
    ['Скважинный насос 3SEm1.8/10T GRANDFAR', 'sem18-10t-grandfar',
      'Компактный скважинный насос',
      '3SEm1.8/10T GRANDFAR — экономичный скважинный насос. Производительность 1.8 м³/ч, напор 10 м.',
      1, 1, 52800, null, 0.25, null, null, null, 0, 0, 0, 0, 1],
    ['Бустерный насос X15-10A GRANDFAR', 'x15-10a-grandfar',
      'Насос для повышения давления воды',
      'X15-10A GRANDFAR — бустерный насос для повышения давления в системе водоснабжения квартиры или дома.',
      1, 1, 18000, null, 0.1, null, null, null, 0, 0, 0, 0, 1],

    // brand 2 = AQUOR, cat 1 = Насосы
    ['Погружной насос QDX1.5-25-0.55F AQUOR', 'qdx15-25-055f-aquor',
      'Погружной насос из нержавеющей стали 0.55 кВт',
      'QDX1.5-25-0.55F AQUOR — погружной насос с корпусом из нержавеющей стали. Мощность 0.55 кВт, напор 25 м.',
      2, 1, 31700, null, 0.55, null, null, null, 0, 0, 1, 0, 1],
    ['Погружной насос QDX1.5-17-0.37 AQUOR', 'qdx15-17-037-aquor',
      'Экономичный погружной насос 0.37 кВт',
      'QDX1.5-17-0.37 AQUOR — компактный погружной насос для бытовых нужд.',
      2, 1, 25800, null, 0.37, null, null, null, 0, 0, 0, 0, 1],
    ['Центробежный насос AHFm6AR AQUOR', 'ahfm6ar-aquor',
      'Мощный центробежный насос AQUOR',
      'AHFm6AR AQUOR — высокопроизводительный центробежный насос. Корпус из нержавеющей стали.',
      2, 1, 69600, null, 1.5, null, null, null, 0, 0, 0, 1, 1],
    ['Центробежный насос AHFm5BM AQUOR', 'ahfm5bm-aquor',
      'Центробежный насос средней мощности',
      'AHFm5BM AQUOR — надёжный центробежный насос для водоснабжения.',
      2, 1, 45500, null, 0.75, null, null, null, 0, 0, 0, 0, 1],
    ['Насос поверхностный вихревой QB70 AQUOR', 'qb70-aquor',
      'Вихревой поверхностный насос AQUOR',
      'QB70 AQUOR — доступный поверхностный вихревой насос для бытового водоснабжения.',
      2, 1, 17800, null, 0.37, null, null, null, 0, 0, 0, 0, 1],
    ['Погружной фекальный насос WQD6-16-0.75L3 AQUOR', 'wqd6-16-075-aquor',
      'Фекальный насос AQUOR 0.75 кВт',
      'WQD6-16-0.75L3 AQUOR — фекальный насос для откачки сточных вод.',
      2, 1, 50000, null, 0.75, null, null, null, 0, 0, 0, 0, 1],
    ['Скважинный насос 3QJDY1.8/10 AQUOR', 'qjdy18-10-aquor',
      'Скважинный насос для глубоких скважин',
      '3QJDY1.8/10 AQUOR — скважинный насос с производительностью 1.8 м³/ч.',
      2, 1, 43200, null, 0.55, null, null, null, 0, 0, 0, 0, 1],

    // cat 2 = Станции водоснабжения
    ['Автоматическая станция водоснабжения 1AWZB125 GRANDFAR', 'awzb125-grandfar',
      'Компактная станция водоснабжения GRANDFAR',
      '1AWZB125 GRANDFAR — автоматическая станция водоснабжения для частного дома. Автоматический режим работы.',
      1, 2, 31400, null, 0.37, null, null, null, 0, 0, 0, 0, 1],
    ['Автоматическая станция водоснабжения PW370 GRANDFAR', 'pw370-grandfar',
      'Станция водоснабжения 0.37 кВт',
      'PW370 GRANDFAR — надёжная автоматическая станция для дома.',
      1, 2, 45400, null, 0.37, null, null, null, 0, 1, 0, 1, 1],
    ['Автоматическая станция водоснабжения PW550E GRANDFAR', 'pw550e-grandfar',
      'Станция водоснабжения с электронным управлением',
      'PW550E GRANDFAR — станция с электронным контролем давления. Мощность 0.55 кВт.',
      1, 2, 68200, null, 0.55, null, null, null, 1, 1, 1, 1, 1],
    ['Автоматическая станция водоснабжения PW750E GRANDFAR', 'pw750e-grandfar',
      'Мощная станция водоснабжения 0.75 кВт',
      'PW750E GRANDFAR — станция с электронным управлением для больших домов.',
      1, 2, 71900, null, 0.75, null, null, null, 1, 1, 0, 0, 1],
    ['Автоматическая станция AUTOGJSm800L1S K1 GRANDFAR', 'autogjsm800-grandfar',
      'Премиальная станция водоснабжения 0.8 кВт',
      'AUTOGJSm800L1S K1 GRANDFAR — станция премиум-класса с высокой производительностью.',
      1, 2, 116000, null, 0.8, null, null, null, 1, 1, 1, 0, 1],
    ['Автоматическая станция AUTOJET1100 AQUOR', 'autojet1100-aquor',
      'Станция водоснабжения AQUOR 1.1 кВт',
      'AUTOJET1100 AQUOR — мощная автоматическая станция водоснабжения.',
      2, 2, 59600, null, 1.1, null, null, null, 0, 0, 0, 0, 1],
    ['Автоматическая станция AUTOJET750 AQUOR', 'autojet750-aquor',
      'Станция водоснабжения AQUOR 0.75 кВт',
      'AUTOJET750 AQUOR — надёжная станция для бытового водоснабжения.',
      2, 2, 56400, null, 0.75, null, null, null, 0, 0, 0, 0, 1],

    // cat 3 = Генераторы
    ['Генератор бензиновый GFV2500E-G1 GRANDFAR', 'gfv2500e-grandfar',
      'Бензиновый генератор 2.5 кВт с электростартером',
      'GFV2500E-G1 GRANDFAR — бензогенератор мощностью 2.5 кВт. Электростартер, розетки 220В.',
      1, 3, 189700, null, 2.5, null, null, null, 1, 1, 1, 1, 1],
    ['Генератор бензиновый GFV6500E-G1 GRANDFAR', 'gfv6500e-grandfar',
      'Мощный генератор 6.5 кВт для дома и дачи',
      'GFV6500E-G1 GRANDFAR — мощный генератор для резервного питания. 6.5 кВт, электростартер.',
      1, 3, 329100, null, 6.5, null, null, null, 1, 1, 0, 1, 1],
    ['Генератор бензиновый GFH2500-G1 GRANDFAR', 'gfh2500-grandfar',
      'Бензиновый генератор 2.5 кВт ручной старт',
      'GFH2500-G1 GRANDFAR — экономичный генератор с ручным стартом.',
      1, 3, 152600, null, 2.5, null, null, null, 0, 0, 0, 0, 1],
    ['Генератор бензиновый GFV9500E-G1 GRANDFAR', 'gfv9500e-grandfar',
      'Генератор 9.5 кВт для промышленного использования',
      'GFV9500E-G1 GRANDFAR — мощный генератор для объектов большой площади. 9.5 кВт.',
      1, 3, 403600, null, 9.5, null, null, null, 1, 1, 0, 0, 1],
    ['Генератор KGFE3600ES 3 кВт KUMO', 'kgfe3600es-kumo',
      'Бензиновый генератор KUMO 2.8-3 кВт',
      'KGFE3600ES KUMO — бензогенератор 3 кВт с электростартером. 2 розетки 16А/220В. Защита от перегрузок, вольтметр, колёса.',
      3, 3, 226000, null, 3, null, null, null, 1, 1, 1, 1, 1],
    ['Генератор KGFE7500ES 6.5 кВт KUMO', 'kgfe7500es-kumo',
      'Бензиновый генератор KUMO 6.0-6.5 кВт',
      'KGFE7500ES KUMO — мощный генератор с электростартером. 2 розетки 16А-32А/220В.',
      3, 3, 408100, null, 6.5, null, null, null, 1, 1, 0, 0, 1],
    ['Генератор KGFE12000ES 8.5 кВт KUMO', 'kgfe12000es-kumo',
      'Бензиновый генератор KUMO 7.8-8.5 кВт',
      'KGFE12000ES KUMO — генератор повышенной мощности. 2 розетки 16А-32А/220В, защита от перегрузок.',
      3, 3, 510000, null, 8.5, null, null, null, 1, 1, 0, 0, 1],

    // cat 4 = Компрессоры
    ['Компрессор GFBM21120 GRANDFAR', 'gfbm21120-grandfar',
      'Воздушный поршневой компрессор GRANDFAR',
      'GFBM21120 GRANDFAR — поршневой компрессор для гаража и мастерской.',
      1, 4, 56400, null, 1.5, null, null, null, 0, 0, 0, 0, 1],
    ['Компрессор GFBM71550A-G2 GRANDFAR', 'gfbm71550a-grandfar',
      'Компрессор GRANDFAR 1550 Вт',
      'GFBM71550A-G2 GRANDFAR — мощный компрессор для профессиональных задач.',
      1, 4, 74000, null, 1.55, null, null, null, 0, 0, 1, 0, 1],
    ['Компрессор GF2065-150 GRANDFAR', 'gf2065-150-grandfar',
      'Профессиональный компрессор 150 л',
      'GF2065-150 GRANDFAR — профессиональный компрессор с баком 150 литров.',
      1, 4, 257600, null, 4, null, null, null, 1, 1, 0, 1, 1],
    ['Компрессор QZ2024L KUMO', 'qz2024l-kumo',
      'Поршневой компрессор KUMO 24 л',
      'QZ2024L KUMO — компрессор мощностью 1800W (2.5 НР). Бак 24 л, давление 8 Бар, 210 л/мин.',
      3, 4, 71000, null, 1.8, null, null, null, 0, 0, 0, 0, 1],
    ['Компрессор QZ2050L KUMO', 'qz2050l-kumo',
      'Поршневой компрессор KUMO 50 л',
      'QZ2050L KUMO — компрессор с баком 50 л. 1800W (3 НР), давление 8 Бар, 220 л/мин.',
      3, 4, 84000, null, 1.8, null, null, null, 0, 0, 0, 1, 1],
    ['Компрессор QV-2550 KUMO', 'qv-2550-kumo',
      'Двухцилиндровый компрессор KUMO 50 л',
      'QV-2550 KUMO — 2-х цилиндровый компрессор. 2200W (4 НР), бак 50 л, 400 л/мин.',
      3, 4, 130000, null, 2.2, null, null, null, 1, 1, 0, 0, 1],

    // cat 5 = Обогреватели
    ['Электрический обогреватель TR83000 TRIANGLE', 'tr83000-triangle',
      'Электрический обогреватель TRIANGLE',
      'TR83000 TRIANGLE — электрический обогреватель для помещений. Мобильный, быстрый нагрев.',
      4, 5, 10600, null, 3, null, null, null, 0, 0, 0, 0, 1],
    ['Электрический обогреватель TR83009 TRIANGLE', 'tr83009-triangle',
      'Мощный электрический обогреватель',
      'TR83009 TRIANGLE — мощный электрический обогреватель для больших помещений.',
      4, 5, 65500, null, 9, null, null, null, 1, 1, 0, 0, 1],
    ['Газовая пушка TR80020 TRIANGLE', 'tr80020-triangle',
      'Газовая тепловая пушка 20 кВт',
      'TR80020 TRIANGLE — газовая тепловая пушка для обогрева складов, ангаров и строительных площадок. Мощность 20 кВт.',
      4, 5, 40900, null, 20, null, null, null, 0, 0, 1, 1, 1],
    ['Газовая пушка TR80030 TRIANGLE', 'tr80030-triangle',
      'Газовая тепловая пушка 30 кВт',
      'TR80030 TRIANGLE — мощная газовая пушка для больших площадей. 30 кВт.',
      4, 5, 44200, null, 30, null, null, null, 0, 0, 0, 0, 1],

    // cat 6 = Мотопомпы
    ['Мотопомпа GF50-G GRANDFAR', 'gf50g-grandfar',
      'Бензиновая мотопомпа 50 мм GRANDFAR',
      'GF50-G GRANDFAR — бензиновая мотопомпа для перекачки чистой воды.',
      1, 6, 98600, null, 5, null, null, null, 0, 0, 0, 1, 1],
    ['Мотопомпа GF80-G GRANDFAR', 'gf80g-grandfar',
      'Бензиновая мотопомпа 80 мм',
      'GF80-G GRANDFAR — мотопомпа для полива и перекачки воды. Патрубок 80 мм.',
      1, 6, 89800, null, 7, null, null, null, 0, 0, 0, 0, 1],
    ['Мотопомпа GF100-G1 GRANDFAR', 'gf100g1-grandfar',
      'Мощная мотопомпа 100 мм GRANDFAR',
      'GF100-G1 GRANDFAR — мощная мотопомпа для больших объёмов воды.',
      1, 6, 190700, null, 15, null, null, null, 1, 1, 0, 0, 1],
    ['Мотопомпа KWP-50S KUMO', 'kwp50s-kumo',
      'Бензиновая мотопомпа KUMO 50 мм',
      'KWP-50S KUMO — мотопомпа для чистой и средне загрязнённой воды. Двигатель 212 см³, напор 30 м, 30 м³/ч.',
      3, 6, 92500, null, 7, null, null, null, 0, 0, 1, 1, 1],
    ['Мотопомпа KWP-80S KUMO', 'kwp80s-kumo',
      'Мотопомпа KUMO 80 мм, 60 м³/ч',
      'KWP-80S KUMO — мотопомпа повышенной производительности. 60 м³/ч, напор 30 м.',
      3, 6, 104200, null, 7, null, null, null, 0, 0, 0, 0, 1],

    // cat 2 = Станции, brand 4 = TRIANGLE
    ['Вакуумный насос TR911200+24S TRIANGLE', 'tr911200-triangle',
      'Вакуумный насос TRIANGLE с гидробаком 24 л',
      'TR911200+24S TRIANGLE — станция водоснабжения с гидроаккумулятором 24 л.',
      4, 2, 66900, null, 1.2, null, null, null, 0, 0, 0, 0, 1],

    // Дополнительные баки
    ['Напорный бак GFC-24L GRANDFAR', 'gfc24l-grandfar',
      'Гидроаккумулятор 24 литра',
      'GFC-24L GRANDFAR — напорный бак 24 литра для систем водоснабжения.',
      1, 2, 12500, null, null, null, null, null, 0, 0, 0, 0, 1],
    ['Напорный бак GFV100T GRANDFAR', 'gfv100t-grandfar',
      'Гидроаккумулятор 100 литров',
      'GFV100T GRANDFAR — напорный бак 100 литров для крупных систем водоснабжения.',
      1, 2, 57400, null, null, null, null, null, 0, 0, 0, 0, 1],
  ];

  products.forEach(p => db.run(sql, p));
  console.log('Database seeded with', products.length, 'products');
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length ? rows[0] : null;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  return { lastInsertRowid: query('SELECT last_insert_rowid() as id')[0].id };
}

module.exports = { initDB, query, queryOne, run, DISCONTINUED_PRODUCT_SLUGS };
