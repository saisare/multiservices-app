require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const PROXY_TIMEOUT_MS = Number(process.env.PROXY_TIMEOUT_MS || 15000);
const HEALTH_TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS || 3000);

const startedAt = Date.now();
const metrics = {
  requestsTotal: 0,
  responsesByStatus: {},
  upstreamErrorsTotal: 0,
  upstreamByService: {},
};

const gatewaySecret = process.env.JWT_SECRET || 'jwt_secret_microservices_blg_engineering_2026';
const gatewayFallbackSecret = 'gateway_secret_key_2026_microservice';

function bumpCounter(map, key) {
  map[key] = (map[key] || 0) + 1;
}

function nowIso() {
  return new Date().toISOString();
}

function log(level, message, meta = {}) {
  const payload = {
    ts: nowIso(),
    level,
    service: 'api-gateway',
    message,
    ...meta,
  };
  console.log(JSON.stringify(payload));
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const started = Date.now();
  metrics.requestsTotal += 1;
  res.on('finish', () => {
    bumpCounter(metrics.responsesByStatus, String(res.statusCode));
    log('info', 'request_completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started,
    });
  });

  next();
});

// Services mapping
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  btp: process.env.BTP_SERVICE_URL || 'http://localhost:3003',
  assurances: process.env.ASSURANCES_SERVICE_URL || 'http://localhost:3004',
  communication: process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3005',
  rh: process.env.RH_SERVICE_URL || 'http://localhost:3006',
  voyage: process.env.VOYAGE_SERVICE_URL || 'http://localhost:3009',
  logistique: process.env.LOGISTIQUE_SERVICE_URL || 'http://localhost:3008',
};

async function probeService(name, baseUrl) {
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      headers: { 'x-request-id': crypto.randomUUID() },
    });
    return {
      name,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      status: 0,
      latencyMs: Date.now() - started,
      error: error.message,
    };
  }
}

// Liveness check
app.get('/health', (req, res) => {
  res.json({
    gateway: 'OK',
    host: HOST,
    port: PORT,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    services: Object.keys(services),
    memory: process.memoryUsage(),
    timestamp: nowIso(),
  });
});

// Readiness check with active probing
app.get('/ready', async (req, res) => {
  const results = await Promise.all(
    Object.entries(services).map(([name, url]) => probeService(name, url))
  );

  const allOk = results.every((item) => item.ok);
  const statusCode = allOk ? 200 : 503;

  res.status(statusCode).json({
    ready: allOk,
    checkedAt: nowIso(),
    timeoutMs: HEALTH_TIMEOUT_MS,
    services: results,
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    requestsTotal: metrics.requestsTotal,
    responsesByStatus: metrics.responsesByStatus,
    upstreamErrorsTotal: metrics.upstreamErrorsTotal,
    upstreamByService: metrics.upstreamByService,
    uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: nowIso(),
  });
});

// Auth middleware - Valide le token pour l'accÃ¨s au gateway
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ error: 'Token requis', requestId: req.requestId });
  
  // Le gateway n'a qu'un rÃ´le de proxy - la vraie validation se fait dans chaque service
  // avec son propre JWT_SECRET
  try {
    try {
      jwt.verify(token, gatewaySecret);
    } catch (firstErr) {
      jwt.verify(token, gatewayFallbackSecret);
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide au gateway', requestId: req.requestId });
  }
};

function buildProxy(serviceName, target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    xfwd: true,
    timeout: PROXY_TIMEOUT_MS,
    proxyTimeout: PROXY_TIMEOUT_MS,
    onProxyReq: (proxyReq, req) => {
      proxyReq.setHeader('x-request-id', req.requestId || crypto.randomUUID());
      proxyReq.setHeader('x-forwarded-by', 'api-gateway');
    },
    onProxyRes: (proxyRes) => {
      bumpCounter(metrics.upstreamByService, `${serviceName}:${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      metrics.upstreamErrorsTotal += 1;
      bumpCounter(metrics.upstreamByService, `${serviceName}:error`);
      log('error', 'proxy_error', {
        requestId: req.requestId,
        service: serviceName,
        path: req.originalUrl,
        error: err.message,
      });

      if (!res.headersSent) {
        res.status(502).json({
          error: 'Service indisponible',
          service: serviceName,
          requestId: req.requestId,
        });
      }
    },
  });
}

// Routes proxy
app.use('/api/auth/**', buildProxy('auth', services.auth, { '^/api/auth': '/api/auth' }));

app.use('/api/btp/**', authMiddleware, buildProxy('btp', services.btp, { '^/api/btp': '' }));

app.use('/api/assurances/**', authMiddleware, buildProxy('assurances', services.assurances, { '^/api/assurances': '' }));

app.use('/api/communication/**', authMiddleware, buildProxy('communication', services.communication, { '^/api/communication': '' }));

app.use('/api/rh/**', authMiddleware, buildProxy('rh', services.rh, { '^/api/rh': '' }));

app.use('/api/voyage/**', authMiddleware, buildProxy('voyage', services.voyage, { '^/api/voyage': '/api/voyage' }));

app.use('/api/logistique/**', authMiddleware, buildProxy('logistique', services.logistique, { '^/api/logistique': '' }));

// Services list
app.get('/api/services', (req, res) => {
  res.json({ services, timestamp: nowIso() });
});

const server = app.listen(PORT, HOST, () => {
  log('info', 'gateway_started', {
    port: PORT,
    host: HOST,
    health: `http://localhost:${PORT}/health`,
    ready: `http://localhost:${PORT}/ready`,
    metrics: `http://localhost:${PORT}/metrics`,
  });
});

server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 65000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 70000);

function shutdown(signal) {
  log('warn', 'gateway_shutdown_signal', { signal });
  server.close(() => {
    log('info', 'gateway_shutdown_complete');
    process.exit(0);
  });

  setTimeout(() => {
    log('error', 'gateway_force_exit');
    process.exit(1);
  }, Number(process.env.SHUTDOWN_TIMEOUT_MS || 10000)).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));


