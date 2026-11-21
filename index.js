const phoneService = require('./services/phoneService');

module.exports = {
  validatePhoneNumber: phoneService.validatePhoneNumber,
  getSupportedCountries: phoneService.getSupportedCountries,
  formatAsYouType: phoneService.formatAsYouType,
  getCountryName: phoneService.getCountryName
};
