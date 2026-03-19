const express = require('express');
const router = express.Router();

// ─── GET /api/get-ip ──────────────────────────────────────────────────────────
// Returns the real client IP + geo info (city, country)
// Called from authService.ts → getClientIpAndGeo() on every login
router.get('/get-ip', async (req, res) => {
  try {
    // x-forwarded-for may be a comma-separated list — first entry is the real client IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    let city = 'Unknown';
    let country = 'Unknown';

    if (ip && ip !== 'unknown') {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          city = geoData.city || 'Unknown';
          country = geoData.country_name || 'Unknown';
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
