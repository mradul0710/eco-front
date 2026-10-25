/* EcoTrace frontend configuration.
 * Set API_BASE_URL to your backend origin (no trailing slash).
 * Example: window.ECOTRACE_CONFIG.API_BASE_URL = 'https://your-api.example.com';
 */
window.ECOTRACE_CONFIG = {
  API_BASE_URL: '', // empty = same origin; e.g. http://localhost:8000
  ENDPOINTS: {
    scan: '/api/scan',
    centers: '/api/centers',
    activity: '/api/activity',
    impact: '/api/impact'
  },
  // Set true if your API requires cookies/session credentials.
  INCLUDE_CREDENTIALS: false,
  // Demo mode shows realistic sample data if API calls fail or API_BASE_URL is empty.
  DEMO_FALLBACK: true
};
