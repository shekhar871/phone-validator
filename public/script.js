/**
 * Phone Validator Frontend Application Logic
 */

// State
let countries = [];
let selectedCountry = null; // null represents auto-detect or specific country obj
let debounceTimer = null;

// DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const phoneForm = document.getElementById('phoneForm');
const phoneInput = document.getElementById('phoneInput');
const clearBtn = document.getElementById('clearBtn');
const validateBtn = document.getElementById('validateBtn');
const resetBtn = document.getElementById('resetBtn');
const customSelect = document.getElementById('customSelect');
const selectedCountryBtn = document.getElementById('selectedCountryBtn');
const selectedFlag = document.getElementById('selectedFlag');
const selectedCountryName = document.getElementById('selectedCountryName');
const selectedCallingCode = document.getElementById('selectedCallingCode');
const countryDropdown = document.getElementById('countryDropdown');
const countrySearchInput = document.getElementById('countrySearchInput');
const countryList = document.getElementById('countryList');
const inputPrefixBadge = document.getElementById('inputPrefixBadge');
const prefixFlag = document.getElementById('prefixFlag');
const prefixCode = document.getElementById('prefixCode');
const liveStateChip = document.getElementById('liveStateChip');
const asYouTypeValue = document.getElementById('asYouTypeValue');
const emptyState = document.getElementById('emptyState');
const resultsContent = document.getElementById('resultsContent');
const overallStatusBadge = document.getElementById('overallStatusBadge');
const statusBanner = document.getElementById('statusBanner');
const bannerIcon = document.getElementById('bannerIcon');
const bannerTitle = document.getElementById('bannerTitle');
const bannerDesc = document.getElementById('bannerDesc');
const valValid = document.getElementById('valValid');
const valPossible = document.getElementById('valPossible');
const metricValidity = document.getElementById('metricValidity');
const metricPossible = document.getElementById('metricPossible');
const valCountryFlag = document.getElementById('valCountryFlag');
const valCountryCode = document.getElementById('valCountryCode');
const valCallingCode = document.getElementById('valCallingCode');
const valLargeFlag = document.getElementById('valLargeFlag');
const valCountryName = document.getElementById('valCountryName');
const valCountryMeta = document.getElementById('valCountryMeta');
const valInternationalFormat = document.getElementById('valInternationalFormat');
const valNationalFormat = document.getElementById('valNationalFormat');
const valE164Format = document.getElementById('valE164Format');
const valNationalNumber = document.getElementById('valNationalNumber');
const jsonViewer = document.getElementById('jsonViewer');
const toastContainer = document.getElementById('toastContainer');
const sampleTags = document.querySelectorAll('.sample-tag');

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchCountries();
  setupEventListeners();
});

// -----------------------------------------------------------------------------
// THEME MANAGEMENT (Light / Dark Mode)
// -----------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('pv_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('pv_theme', newTheme);
  showToast(`Switched to ${newTheme} mode`);
}

// -----------------------------------------------------------------------------
// COUNTRY DATA FETCH & DROPDOWN
// -----------------------------------------------------------------------------
async function fetchCountries() {
  try {
    const res = await fetch('/countries.json');
    if (!res.ok) throw new Error('Failed to load countries');
    countries = await res.json();
    renderCountryList(countries);
  } catch (err) {
    console.error('Error fetching countries:', err);
  }
}

function renderCountryList(list) {
  countryList.innerHTML = '';

  // Auto-detect option at the very top
  const autoDetectItem = document.createElement('li');
  autoDetectItem.className = 'country-item';
  autoDetectItem.innerHTML = `
    <span class="country-flag">🌍</span>
    <span class="country-item-name">Auto-Detect / Any Country</span>
    <span class="country-item-code">Global</span>
  `;
  autoDetectItem.addEventListener('click', () => {
    selectCountry(null);
  });
  countryList.appendChild(autoDetectItem);

  list.forEach(country => {
    const li = document.createElement('li');
    li.className = 'country-item';
    li.dataset.code = country.code;
    li.innerHTML = `
      <span class="country-flag">${country.flag}</span>
      <span class="country-item-name">${country.name}</span>
      <span class="country-item-code">${country.callingCode}</span>
    `;
    li.addEventListener('click', () => {
      selectCountry(country);
    });
    countryList.appendChild(li);
  });
}

function selectCountry(country) {
  selectedCountry = country;
  closeDropdown();

  if (!country) {
    selectedFlag.textContent = '🌍';
    selectedCountryName.textContent = 'Auto-Detect / Select Country';
    selectedCallingCode.textContent = '';
    prefixFlag.textContent = '🌐';
    prefixCode.textContent = '+';
  } else {
    selectedFlag.textContent = country.flag;
    selectedCountryName.textContent = country.name;
    selectedCallingCode.textContent = country.callingCode;
    prefixFlag.textContent = country.flag;
    prefixCode.textContent = country.callingCode;
  }

  // Update real-time formatting with new country context if number exists
  if (phoneInput.value.trim()) {
    triggerAsYouTypeFormat(phoneInput.value.trim());
  }
}

