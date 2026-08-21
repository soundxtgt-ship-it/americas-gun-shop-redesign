/* contact.js — mock contact form submission */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    setTimeout(() => {
      success.classList.add('is-visible');
      form.reset();
      btn.disabled = false;
      btn.textContent = 'Send message';
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 700);
  });
});
