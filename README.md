# EcoTrace frontend

A responsive, no-build-step frontend inspired by the supplied EcoTrace UI reference. Built with HTML, CSS and vanilla JavaScript, with Leaflet + OpenStreetMap for the collection map.

## Run locally

1. Download/extract this folder.
2. Open `index.html` in a browser, or preferably serve the folder with a local static server (for example VS Code Live Server or `python -m http.server 5500`).
3. Visit `http://localhost:5500`.

Leaflet map tiles, Google Fonts and the Leaflet library require an internet connection. The UI itself is plain HTML/CSS/JS and needs no npm install or build step.

## Connect your existing backend

Open `config.js` and set `API_BASE_URL` to your backend origin, for example:

```js
window.ECOTRACE_CONFIG = {
  API_BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    scan: '/api/scan',
    centers: '/api/centers',
    activity: '/api/activity',
    impact: '/api/impact'
  },
  INCLUDE_CREDENTIALS: false,
  DEMO_FALLBACK: true
};
```

The endpoint paths are examples and can be changed to match your backend routes. The API base URL must be reachable from the browser. If the frontend and API use different origins, configure CORS on your backend for the frontend origin.

### Scan API contract

The frontend sends `POST {API_BASE_URL}{ENDPOINTS.scan}` as `multipart/form-data` with the image field named `image`.

It accepts common response shapes such as:

```json
{
  "name": "Plastic Bottle",
  "category": "Plastic",
  "material": "PET",
  "confidence": 0.96,
  "recyclable": true,
  "instructions": ["Empty and rinse", "Place in a plastic recycling bin"],
  "points_awarded": 10
}
```

The response can also be wrapped in `result`, `prediction` or `data`. If your API uses another image field name or response shape, update the `FormData.append('image', ...)` line and `normalizeScan()` in `app.js`.

### Collection centers API contract

`GET {API_BASE_URL}{ENDPOINTS.centers}` may return an array of centers, or an object containing `centers`, `results`, or `data`. Each center can use `name`, `address`, `lat`/`lng`, `type`, `materials`, `distance_km`, `hours` and `phone`. Coordinates are required to place a marker. The demo list is clearly illustrative and is not a verified directory of real centers.

### Impact API

Optional `GET {API_BASE_URL}{ENDPOINTS.impact}` can return `points`, `scans`, and an `activity` array. The frontend also stores demo activity and points in browser `localStorage`; treat that as demo-only, not secure or authoritative user data.

## Important notes

- Demo mode is enabled by default. When `API_BASE_URL` is blank, scanning produces a randomized sample result, not a real AI prediction. Set the API base URL to use your backend.
- Demo collection-center locations are illustrative sample coordinates around Indore. Replace them with real centers from your backend before public deployment.
- If the backend is not on the same origin, enable CORS for your frontend domain. Do not put private API keys or model secrets in frontend JavaScript.
- Geolocation is requested only after the user presses **Use my location**.
- Theme preference, demo points, and demo activity are saved in local browser storage.
