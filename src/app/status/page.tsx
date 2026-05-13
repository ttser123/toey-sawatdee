// src/app/status/page.tsx — Server Component wrapper for dynamic rendering
// Uses connection() to opt into dynamic rendering, preventing CloudFront
// from caching stale HTML on hard refresh (F5).
import { connection } from 'next/server';
import StatusDashboard from './StatusDashboard';

export default async function StatusPage() {
  // Force this page to be dynamically rendered on every request.
  // Without this, Next.js treats it as static and sets
  // Cache-Control: s-maxage=31536000, causing CloudFront to serve stale HTML.
  await connection();

  return <StatusDashboard />;
}
