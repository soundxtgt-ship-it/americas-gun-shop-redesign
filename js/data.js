/* data.js — illustrative sample catalog shared across pages.
   It is intentionally not connected to store inventory or sales systems. */

(function (global) {
  'use strict';

  // ---------------- Category taxonomy ----------------
  const CATEGORIES = [
    { id: 'handguns', label: 'Handguns', icon: 'crosshair', regulated: true },
    { id: 'rifles-shotguns', label: 'Rifles & Shotguns', icon: 'move-vertical', regulated: true },
    { id: 'ammunition', label: 'Ammunition', icon: 'layers', regulated: false },
    { id: 'optics-accessories', label: 'Optics & Accessories', icon: 'scan', regulated: false },
    { id: 'nfa-suppressors', label: 'NFA / Suppressors', icon: 'shield', regulated: true },
    { id: 'used-consignment', label: 'Used & Consignment', icon: 'refresh-ccw', regulated: true },
  ];

  const BRANDS = [
    'Ridgeline Arms', 'Hallowell Precision', 'Sentry Ordnance', 'Brackwood Firearms',
    'Yardmark Optics', 'Ferro Tactical', 'Chesterfield Gunworks', 'Northline Ballistics',
    'Aldergrove Arms', 'Marsh & Kline', 'Coldwater Supply', 'Talon Ridge',
  ];

  // deterministic pseudo-random so numbers are stable across reloads
  function seedRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function inferBrand(name) {
    const normalized = name.replace(/^Used — /, '');
    return BRANDS.find((brand) => normalized.startsWith(brand)) || null;
  }

  const HANDGUN_NAMES = [
    'Ridgeline RL-9 Compact', 'Hallowell HP45 Commander', 'Sentry S17 Duty', 'Brackwood BW-380 EDC',
    'Ferro FX9 Micro', 'Talon Ridge TR1911 Government', 'Coldwater CW-40 Sport', 'Marsh & Kline MK9 Carry',
    'Aldergrove AG38 Snub', 'Chesterfield CX2 Match',
  ];
  const RIFLE_NAMES = [
    'Northline NR-15 Patrol Carbine', 'Ridgeline RB-308 Hunter', 'Sentry S12 Field Shotgun',
    'Brackwood BW-22 Trainer', 'Chesterfield CX-Bolt .30-06', 'Talon Ridge TR870 Pump 12ga',
    'Coldwater CW-556 Rifle', 'Aldergrove AG-Lever .357',
  ];
  const AMMO_NAMES = [
    '9mm Luger 115gr FMJ — 50ct', '.223 Rem 55gr FMJ — 20ct', '12ga 2¾" 00 Buck — 25ct',
    '.45 ACP 230gr FMJ — 50ct', '.308 Win 168gr Match — 20ct', '.22 LR 40gr — 100ct',
    '5.56 NATO 62gr Green Tip — 20ct', '.40 S&W 180gr FMJ — 50ct', '20ga 2¾" Field Load — 25ct',
  ];
  // Ammo caliber is encoded in the product name itself, so map name -> caliber label
  // explicitly instead of assigning a random one (avoids mismatches like "9mm" ammo
  // showing a "12 Gauge" caliber tag).
  const AMMO_CALIBER_MAP = {
    '9mm Luger 115gr FMJ — 50ct': '9mm',
    '.223 Rem 55gr FMJ — 20ct': '.223/5.56',
    '12ga 2¾" 00 Buck — 25ct': '12 Gauge',
    '.45 ACP 230gr FMJ — 50ct': '.45 ACP',
    '.308 Win 168gr Match — 20ct': '.308 Win',
    '.22 LR 40gr — 100ct': '.22 LR',
    '5.56 NATO 62gr Green Tip — 20ct': '.223/5.56',
    '.40 S&W 180gr FMJ — 50ct': '.40 S&W',
    '20ga 2¾" Field Load — 25ct': '20 Gauge',
  };
  const OPTIC_NAMES = [
    'Yardmark 1-6x24 LPVO', 'Yardmark Red Dot RDS-2', 'Ferro Tactical Weapon Light WL200',
    'Coldwater Bipod 6-9"', 'Talon Ridge Sling — 2pt', 'Marsh & Kline Cleaning Kit Universal',
    'Yardmark 4-16x44 Precision Scope', 'Ferro Tactical IWB Holster', 'Coldwater Range Bag Pro',
    'Talon Ridge Ear Pro — Electronic', 'Marsh & Kline Safety Glasses 3pk', 'Yardmark Magazine Pouch',
  ];
  const NFA_NAMES = [
    'Sentry SR-9 Suppressor 9mm', 'Ridgeline RL-762 Suppressor', 'Ferro Tactical SBR Kit 10.5"',
    'Brackwood Suppressor Mount Kit', 'Northline NR-22 Suppressor',
  ];
  const USED_NAMES = [
    'Used — Hallowell HP45 (Consignment)', 'Used — Sentry S870 12ga Pump', 'Used — Ridgeline RB-308 (Good)',
    'Used — Coldwater CW-40 (Very Good)', 'Used — Chesterfield CX2 Match (Excellent)',
    'Used — Talon Ridge TR1911 (Good)',
  ];

  const CALIBERS = ['9mm', '.45 ACP', '.380 ACP', '.40 S&W', '.38 Special', '.223/5.56', '.308 Win', '12 Gauge', '20 Gauge', '.22 LR', '.30-06', '.357 Mag'];
  const HANDGUN_CALIBERS = ['9mm', '.45 ACP', '.380 ACP', '.40 S&W', '.38 Special', '.357 Mag', '.22 LR'];
  const LONGGUN_CALIBERS = ['.223/5.56', '.308 Win', '12 Gauge', '20 Gauge', '.22 LR', '.30-06'];
  const NFA_CALIBERS = ['9mm', '.223/5.56', '.308 Win', '.45 ACP'];

  function buildProducts() {
    const rand = seedRandom(20260820);
    const products = [];
    let id = 1000;

    function addBatch(names, categoryId, priceRange, calPool) {
      names.forEach((name) => {
        const brand = inferBrand(name) || pick(rand, BRANDS);
        const caliber = categoryId === 'ammunition' && AMMO_CALIBER_MAP[name]
          ? AMMO_CALIBER_MAP[name]
          : pick(rand, calPool || CALIBERS);
        const price = Math.round((priceRange[0] + rand() * (priceRange[1] - priceRange[0])) / 5) * 5 - 0.05;
        const stockRoll = rand();
        let stock;
        if (stockRoll < 0.12) stock = 0;
        else if (stockRoll < 0.3) stock = Math.ceil(rand() * 3);
        else stock = Math.ceil(rand() * 22) + 3;
        const condition = categoryId === 'used-consignment' ? 'used' : 'new';
        const regulated = ['handguns', 'rifles-shotguns', 'used-consignment'].includes(categoryId)
          || (categoryId === 'nfa-suppressors' && !/mount kit/i.test(name));
        id += 1;
        products.push({
          id: 'AGS-' + id,
          name,
          category: categoryId,
          brand,
          caliber: categoryId === 'optics-accessories' ? null : caliber,
          price: Math.max(9.99, price),
          stock,
          condition,
          regulated,
          sku: 'SKU-' + (100000 + id),
        });
      });
    }

    addBatch(HANDGUN_NAMES, 'handguns', [349, 1249], HANDGUN_CALIBERS);
    addBatch(RIFLE_NAMES, 'rifles-shotguns', [399, 1899], LONGGUN_CALIBERS);
    addBatch(AMMO_NAMES, 'ammunition', [8, 34], CALIBERS);
    addBatch(OPTIC_NAMES, 'optics-accessories', [14, 449]);
    addBatch(NFA_NAMES, 'nfa-suppressors', [549, 1299], NFA_CALIBERS);
    addBatch(USED_NAMES, 'used-consignment', [229, 899], HANDGUN_CALIBERS.concat(LONGGUN_CALIBERS));

    return products;
  }

  const PRODUCTS = buildProducts();

  function categoryLabel(id) {
    const c = CATEGORIES.find((c) => c.id === id);
    return c ? c.label : id;
  }

  function isRegulated(productOrCategory) {
    if (productOrCategory && typeof productOrCategory === 'object') {
      return Boolean(productOrCategory.regulated);
    }
    const categoryId = productOrCategory;
    const c = CATEGORIES.find((c) => c.id === categoryId);
    return c ? c.regulated : false;
  }

  function isValidCategory(id) {
    return CATEGORIES.some((category) => category.id === id);
  }

  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function formatPrice(n) {
    return '$' + n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  global.AGS = {
    CATEGORIES,
    BRANDS,
    CALIBERS,
    PRODUCTS,
    categoryLabel,
    isRegulated,
    isValidCategory,
    getProduct,
    formatPrice,
  };
})(window);
