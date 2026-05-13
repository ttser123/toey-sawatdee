'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────

interface APMData {
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
    elu: number;
    lastGC: number;
  };
  fingerprint: {
    ip: string;
    ua: string;
    pop: string;
    country: string;
    tls: string;
  };
  egress: {
    name: string;
    status: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
    latency: number | null;
  }[];
  pipeline: {
    commit: string;
    env: string;
  };
  timestamp: string;
}

interface LogEntry {
  id: string;
  time: string;
  msg: string;
  status: 'OK' | 'FAIL';
}

// ── Sub-Components ───────────────────────────────────────────────────

const CockpitSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode, className?: string }) => (
  <div className={`card-blueprint p-3 flex flex-col gap-3 ${className}`}>
    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
      <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      <div className="flex gap-0.5">
        <div className="h-0.5 w-2 bg-slate-100" />
        <div className="h-0.5 w-0.5 bg-slate-200" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">{children}</div>
  </div>
);

const CockpitMetric = ({ label, value, sub, warning = false }: { label: string; value: string | number; sub?: string; warning?: boolean }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    <div className="flex items-baseline gap-1 overflow-hidden">
      <span className={`text-xs font-mono font-bold truncate ${warning ? 'text-rose-500' : 'text-slate-700'}`}>{value}</span>
      {sub && <span className="text-[8px] font-mono text-slate-400 shrink-0 uppercase">{sub}</span>}
    </div>
  </div>
);

const LiveStatus = ({ status, label }: { status: string; label: string }) => {
  const colors: Record<string, string> = {
    UP: 'bg-emerald-500',
    DEGRADED: 'bg-amber-500',
    DOWN: 'bg-rose-500',
    UNKNOWN: 'bg-slate-300',
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`h-1.5 w-1.5 rounded-full ${colors[status] || colors.UNKNOWN} ${status !== 'UNKNOWN' ? 'animate-blink' : ''}`} />
        <span className="text-[10px] font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex gap-0.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-2 w-0.5 ${status === 'UP' ? 'bg-emerald-100' : 'bg-rose-100'}`} />
        ))}
      </div>
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────────────────

