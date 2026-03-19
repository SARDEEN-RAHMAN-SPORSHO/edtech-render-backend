const express = require('express');
const router = express.Router();

// ─── GET /api/get-ip ──────────────────────────────────────────────────────────
// Accepts ?ip= query param (real client IP fetched directly in browser).
// Does geo lookup server-side via ip-api.com (handles IPv4 + IPv6, free, no key).
// Called from authService.ts → getClientIpAndGeo() on every login.
router.get('/get-ip', async (req, res) => {
  try {
    const ip = req.query.ip || 'unknown';

    let city = 'Unknown';
    let country = 'Unknown';

    if (ip && ip !== 'unknown') {
      try {
        // ip-api.com handles both IPv4 and IPv6, free, no API key needed
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === 'success') {
            city = geoData.city || 'Unknown';
            country = geoData.country || 'Unknown';
          }
        }
      } catch {
        // Geo lookup is best-effort — never fail the whole request
      }
    }

    res.status(200).json({ ip, city, country });
  } catch {
    res.status(200).json({ ip: 'unknown', city: 'Unknown', country: 'Unknown' });
  }
});

module.exports = router;