function filterCountries(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    renderCountryList(countries);
    return;
  }
  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.callingCode.toLowerCase().includes(q)
  );
  renderCountryList(filtered);
}

function openDropdown() {
  customSelect.classList.add('open');
  selectedCountryBtn.setAttribute('aria-expanded', 'true');
  countrySearchInput.focus();
}

function closeDropdown() {
  customSelect.classList.remove('open');
  selectedCountryBtn.setAttribute('aria-expanded', 'false');
  countrySearchInput.value = '';
  renderCountryList(countries);
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------------------------
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Country Dropdown Toggles
  selectedCountryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (customSelect.classList.contains('open')) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  countrySearchInput.addEventListener('input', (e) => {
    filterCountries(e.target.value);
  });

  countrySearchInput.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
      closeDropdown();
    }
  });

  // Phone Input Actions
  phoneInput.addEventListener('input', () => {
    const val = phoneInput.value;
    clearBtn.classList.toggle('hidden', val.length === 0);

    // Live typing formatting and status
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerAsYouTypeFormat(val);
    }, 150);
  });

  phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validatePhoneNumber();
    }
  });

  clearBtn.addEventListener('click', () => {
    phoneInput.value = '';
    clearBtn.classList.add('hidden');
    asYouTypeValue.textContent = '—';
    phoneInput.focus();
  });

  // Action Buttons
  validateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    validatePhoneNumber();
  });

  resetBtn.addEventListener('click', resetAll);

  // Quick Samples
  sampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const phone = tag.getAttribute('data-phone');
      const countryCode = tag.getAttribute('data-country');
      
      const foundCountry = countries.find(c => c.code === countryCode);
      if (foundCountry) {
        selectCountry(foundCountry);
      }
      
      phoneInput.value = phone;
      clearBtn.classList.remove('hidden');
      triggerAsYouTypeFormat(phone);
      validatePhoneNumber();
    });
  });

  // Copy Buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const el = document.getElementById(targetId);
      if (el && el.textContent) {
        copyToClipboard(el.textContent, btn);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// LIVE FORMATTING (As-You-Type)
// -----------------------------------------------------------------------------
async function triggerAsYouTypeFormat(text) {
  if (!text || !text.trim()) {
    asYouTypeValue.textContent = '—';
    liveStateChip.textContent = 'Idle';
    liveStateChip.style.color = 'var(--text-muted)';
    return;
  }

  liveStateChip.textContent = 'Typing...';
  liveStateChip.style.color = 'var(--primary-accent)';

  try {
    const res = await fetch('/api/format-live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: text,
        country: selectedCountry ? selectedCountry.code : null
      })
    });

    if (res.ok) {
      const data = await res.json();
      asYouTypeValue.textContent = data.formatted || text;
    }
  } catch (err) {
    // Fail silently on live format
    asYouTypeValue.textContent = text;
  }
}