export default function StatusDashboard() {
  const [data, setData] = useState<APMData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isError, setIsError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAPM = useCallback(async () => {
    setIsSyncing(true);
    const start = Date.now();
    try {
      const res = await fetch('/api/status/health', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP_${res.status}`);
      const payload: APMData = await res.json();
      setData(payload);
      setIsError(false);

      setLogs(prev => [{
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        msg: `HEARTBEAT_ACK: ${Date.now() - start}ms`,
        status: 'OK',
      } as LogEntry, ...prev].slice(0, 50));
    } catch (e) {
      setIsError(true);
      setLogs(prev => [{
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        msg: `SIGNAL_DROPOUT: ${e instanceof Error ? e.message : 'TIMEOUT'}`,
        status: 'FAIL',
      } as LogEntry, ...prev].slice(0, 50));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAPM();
    const interval = setInterval(fetchAPM, 5000);
    return () => clearInterval(interval);
  }, [fetchAPM]);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-4 pb-8 max-w-7xl mx-auto selection:bg-slate-900 selection:text-white antialiased">

      {/* ── Main HUD Header ─────────────────────────────── */}
      <div className={`flex items-center justify-between p-3 rounded-sm border transition-all duration-700 bg-white/80 backdrop-blur-md ${isError ? 'border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-300 shadow-sm'
        }`}>
        <div className="flex items-center gap-3">
          <div className="relative h-2 w-2">
            {!isError && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-radar-ping" />}
            <div className={`relative h-2 w-2 rounded-full ${isError ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <p className={`text-[10px] font-mono font-bold ${isError ? 'text-rose-600' : 'text-slate-600'}`}>
              {isError ? 'CRITICAL_SIGNAL_LOSS' : 'ALL_SYSTEMS_NOMINAL'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">Telemetry Clock</span>
            <span className="text-xs font-mono font-bold text-slate-500 leading-tight">
              {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
            </span>
          </div>
          {isSyncing && <div className="h-3 w-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin opacity-40" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Sector: HARDWARE & KERNEL */}
        <CockpitSection title="Hardware & Kernel">
          <CockpitMetric label="CPU Clusters" value={data?.kernel.cores || '--'} sub={data?.kernel.arch} />
          <CockpitMetric label="System Uptime" value={data ? formatUptime(data.kernel.uptime) : '--'} />
          <CockpitMetric label="Memory Usage" value={data?.kernel.memory.active || '--'} sub={`/ ${data?.kernel.memory.total}MB`} />
          <CockpitMetric label="Storage (Root)" value={data?.kernel.diskUsage || 'N/A'} sub="VOL" />
          <div className="col-span-2 space-y-1">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Load Average (1m/5m/15m)</span>
            <div className="grid grid-cols-3 gap-1">
              {data?.kernel.load.map((l, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-sm py-0.5 text-center text-[10px] font-mono font-bold text-slate-600">
                  {l.toFixed(2)}
                </div>
              )) || <div className="col-span-3 text-center text-slate-200">---</div>}
            </div>
          </div>
        </CockpitSection>

        {/* Sector: NODE.JS ENGINE */}
        <CockpitSection title="Node.js Engine">
          <CockpitMetric label="Runtime Version" value={data?.node.version || '--'} />
          <CockpitMetric label="ELU utilization" value={`${data?.node.elu || 0}%`} warning={(data?.node.elu || 0) > 80} />
          <CockpitMetric label="Active Heap" value={data?.node.heapUsed || '--'} sub="MB" />
          <CockpitMetric label="Heap Limit" value={data?.node.heapLimit || '--'} sub="MB" />
          <div className="col-span-2 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Memory Pressure</span>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">Heap: {data?.node.heapTotal}MB Total</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${(data?.node.elu || 0) > 80 ? 'bg-rose-500' : 'bg-slate-900'}`}
                style={{ width: data ? `${(data.node.heapUsed / data.node.heapLimit) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Last GC Duration</span>
              <span className="text-[10px] font-mono font-bold text-slate-600">{data?.node.lastGC}ms</span>
            </div>
          </div>
        </CockpitSection>

        {/* Sector: CLIENT & EDGE */}
        <CockpitSection title="Client & Edge">
          <CockpitMetric label="Public IP" value={data?.fingerprint.ip || '---'} />
          <CockpitMetric label="POP Location" value={data?.fingerprint.pop || '---'} />
          <CockpitMetric label="Geo Country" value={data?.fingerprint.country || '---'} />
          <CockpitMetric label="TLS Version" value={data?.fingerprint.tls || '---'} />
          <div className="col-span-2">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">User Agent Header</span>
            <div className="mt-1 bg-slate-50 border border-slate-100 p-1.5 text-[9px] font-mono text-slate-400 leading-tight truncate rounded-sm">
              {data?.fingerprint.ua || '---'}
            </div>
          </div>
        </CockpitSection>

        {/* Sector: EXTERNAL EGRESS */}
        <CockpitSection title="External Egress">
          <div className="col-span-2 -mt-1">
            {data?.egress.map((svc) => (
              <div key={svc.name} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors -mx-1 px-1">
                <div className="flex items-center gap-2">
                  <div className={`h-1 w-1 rounded-full ${svc.status === 'UP' ? 'bg-emerald-500 animate-blink' : 'bg-rose-500 animate-pulse'}`} />
                  <span className="text-[10px] font-bold text-slate-600 tracking-tight">{svc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{svc.latency}ms</span>
                  <span className={`text-[8px] font-black px-1 py-0.5 rounded-sm ${svc.status === 'UP' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
            {(!data?.egress || data.egress.length === 0) && <div className="py-4 text-center text-slate-200">---</div>}
          </div>
        </CockpitSection>
      </div>

      {/* Sector: SYNC_LOG Terminal */}
      <div className="card-blueprint p-4 bg-slate-50/50">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Live_Telemetry_Log</h3>
        <div className="h-40 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 text-xs border-l-2 border-slate-200 pl-3 py-1 bg-white/30 rounded-r-sm">
              <span className="text-slate-400 font-mono shrink-0 font-bold">{log.time}</span>
              <span className={`font-semibold ${log.status === 'OK' ? 'text-slate-600' : 'text-rose-600 font-bold'}`}>
                {log.msg}
              </span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-slate-300 italic py-2">Waiting for signal sync...</p>}
        </div>
      </div>

      {/* Cockpit Footer */}
      <div className="flex justify-between items-center px-1 text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em]">
        <span>BUILD: {data?.pipeline.commit || '---'}</span>
        <span className="flex items-center gap-3">
          <span>SECURE_SHELL: ACTIVE</span>
          <div className="h-1 w-1 bg-slate-200 rounded-full" />
          <span>REGION: AP-SOUTHEAST-2</span>
          <div className="h-1 w-1 bg-slate-200 rounded-full" />
          <span>ENV: {data?.pipeline.env || '---'}</span>
        </span>
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
