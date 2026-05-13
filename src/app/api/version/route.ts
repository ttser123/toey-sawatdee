import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: process.env.GITHUB_SHA || 'dev-local',
    build_time: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
  });
}
