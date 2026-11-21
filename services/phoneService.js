const {
  parsePhoneNumberFromString,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  AsYouType
} = require('libphonenumber-js');

// Map country code (ISO 3166-1 alpha-2) to full English country name using Intl.DisplayNames if available
const displayNames = typeof Intl !== 'undefined' && Intl.DisplayNames
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

/**
 * Helper to get country name safely
 * @param {string} isoCode 
 * @returns {string}
 */
function getCountryName(isoCode) {
  if (!isoCode) return 'Unknown';
  try {
    if (displayNames) {
      return displayNames.of(isoCode.toUpperCase()) || isoCode;
    }
  } catch (e) {
    // Fallback if not recognized
  }
  return isoCode;
}

/**
 * Returns a list of supported countries with their ISO codes, calling codes, and names
 */
function getSupportedCountries() {
  const countries = getCountries();
  return countries.map((iso) => {
    let callingCode = '';
    try {
      callingCode = getCountryCallingCode(iso);
    } catch (e) {
      callingCode = '';
    }
    return {
      isoCode: iso,
      name: getCountryName(iso),
      callingCode: callingCode ? `+${callingCode}` : ''
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Validate and format a phone number
 * @param {string} phoneRaw - The input phone number string
 * @param {string} [defaultCountry] - Optional ISO 2-letter country code fallback
 */
function validatePhoneNumber(phoneRaw, defaultCountry = null) {
  if (!phoneRaw || typeof phoneRaw !== 'string' || !phoneRaw.trim()) {
    throw new Error('Phone number is required');
  }

  const trimmed = phoneRaw.trim();
  const countryParam = defaultCountry ? String(defaultCountry).toUpperCase().trim() : undefined;

  // Attempt parsing with libphonenumber-js
  const phoneNumber = parsePhoneNumberFromString(trimmed, countryParam);

  if (!phoneNumber) {
    // If libphonenumber cannot even parse a basic prefix or structure
    return {
      valid: false,
      possible: false,
      country: null,
      countryName: null,
      callingCode: null,
      nationalNumber: null,
      internationalFormat: null,
      nationalFormat: null,
      e164Format: null,
      type: null,
      error: 'Invalid phone number structure or unsupported country code'
    };
  }

  const isValid = phoneNumber.isValid();
  const isPossible = phoneNumber.isPossible();
  const isoCountry = phoneNumber.country || null;
  const callingCode = phoneNumber.countryCallingCode || null;
  const nationalNumber = phoneNumber.nationalNumber || null;
  const internationalFormat = phoneNumber.formatInternational();
  const nationalFormat = phoneNumber.formatNational();
  const e164Format = phoneNumber.format('E.164');
  const numberType = phoneNumber.getType() || 'UNKNOWN';

  return {
    valid: isValid,
    possible: isPossible,
    country: isoCountry,
    countryName: isoCountry ? getCountryName(isoCountry) : null,
    callingCode: callingCode,
    nationalNumber: nationalNumber,
    internationalFormat: internationalFormat,
    nationalFormat: nationalFormat,
    e164Format: e164Format,
    type: numberType,
    uri: phoneNumber.getURI ? phoneNumber.getURI() : `tel:${e164Format}`
  };
}

/**
 * Formats a phone number in real-time as the user types
 * @param {string} text - current input
 * @param {string} [defaultCountry] - optional country code
 */
function formatAsYouType(text, defaultCountry = null) {
  if (!text) return '';
  const countryParam = defaultCountry ? String(defaultCountry).toUpperCase().trim() : undefined;
  const asYouType = new AsYouType(countryParam);
  return asYouType.input(text);
}

module.exports = {
  validatePhoneNumber,
  getSupportedCountries,
  formatAsYouType,
  getCountryName
};
