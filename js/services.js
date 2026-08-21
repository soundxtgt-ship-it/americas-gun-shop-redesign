/* services.js — form mocks, file upload mock, and calendar/booking widget */

document.addEventListener('DOMContentLoaded', function () {
  // ---- Generic mock form submit handler ----
  function wireForm(formId, successId) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Submitting…';
      setTimeout(() => {
        success.classList.add('is-visible');
        form.reset();
        btn.disabled = false;
        btn.textContent = btn.textContent.replace('Submitting…', '');
        btn.textContent = {
          'ffl-form': 'Submit transfer request',
          'gunsmith-form': 'Request estimate',
          'tradein-form': 'Request preliminary offer',
        }[formId] || 'Submit';
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => success.classList.remove('is-visible'), 8000);
      }, 700);
    });
  }
  wireForm('ffl-form', 'ffl-success');
  wireForm('gunsmith-form', 'gunsmith-success');
  wireForm('tradein-form', 'tradein-success');

  // ---- File upload mock ----
  const uploadZone = document.getElementById('ti-upload-zone');
  const fileInput = document.getElementById('ti-photos');
  const fileList = document.getElementById('ti-file-list');
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    fileInput.addEventListener('change', () => {
      fileList.innerHTML = Array.from(fileInput.files)
        .slice(0, 6)
        .map(
          (f, i) => `<li>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
            ${f.name}
            <button type="button" data-remove-file="${i}" aria-label="Remove ${f.name}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </li>`
        )
        .join('');
    });
    fileList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-file]');
      if (btn) btn.closest('li').remove();
    });
  }

  // ---- Calendar / class booking ----
  const CLASS_TYPES = [
    { name: 'Concealed Carry Fundamentals', duration: '4 hrs', price: 125 },
    { name: 'Home Defense Handgun', duration: '3 hrs', price: 95 },
    { name: 'NRA Basic Pistol', duration: '5 hrs', price: 140 },
    { name: 'Women\u2019s Intro to Firearms', duration: '3 hrs', price: 85 },
  ];

  function seedRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const calGrid = document.getElementById('cal-grid');
  const calLabel = document.getElementById('cal-month-label');
  const sessionsPanel = document.getElementById('booking-sessions');
  const bookingSuccess = document.getElementById('booking-success');

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDateKey = null;

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function dateKey(y, m, d) {
    return `${y}-${m}-${d}`;
  }

  function isAvailableDay(y, m, d) {
    // deterministic pseudo-availability: Tue/Thu/Sat have classes
    const dow = new Date(y, m, d).getDay();
    return dow === 2 || dow === 4 || dow === 6;
  }

  function isFullyBooked(y, m, d) {
    const rand = seedRandom(y * 10000 + m * 100 + d);
    return rand() < 0.22;
  }

  function renderCalendar() {
    calLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < firstDay; i++) cells += '<span class="calendar-day is-empty"></span>';
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const available = isAvailableDay(viewYear, viewMonth, d) && !isPast;
      const full = available && isFullyBooked(viewYear, viewMonth, d);
      const key = dateKey(viewYear, viewMonth, d);
      const selected = key === selectedDateKey;
      let cls = 'calendar-day';
      if (isPast) cls += ' is-past';
      else if (full) cls += ' is-full';
      else if (available) cls += ' is-available';
      if (selected) cls += ' is-selected';
      const interactive = available && !full;
      cells += `<button type="button" class="${cls}" data-date="${key}" ${interactive ? '' : 'disabled tabindex="-1"'} aria-label="${MONTH_NAMES[viewMonth]} ${d}, ${viewYear}${full ? ', fully booked' : available ? ', sessions available' : ''}">${d}</button>`;
    }
    calGrid.innerHTML = cells;
  }

  function renderSessions(key) {
    if (!key) {
      sessionsPanel.innerHTML = '<p class="hint">Select a highlighted date to see available class sessions.</p>';
      return;
    }
    const [y, m, d] = key.split('-').map(Number);
    const rand = seedRandom(y * 10000 + m * 100 + d + 7);
    const dateLabel = new Date(y, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const sessions = CLASS_TYPES.filter(() => rand() > 0.3).map((c) => ({
      ...c,
      seats: Math.ceil(rand() * 6) + 1,
      time: rand() > 0.5 ? '9:00 AM' : '1:00 PM',
    }));
    if (!sessions.length) {
      sessionsPanel.innerHTML = `<p class="hint">No sessions scheduled for ${dateLabel}. Try another available date.</p>`;
      return;
    }
    sessionsPanel.innerHTML = `
      <h3 class="h3" style="margin-bottom: var(--space-4);">${dateLabel}</h3>
      ${sessions
        .map(
          (s, i) => `
        <div class="session-card">
          <div class="session-card-info">
            <h4>${s.name}</h4>
            <p>${s.time} &middot; ${s.duration} &middot; $${s.price}</p>
          </div>
          <span class="session-seats" style="color:${s.seats <= 2 ? 'var(--color-warning)' : 'var(--color-success)'}">${s.seats} seats left</span>
          <button type="button" class="btn btn-secondary btn-sm" data-book-session="${i}">Book seat</button>
        </div>
      `
        )
        .join('')}
    `;
  }

  calGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-date]');
    if (!btn || btn.disabled) return;
    selectedDateKey = btn.getAttribute('data-date');
    renderCalendar();
    renderSessions(selectedDateKey);
  });

  sessionsPanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-book-session]');
    if (!btn) return;
    btn.textContent = 'Booked ✓';
    btn.disabled = true;
    bookingSuccess.classList.add('is-visible');
    bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => bookingSuccess.classList.remove('is-visible'), 8000);
  });

  document.getElementById('cal-prev').addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    renderCalendar();
  });

  renderCalendar();
});
