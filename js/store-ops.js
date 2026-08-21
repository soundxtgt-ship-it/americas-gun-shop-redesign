/* store-ops.js — Chart.js-powered POS analytics showcase (all mock data) */

document.addEventListener('DOMContentLoaded', function () {
  function seedRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = () => (isDark() ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)');
  const tickColor = () => (isDark() ? '#a3a9b3' : '#5a5f68');
  const fontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-body') || 'sans-serif';

  Chart.defaults.font.family = fontFamily.trim() || 'sans-serif';
  Chart.defaults.color = tickColor();

  const PRIMARY = '#5b9bd1';
  const BRASS = '#c99a4a';
  const SUCCESS = '#5fa876';
  const WARNING = '#d99a3f';
  const ERROR = '#d55b52';
  const PURPLE = '#8d7fc7';

  function animateNumber(el, target, prefix = '', decimals = 0) {
    const start = 0;
    const duration = 900;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (target - start) * eased;
      el.textContent = prefix + value.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let currentRange = 7;
  const charts = {};

  function buildDailySales(days) {
    const rand = seedRandom(days * 97 + 3);
    const labels = [];
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const base = 2400 + rand() * 2600;
      const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.25 : 1;
      data.push(Math.round(base * weekend));
    }
    return { labels, data };
  }

  function renderDailySales() {
    const { labels, data } = buildDailySales(currentRange);
    const ctx = document.getElementById('chart-daily-sales');
    if (charts.daily) charts.daily.destroy();
    charts.daily = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily sales ($)',
            data,
            borderColor: PRIMARY,
            backgroundColor: (ctx2) => {
              const g = ctx2.chart.ctx.createLinearGradient(0, 0, 0, 260);
              g.addColorStop(0, 'rgba(91,155,209,0.35)');
              g.addColorStop(1, 'rgba(91,155,209,0.02)');
              return g;
            },
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (item) => ' $' + item.parsed.y.toLocaleString('en-US') },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor(), maxRotation: 0, autoSkip: true } },
          y: {
            grid: { color: gridColor() },
            ticks: { color: tickColor(), callback: (v) => '$' + v.toLocaleString('en-US') },
          },
        },
      },
    });

    // KPI: today's sales + transactions
    const todaySales = data[data.length - 1];
    animateNumber(document.getElementById('kpi-sales'), todaySales, '$');
    const rand = seedRandom(currentRange * 13 + 5);
    animateNumber(document.getElementById('kpi-transactions'), Math.round(todaySales / (28 + rand() * 14)));
  }

  function renderCategoryShare() {
    const rand = seedRandom(currentRange * 41 + 11);
    const categories = window.AGS.CATEGORIES.map((c) => c.label);
    const weights = categories.map(() => 0.5 + rand());
    const total = weights.reduce((a, b) => a + b, 0);
    const data = weights.map((w) => Math.round((w / total) * 1000) / 10);

    const ctx = document.getElementById('chart-category-share');
    if (charts.category) charts.category.destroy();
    charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [
          {
            data,
            backgroundColor: [PRIMARY, BRASS, SUCCESS, PURPLE, WARNING, ERROR],
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-surface') || '#1a1d22',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: tickColor(), font: { size: 11 }, boxWidth: 10, padding: 10 },
          },
          tooltip: { callbacks: { label: (item) => ` ${item.label}: ${item.parsed}%` } },
        },
      },
    });
  }

  function renderInventoryLevels() {
    const categories = window.AGS.CATEGORIES;
    const data = categories.map((c) => window.AGS.PRODUCTS.filter((p) => p.category === c.id).reduce((sum, p) => sum + p.stock, 0));
    const ctx = document.getElementById('chart-inventory-levels');
    if (charts.inventory) charts.inventory.destroy();
    charts.inventory = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories.map((c) => c.label),
        datasets: [
          {
            label: 'Units on hand',
            data,
            backgroundColor: PRIMARY,
            borderRadius: 6,
            maxBarThickness: 46,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item) => ' ' + item.parsed.y + ' units' } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor(), font: { size: 10 }, maxRotation: 22, minRotation: 0 } },
          y: { grid: { color: gridColor() }, ticks: { color: tickColor(), precision: 0 } },
        },
      },
    });

    // KPI: SKUs tracked
    animateNumber(document.getElementById('kpi-skus'), window.AGS.PRODUCTS.length);
  }

  function renderLowStock() {
    const lowStockItems = window.AGS.PRODUCTS.filter((p) => p.stock > 0 && p.stock <= 3).sort((a, b) => a.stock - b.stock);
    const listEl = document.getElementById('low-stock-list');
    if (!lowStockItems.length) {
      listEl.innerHTML = '<li class="hint" style="padding: var(--space-4);">No items below reorder threshold right now.</li>';
    } else {
      listEl.innerHTML = lowStockItems
        .map(
          (p) => `
        <li class="low-stock-row">
          <span>
            <span class="low-stock-row-name">${p.name}</span>
            <span class="low-stock-row-meta">${p.brand} &middot; ${window.AGS.categoryLabel(p.category)}</span>
          </span>
          <span class="badge badge-low low-stock-count">${p.stock} left</span>
        </li>
      `
        )
        .join('');
    }
    animateNumber(document.getElementById('kpi-low-stock'), lowStockItems.length);
  }

  function renderAll() {
    renderDailySales();
    renderCategoryShare();
    renderInventoryLevels();
    renderLowStock();
  }

  renderAll();

  document.querySelectorAll('.range-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentRange = Number(btn.getAttribute('data-range'));
      document.querySelectorAll('.range-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderDailySales();
      renderCategoryShare();
    });
  });

  // Re-render on theme change for correct chart colors
  const themeToggle = document.querySelector('[data-theme-toggle]');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTimeout(renderAll, 50);
    });
  }

  // "Last synced" ticking label
  let secondsAgo = 3;
  const syncLabel = document.getElementById('last-sync-label');
  setInterval(() => {
    secondsAgo += 7;
    if (secondsAgo < 60) syncLabel.textContent = `Last full sync: ${secondsAgo}s ago`;
    else syncLabel.textContent = `Last full sync: ${Math.floor(secondsAgo / 60)}m ago`;
  }, 7000);
});
