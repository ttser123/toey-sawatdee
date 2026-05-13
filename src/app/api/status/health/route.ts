// src/app/api/status/health/route.ts
// Lightweight health checks — no AWS SDK required.
// All probes use publicly accessible endpoints or internal API routes.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface HealthResult {
  cognito: { status: string; latency: number | null };
  cloudfront: { status: string; latency: number | null };
  api: { status: string; latency: number | null };
  app: { status: string; version: string; env: string };
}

async function probe(url: string, timeoutMs = 5000): Promise<{ ok: boolean; latency: number }> {
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    return { ok: res.ok || res.status === 405, latency: Date.now() - start };
  } catch {
    return { ok: false, latency: Date.now() - start };
  }
}

export async function GET() {
  const results: HealthResult = {
    cognito: { status: 'unknown', latency: null },
    cloudfront: { status: 'unknown', latency: null },
    api: { status: 'unknown', latency: null },
    app: {
      status: 'operational',
      version: process.env.GITHUB_SHA?.substring(0, 7) || 'dev-local',
      env: process.env.NODE_ENV || 'unknown',
    },
  };

  // 1. Cognito — probe the OIDC well-known endpoint (public, free, idempotent)
  const cognitoPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  if (cognitoPoolId) {
    const region = cognitoPoolId.split('_')[0];
    const url = `https://cognito-idp.${region}.amazonaws.com/${cognitoPoolId}/.well-known/openid-configuration`;
    const { ok, latency } = await probe(url);
    results.cognito = { status: ok ? 'operational' : 'outage', latency };
  }

  // 2. CloudFront — verify the app is reachable via the CDN domain
  const cfDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://toey-sawatdee.me';
  {
    const { ok, latency } = await probe(cfDomain);
    results.cloudfront = { status: ok ? 'operational' : 'outage', latency };
  }

  // 3. API Gateway / Lambda — probe the visitor counter endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const { ok, latency } = await probe(apiUrl);
    results.api = { status: ok ? 'operational' : 'outage', latency };
  }

  return NextResponse.json(results);
}