// -----------------------------------------------------------------------------
// CORE VALIDATION REQUEST
// -----------------------------------------------------------------------------
async function validatePhoneNumber() {
  const rawInput = phoneInput.value.trim();

  if (!rawInput) {
    showToast('Please enter a phone number', 'error');
    phoneInput.focus();
    return;
  }

  // Set loading state on button
  validateBtn.disabled = true;
  validateBtn.innerHTML = `
    <svg class="spinner" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    <span>Validating...</span>
  `;

  try {
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: rawInput,
        country: selectedCountry ? selectedCountry.code : null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server validation failed');
    }

    displayValidationResults(data);
  } catch (err) {
    showToast(err.message || 'Error validating phone number', 'error');
    displayErrorState(err.message);
  } finally {
    validateBtn.disabled = false;
    validateBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Validate Number</span>
    `;
  }
}

// -----------------------------------------------------------------------------
// DISPLAY RESULTS & UI SYNC
// -----------------------------------------------------------------------------
function displayValidationResults(data) {
  emptyState.classList.add('hidden');
  resultsContent.classList.remove('hidden');

  const isValid = !!data.valid;
  const isPossible = !!data.possible;

  // Header & Live indicator
  overallStatusBadge.className = `live-indicator ${isValid ? 'valid' : 'invalid'}`;
  overallStatusBadge.innerHTML = `
    <span class="pulse-indicator"></span>
    ${isValid ? 'Active & Valid' : 'Invalid Number'}
  `;

  liveStateChip.textContent = isValid ? 'Valid' : 'Invalid';
  liveStateChip.style.color = isValid ? 'var(--success-color)' : 'var(--error-color)';

  // Status Banner
  statusBanner.className = `status-banner ${isValid ? 'valid' : 'invalid'}`;
  bannerIcon.textContent = isValid ? '✓' : '✕';
  bannerTitle.textContent = isValid ? 'Valid Phone Number' : 'Invalid Phone Number';
  bannerDesc.textContent = isValid
    ? 'Phone number strictly matches international dial plan and length rules.'
    : (data.error || 'Number does not correspond to a valid telecom prefix or length.');

  // Metric Boxes
  metricValidity.className = `metric-box ${isValid ? 'valid' : 'invalid'}`;
  valValid.textContent = isValid ? 'YES' : 'NO';

  metricPossible.className = `metric-box ${isPossible ? 'valid' : 'invalid'}`;
  valPossible.textContent = isPossible ? 'YES' : 'NO';

  const countryIso = data.country || (selectedCountry ? selectedCountry.code : '??');
  const matchedCountry = countries.find(c => c.code === countryIso);
  const flagEmoji = matchedCountry ? matchedCountry.flag : (getFlagEmoji(countryIso) || '🌍');

  valCountryFlag.textContent = flagEmoji;
  valCountryCode.textContent = data.country || 'N/A';
  valCallingCode.textContent = data.callingCode ? `+${data.callingCode}` : 'N/A';

  // Country Detail Card
  valLargeFlag.textContent = flagEmoji;
  valCountryName.textContent = data.countryName || 'Unknown / International';
  valCountryMeta.textContent = `ISO Code: ${data.country || 'N/A'} • Calling Prefix: ${data.callingCode ? '+' + data.callingCode : 'N/A'}`;

  // If detected country differs and wasn't manually forced, sync selector prefix
  if (data.country && (!selectedCountry || selectedCountry.code !== data.country)) {
    prefixFlag.textContent = flagEmoji;
    prefixCode.textContent = data.callingCode ? `+${data.callingCode}` : '+';
  }

  // Format Outputs
  valInternationalFormat.textContent = data.internationalFormat || 'N/A';
  valNationalFormat.textContent = data.nationalFormat || 'N/A';
  valE164Format.textContent = data.e164Format || 'N/A';
  valNationalNumber.textContent = data.nationalNumber || 'N/A';

  // Full JSON View
  jsonViewer.innerHTML = `<code>${syntaxHighlight(JSON.stringify(data, null, 2))}</code>`;
}

function displayErrorState(errorMessage) {
  emptyState.classList.add('hidden');
  resultsContent.classList.remove('hidden');

  overallStatusBadge.className = 'live-indicator invalid';
  overallStatusBadge.innerHTML = `
    <span class="pulse-indicator"></span>
    Invalid
  `;

  liveStateChip.textContent = 'Error';
  liveStateChip.style.color = 'var(--error-color)';

  statusBanner.className = 'status-banner invalid';
  bannerIcon.textContent = '✕';
  bannerTitle.textContent = 'Invalid Input';
  bannerDesc.textContent = errorMessage;

  metricValidity.className = 'metric-box invalid';
  valValid.textContent = 'NO';
  metricPossible.className = 'metric-box invalid';
  valPossible.textContent = 'NO';

  valCountryFlag.textContent = '❌';
  valCountryCode.textContent = 'ERR';
  valCallingCode.textContent = '--';

  valLargeFlag.textContent = '⚠️';
  valCountryName.textContent = 'Validation Failed';
  valCountryMeta.textContent = errorMessage;

  valInternationalFormat.textContent = 'N/A';
  valNationalFormat.textContent = 'N/A';
  valE164Format.textContent = 'N/A';
  valNationalNumber.textContent = 'N/A';

  jsonViewer.innerHTML = `<code>${syntaxHighlight(JSON.stringify({ valid: false, error: errorMessage }, null, 2))}</code>`;
}

// -----------------------------------------------------------------------------
// RESET FORM & RESULTS
// -----------------------------------------------------------------------------
function resetAll() {
  phoneInput.value = '';
  clearBtn.classList.add('hidden');
  asYouTypeValue.textContent = '—';
  liveStateChip.textContent = 'Idle';
  liveStateChip.style.color = 'var(--text-muted)';
  selectCountry(null);

  resultsContent.classList.add('hidden');
  emptyState.classList.remove('hidden');

  overallStatusBadge.className = 'live-indicator';
  overallStatusBadge.innerHTML = `
    <span class="pulse-indicator"></span>
    Awaiting Input
  `;

  showToast('Reset completed');
  phoneInput.focus();
}

// -----------------------------------------------------------------------------
// CLIPBOARD COPY
// -----------------------------------------------------------------------------
function copyToClipboard(text, buttonEl) {
  if (!text || text === 'N/A' || text === '--') return;

  navigator.clipboard.writeText(text).then(() => {
    const originalText = buttonEl.innerHTML;
    buttonEl.classList.add('copied');
    buttonEl.innerHTML = `
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copied!</span>
    `;

    showToast(`Copied: ${text}`);

    setTimeout(() => {
      buttonEl.classList.remove('copied');
      buttonEl.innerHTML = originalText;
    }, 1800);
  }).catch(err => {
    console.error('Clipboard copy error:', err);
    showToast('Failed to copy', 'error');
  });
}

// -----------------------------------------------------------------------------
// TOAST NOTIFICATIONS
// -----------------------------------------------------------------------------
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'error' ? '⚠️' : '✓';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

// -----------------------------------------------------------------------------
// UTILITIES
// -----------------------------------------------------------------------------
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function syntaxHighlight(json) {
  if (!json) return '';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
