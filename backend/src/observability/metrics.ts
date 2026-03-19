import { Request, Response, NextFunction } from "express";
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client";

const METRICS_ENABLED = process.env.ENABLE_METRICS === "true";

const registry = new Registry();

if (METRICS_ENABLED) {
  collectDefaultMetrics({ register: registry });
}

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [registry],
});

const httpRequestDurationMs = new Histogram({
  name: "http_request_duration_ms",
  help: "Request duration in milliseconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!METRICS_ENABLED) {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const route = req.route?.path ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, durationMs);
  });

  return next();
};

export const registerMetricsEndpoint = (app: { get: (path: string, handler: (req: Request, res: Response) => Promise<void>) => void; }) => {
  if (!METRICS_ENABLED) {
    return;
  }

  app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", registry.contentType);
    res.send(await registry.metrics());
  });
};
