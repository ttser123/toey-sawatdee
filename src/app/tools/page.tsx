import React from 'react';
import Link from 'next/link';

export default function ToolsDirectory() {
    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link 
                    href="/tools/subnet-solver"
                    className="group bg-white border border-slate-200 p-6 rounded-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-4"
                >
                    <div className="w-10 h-10 bg-slate-50 rounded-sm flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">router</span>
                    </div>
                    <div>
                        <h3 className="text-slate-900 font-black font-mono uppercase tracking-tight text-sm mb-1 group-hover:text-indigo-600 transition-colors">Subnet Solver</h3>
                        <p className="text-slate-400 text-[10px] leading-relaxed font-medium uppercase tracking-wider">Resolve IP collisions between Docker/WSL and Corporate LAN/VPN.</p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Ready</span>
                        <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
