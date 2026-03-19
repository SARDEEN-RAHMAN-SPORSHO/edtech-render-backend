const express = require('express');
const cors = require('cors');

const getIpRoute = require('./routes/getIp');
// Future routes: just import and app.use() them here
// e.g. const newRoute = require('./routes/newRoute');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://edtech-dashboard-alpha.vercel.app',
  // Add preview or custom domains here as needed
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// ─── Health check (ping via UptimeRobot every 14 min to prevent cold starts) ──
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', getIpRoute);
// Future routes: app.use('/api', newRoute);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Render backend running on port ${PORT}`);
});
