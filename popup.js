/* popup.js — simple storage toggle */

const toggle     = document.getElementById('toggle');
const label      = document.getElementById('toggle-label');
const dot        = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

// Read current state (default: true)
chrome.storage.local.get({ reskinEnabled: true }, ({ reskinEnabled }) => {
  setUI(reskinEnabled);
});

// On toggle click → save to storage
toggle.addEventListener('change', () => {
  const enabled = toggle.checked;
  chrome.storage.local.set({ reskinEnabled: enabled });
  setUI(enabled);
});

function setUI(enabled) {
  toggle.checked   = enabled;
  label.textContent = enabled ? 'On' : 'Off';
  label.classList.toggle('on', enabled);
  dot.classList.toggle('active', enabled);
  statusText.textContent = enabled ? 'Reskin active' : 'Reskin disabled';
}
