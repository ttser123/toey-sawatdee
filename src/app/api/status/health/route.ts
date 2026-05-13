import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import os from 'os';
import v8 from 'v8';
import { execSync } from 'child_process';
import { performance, PerformanceObserver } from 'perf_hooks';

// SRE Rule: Micro-caching (5s) for high-traffic stability
export const revalidate = 5;

// Global state to track GC duration (Only works on persistent environments like EC2)
let lastGCDuration = 0;
try {
  const obs = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0];
    if (entry) lastGCDuration = entry.duration;
  });
  obs.observe({ entryTypes: ['gc'], buffered: true });
} catch (e) {
  // PerformanceObserver might not be fully supported in all environments
}

interface ProbeResult {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
  latency: number | null;
}

interface APMResponse {
  kernel: {
    uptime: number;
    arch: string;
    cores: number;
    load: number[];
    memory: { active: number; total: number };
    diskUsage: string;
  };
  node: {
    version: string;
    heapLimit: number;
    heapTotal: number;
    heapUsed: number;
    elu: number; // Event Loop Utilization %
    lastGC: number; // Last GC duration in ms
  };
  fingerprint: {
    ip: string;
    ua: string;
    pop: string;
    country: string;
    tls: string;
  };
  egress: ProbeResult[];
  pipeline: {
    commit: string;
    env: string;
  };
  timestamp: string;
}

async function runProbe(name: string, url: string, parser?: (data: any) => 'UP' | 'DOWN' | 'DEGRADED'): Promise<ProbeResult> {
  const start = Date.now();
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 3000);

  try {
    const res = await fetch(url, { method: 'GET', signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timeout);
    const data = url.endsWith('.json') ? await res.json() : null;
    return {
      name,
      status: parser ? parser(data) : (res.ok ? 'UP' : 'DOWN'),
      latency: Date.now() - start,
    };
  } catch {
    return { name, status: 'DOWN', latency: Date.now() - start };
  }
}

export async function GET() {
  const headerList = await headers();
  const cognitoPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  
  // V8 Heap Stats
  const heapStats = v8.getHeapStatistics();
  const toMB = (bytes: number) => Math.floor(bytes / (1024 * 1024));

  // Event Loop Utilization
  const elu = performance.eventLoopUtilization().utilization * 100;

  // Parallel Egress Probes
  const probes = await Promise.allSettled([
    cognitoPoolId 
      ? runProbe('AWS_COGNITO', `https://cognito-idp.${cognitoPoolId.split('_')[0]}.amazonaws.com/${cognitoPoolId}/.well-known/openid-configuration`)
      : Promise.resolve({ name: 'AWS_COGNITO', status: 'UNKNOWN', latency: null }),
    runProbe('GITHUB_GLOBAL', 'https://www.githubstatus.com/api/v2/status.json', (d) => {
      const ind = d?.status?.indicator;
      return ind === 'none' ? 'UP' : ind === 'minor' ? 'DEGRADED' : 'DOWN';
    }),
  ]);

  const egress = probes.map(p => p.status === 'fulfilled' ? p.value : { name: 'PROBE_ERR', status: 'DOWN', latency: null }) as ProbeResult[];

  // Disk Usage (Linux Fallback)
  let diskUsage = 'N/A';
  try {
    diskUsage = execSync("df -h / | awk 'NR==2 {print $5}'", { timeout: 1000 }).toString().trim();
  } catch {}

  const response: APMResponse = {
    kernel: {
      uptime: Math.floor(os.uptime()),
      arch: os.arch(),
      cores: os.cpus().length,
      load: os.loadavg(),
      memory: {
        active: toMB(os.totalmem() - os.freemem()),
        total: toMB(os.totalmem()),
      },
      diskUsage,
    },
    node: {
      version: process.version,
      heapLimit: toMB(heapStats.heap_size_limit),
      heapTotal: toMB(heapStats.total_heap_size),
      heapUsed: toMB(heapStats.used_heap_size),
      elu: Math.round(elu * 100) / 100,
      lastGC: Math.round(lastGCDuration * 100) / 100,
    },
    fingerprint: {
      ip: headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
      ua: headerList.get('user-agent') || 'Unknown',
      pop: headerList.get('x-amz-cf-pop') || 'LOCAL',
      country: headerList.get('cloudfront-viewer-country') || 'LOCALHOST',
      tls: headerList.get('cloudfront-viewer-tls') || 'TLS_NONE',
    },
    egress,
    pipeline: {
      commit: process.env.GITHUB_SHA?.substring(0, 7) || 'dev-local',
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
