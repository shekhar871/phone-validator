# Global Phone Number Validator 🌍📞

A modern, full-stack international phone number validation and formatting application built with **Node.js**, **Express.js**, **Vanilla JavaScript**, and Google's official telecom standard port **`libphonenumber-js`**.

---

## ✨ Features

- **Accurate International Validation:** Built on `libphonenumber-js`, adhering to ITU-T international numbering plans (E.164, E.123).
- **Country Detection:** Automatically detects country names, ISO 3166-1 alpha-2 codes, calling prefixes, and flag emojis from raw or formatted phone inputs.
- **Multiple Standardized Formats:**
  - **International format:** (e.g., `+91 98765 43210`)
  - **National format:** (e.g., `098765 43210`)
  - **E.164 format:** (e.g., `+919876543210`)
  - **National number / Significant digits:** (e.g., `9876543210`)
- **Country Selector with Calling Codes:** Interactive searchable dropdown covering 245+ countries worldwide.
- **Real-Time As-You-Type Formatting:** Formats numbers dynamically as users type.
- **1-Click Copy:** Seamlessly copy formatted strings to the clipboard with visual feedback.
- **Form Reset & Quick Samples:** Test numbers from India, United States, United Kingdom, Germany, Japan, and invalid samples with one click.
- **Clean Dashboard UI:**
  - Dark mode and light mode support with persistent state.
  - Distinct green/red indicators for valid vs. invalid phone numbers.
  - Full JSON payload inspector.
  - Fully responsive and mobile-friendly design.
- **Privacy & Security First:** No phone numbers are stored, logged, or retained on the server.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Modern CSS (CSS custom properties, glassmorphism, responsive CSS Grid/Flexbox), Vanilla JavaScript (ES6+), Fetch API.
- **Backend:** Node.js, Express.js.
- **Phone Validation Engine:** `libphonenumber-js`.

---

## 📁 Project Structure

```
phone-validator/
├── public/
│   ├── index.html        # Main dashboard interface
│   ├── style.css         # Responsive styling & themes
│   ├── script.js         # Frontend application logic & API integration
│   └── countries.json    # Precompiled ISO country data, codes & flags
├── routes/
│   └── phoneRoutes.js    # Express REST API routes
├── services/
│   └── phoneService.js   # Phone validation and formatting service
├── server.js             # Express server entry point
├── package.json          # Node.js dependencies & scripts
└── README.md             # Documentation and setup instructions
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v16 or later) and **npm** installed on your machine.

### Installation

1. Navigate to the project directory:
   ```bash
   cd phone-validator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📡 API Reference

### 1. Validate Phone Number

- **Endpoint:** `POST /api/validate`
- **Content-Type:** `application/json`

#### Request Payload:
```json
{
  "phone": "+919876543210",
  "country": "IN"
}
```
*(Note: `country` is optional if the phone number includes an international `+` prefix).*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "valid": true,
  "possible": true,
  "country": "IN",
  "countryName": "India",
  "callingCode": "91",
  "nationalNumber": "9876543210",
  "internationalFormat": "+91 98765 43210",
  "nationalFormat": "098765 43210",
  "e164Format": "+919876543210",
  "type": "MOBILE",
  "uri": "tel:+919876543210",
  "error": null
}
```

#### Invalid / Malformed Number Response (`200 OK` with `valid: false`):
```json
{
  "success": true,
  "valid": false,
  "possible": false,
  "country": null,
  "countryName": null,
  "callingCode": null,
  "nationalNumber": null,
  "internationalFormat": null,
  "nationalFormat": null,
  "e164Format": null,
  "error": "Invalid phone number structure or unsupported country code"
}
```

### 2. Supported Countries

- **Endpoint:** `GET /api/countries`
- Returns an array of supported countries with their ISO code, name, and calling code.

### 3. As-You-Type Live Formatting

- **Endpoint:** `POST /api/format-live`
- **Request Body:** `{ "phone": "202555", "country": "US" }`
- **Response:** `{ "success": true, "formatted": "(202) 555" }`

---

## 🔒 Security & Privacy

- **Zero-Storage Policy:** No telephone numbers, query parameters, or personal data are stored in any database or written to disk.
- **Input Validation:** Input character limits (max 50 characters) and type checks mitigate payload abuse or regex denial-of-service vulnerabilities.
- **CORS & JSON Body Limit:** Express configured with reasonable payload thresholds and CORS protection.
