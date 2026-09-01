/* popup.js — storage toggle and theme controls */

const toggle     = document.getElementById('toggle');
const dot        = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const btnDark    = document.getElementById('theme-dark');
const btnLight   = document.getElementById('theme-light');

// Read current preferences
chrome.storage.local.get({ reskinEnabled: true, theme: 'dark' }, (res) => {
  setUI(res.reskinEnabled !== false);
  setThemeUI(res.theme || 'dark');
});

// On toggle click → save to storage
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ reskinEnabled: enabled });
  setUI(enabled);
});

// Theme switcher
btnDark.addEventListener('click', () => {
  chrome.storage.local.set({ theme: 'dark' });
  setThemeUI('dark');
});

btnLight.addEventListener('click', () => {
  chrome.storage.local.set({ theme: 'light' });
  setThemeUI('light');
});

function setUI(enabled) {
  toggle.checked = enabled;
  dot.classList.toggle('active', enabled);
  statusText.textContent = enabled ? 'Reskin active' : 'Reskin disabled';
}

function setThemeUI(theme) {
  btnDark.classList.toggle('active', theme === 'dark');
  btnLight.classList.toggle('active', theme === 'light');
}
