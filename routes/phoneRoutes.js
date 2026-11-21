const express = require('express');
const router = express.Router();
const phoneService = require('../services/phoneService');

/**
 * POST /api/validate
 * Validates and formats a phone number according to international telecommunication standards
 * Request Body:
 * {
 *   "phone": "+919876543210",
 *   "country": "IN" // optional fallback country code
 * }
 */
router.post('/validate', (req, res) => {
  try {
    const { phone, country } = req.body;

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required and must be a non-empty string.'
      });
    }

    // Protect against excessively long inputs
    if (phone.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Phone number input is too long (maximum 50 characters allowed).'
      });
    }

    const validationResult = phoneService.validatePhoneNumber(phone, country);

    // Return the required specification response structure
    return res.status(200).json({
      success: true,
      valid: validationResult.valid,
      possible: validationResult.possible,
      country: validationResult.country,
      countryName: validationResult.countryName,
      callingCode: validationResult.callingCode,
      nationalNumber: validationResult.nationalNumber,
      internationalFormat: validationResult.internationalFormat,
      nationalFormat: validationResult.nationalFormat,
      e164Format: validationResult.e164Format,
      type: validationResult.type,
      uri: validationResult.uri,
      error: validationResult.error || null
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'An internal error occurred while validating the phone number.'
    });
  }
});

/**
 * GET /api/countries
 * Returns list of supported countries, codes, and names
 */
router.get('/countries', (req, res) => {
  try {
    const countries = phoneService.getSupportedCountries();
    return res.status(200).json({
      success: true,
      count: countries.length,
      countries
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve countries list.'
    });
  }
});

/**
 * POST /api/format-live
 * Live As-You-Type formatting endpoint
 */
router.post('/format-live', (req, res) => {
  try {
    const { phone, country } = req.body;
    if (!phone) {
      return res.status(200).json({ formatted: '' });
    }
    const formatted = phoneService.formatAsYouType(phone, country);
    return res.status(200).json({
      success: true,
      formatted
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to format phone number.'
    });
  }
});

module.exports = router;
