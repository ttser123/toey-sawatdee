'use client';

import React, { useState } from 'react';
import { useSubnetSolver } from '@/hooks/useSubnetSolver';
import { isValidIPv4 } from '@/lib/network-utils';

/**
 * COMPONENT: SUBNET COLLISION SOLVER (TACTICAL UI)
 * Adheres to "Blueprint" design system.
 */
export default function SubnetCollisionSolver() {
    const {
        networks,
        service,
        os,
        targetCidr,
        candidateLimit,
        foundSubnets,
        selectedSubnet,
        result,
        error,
        setService,
        setOs,
        setTargetCidr,
        setCandidateLimit,
        addInterface,
        removeInterface,
        updateInterface,
        solve,
        handleSelectSubnet
    } = useSubnetSolver();

    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result.config);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-8 font-mono">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT ARENA: CONFIGURATION */}
                <div className="lg:col-span-2 space-y-8">
                    {/* SECTION 01: NETWORK INTERFACES */}
                    <div className="bg-white border border-slate-200 p-6 shadow-[2px_2px_0px_0px_rgba(226,232,240,0.5)]">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <span className="text-indigo-600">01.</span> Current Network Interfaces
                            </h2>
                            <button
                                onClick={addInterface}
                                className="text-[9px] font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-3 py-1.5 border border-slate-200 text-slate-600 transition-all flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-xs">add</span> Add Row
                            </button>
                        </div>

                        <div className="space-y-3">
                            {networks.map((net) => {
                                const isInvalid = net.ip.trim() !== '' && !isValidIPv4(net.ip);
                                return (
                                    <div key={net.id} className="flex flex-col sm:flex-row gap-2 group">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="IP Address (e.g. 10.1.2.0)"
                                                value={net.ip}
                                                onChange={(e) => updateInterface(net.id, 'ip', e.target.value)}
                                                className={`w-full bg-slate-50 border px-4 py-3 text-xs font-bold focus:outline-none transition-all rounded-sm ${isInvalid
                                                    ? 'border-red-300 text-red-500 focus:border-red-500'
                                                    : 'border-slate-200 focus:border-indigo-500 text-slate-600'
                                                    }`}
                                            />
                                            {isInvalid && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-red-500 font-black uppercase hidden sm:inline">Invalid</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1 sm:w-24">
                                                <select
                                                    value={net.cidr}
                                                    onChange={(e) => updateInterface(net.id, 'cidr', parseInt(e.target.value))}
                                                    className="w-full bg-slate-50 border border-slate-200 px-3 py-3 text-xs font-bold focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer text-slate-600 rounded-sm"
                                                >
                                                    {[...Array(25)].map((_, i) => (
                                                        <option key={i + 8} value={i + 8}>/{i + 8}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={() => removeInterface(net.id)}
                                                className="px-4 border border-slate-200 text-slate-300 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-0 rounded-sm sm:px-3"
                                                disabled={networks.length === 1}
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 02-04: SERVICE, OS, BLOCK */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-200 p-6">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                <span className="text-indigo-600">02.</span> Service
                            </h2>
                            <div className="flex gap-2">
                                {(['docker', 'wsl'] as typeof service[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setService(s)}
                                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border rounded-sm ${service === s
                                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-[2px_2px_0px_0px_rgba(79,70,229,0.3)]'
                                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        [{s}]
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 p-6">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                <span className="text-indigo-600">03.</span> OS
                            </h2>
                            <div className="flex gap-1.5 flex-wrap">
                                {(['windows', 'mac', 'linux'] as typeof os[]).map((t) => {
                                    const isDisabled = service === 'wsl' && t !== 'windows';
                                    return (
                                        <button
                                            key={t}
                                            disabled={isDisabled}
                                            onClick={() => setOs(t)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border rounded-sm ${os === t
                                                    ? 'bg-slate-800 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)]'
                                                    : isDisabled
                                                        ? 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed'
                                                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            [{t}]
                                        </button>
                                    );
                                })}
                            </div>
                            {service === 'wsl' && (
                                <p className="text-[8px] text-indigo-400 mt-2 uppercase font-bold tracking-tighter">
                                    * WSL is strictly for Windows environments.
                                </p>
                            )}
                        </div>
                        <div className="bg-white border border-slate-200 p-6">
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                <span className="text-indigo-600">04.</span> Block
                            </h2>
                            <select
                                value={targetCidr}
                                onChange={(e) => setTargetCidr(parseInt(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-black uppercase tracking-widest focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer text-slate-600 text-center rounded-sm"
                            >
                                {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((c) => (
                                    <option key={c} value={c}>CIDR /{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* SECTION 05: CANDIDATE SELECTION (DESKTOP ONLY) */}
                    <div className="hidden lg:block">
                        {foundSubnets.length > 0 && (
                            <div className="bg-white border border-slate-200 p-6 shadow-[2px_2px_0px_0px_rgba(226,232,240,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-6 border-b border-slate-100 pb-4">
                                    <span className="text-indigo-600">05.</span> Select Target Subnet
                                </h2>
                                <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                                    {foundSubnets.map((subnet, idx) => (
                                        <button
                                            key={subnet}
                                            onClick={() => handleSelectSubnet(subnet)}
                                            className={`relative p-4 border transition-all text-left rounded-sm group overflow-hidden ${selectedSubnet === subnet
                                                ? 'border-indigo-600 bg-indigo-50 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)] ring-1 ring-indigo-600'
                                                : 'border-slate-200 bg-slate-50 hover:border-slate-400'
                                                }`}
                                        >
                                            {idx === 0 && (
                                                <span className="absolute -top-2 left-2 bg-indigo-600 text-white text-[7px] font-black uppercase px-1.5 py-0.5 tracking-tighter rounded-sm">
                                                    Best Match
                                                </span>
                                            )}
                                            <div className={`text-[10px] xl:text-xs font-black truncate ${selectedSubnet === subnet ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                {subnet}
                                            </div>
                                            <div className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                                Option 0{idx + 1}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDEBAR: ACTIONS & OUTPUT */}
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Depth</span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={candidateLimit}
                                    onChange={(e) => setCandidateLimit(parseInt(e.target.value))}
                                    className="bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-black focus:outline-none rounded-sm"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n} IPs</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={solve}
                            className="w-full bg-slate-900 text-white py-6 text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none rounded-sm"
                        >
                            Execute Solver
                        </button>
                    </div>

                    {/* SECTION 05: CANDIDATE SELECTION (MOBILE/TABLET ONLY) */}
                    <div className="lg:hidden">
                        {foundSubnets.length > 0 && (
                            <div className="bg-white border border-slate-200 p-6 shadow-[2px_2px_0px_0px_rgba(226,232,240,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-100 pb-3">
                                    <span className="text-indigo-600">05.</span> Select Subnet
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {foundSubnets.map((subnet, idx) => (
                                        <button
                                            key={subnet}
                                            onClick={() => handleSelectSubnet(subnet)}
                                            className={`relative p-3 border transition-all text-left rounded-sm group ${selectedSubnet === subnet
                                                ? 'border-indigo-600 bg-indigo-50 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]'
                                                : 'border-slate-200 bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className={`text-[10px] font-black ${selectedSubnet === subnet ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                    {subnet}
                                                </div>
                                                {idx === 0 && (
                                                    <span className="text-[7px] font-black uppercase text-indigo-600">Best</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 relative overflow-hidden rounded-sm">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <h3 className="text-[10px] font-black text-red-700 uppercase mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs">report</span>
                                System Error
                            </h3>
                            <p className="text-[10px] text-red-600 leading-relaxed uppercase">{error}</p>
                        </div>
                    )}

                    {/* RESULT CONFIGURATION PANEL */}
                    {result && selectedSubnet && (
                        <div className="bg-indigo-50 border border-indigo-200 p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.1)] rounded-sm">
                            <div>
                                <div className="text-[9px] text-indigo-400 uppercase font-black mb-1 tracking-widest">Selected Subnet</div>
                                <div className="text-2xl font-black text-indigo-700 leading-none">{selectedSubnet}</div>
                            </div>

                            <div className="pt-4 border-t border-indigo-100">
                                <div className="text-[9px] text-slate-400 uppercase font-black mb-2 flex justify-between">
                                    <span>Target Config</span>
                                    <span className="text-indigo-400 uppercase">[{service}]</span>
                                </div>
                                <div className="relative group">
                                    <pre className="bg-slate-900 text-slate-300 p-4 text-[10px] overflow-x-auto border border-slate-800 rounded-sm">
                                        <code>{result.config}</code>
                                    </pre>
                                    <button
                                        onClick={copyToClipboard}
                                        className="absolute top-2 right-2 bg-indigo-600 text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] rounded-sm"
                                    >
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/50 border border-indigo-200 p-3 mt-4 rounded-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined text-xs text-indigo-600">terminal</span>
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Implementation</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-600 uppercase leading-relaxed font-bold border-b border-indigo-50 pb-1">
                                        Path: <span className="text-slate-900">{result.path}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-600 uppercase leading-relaxed font-bold">
                                        Cmd: <span className="text-slate-900">{result.instructions}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <footer className="pt-8 border-t border-slate-100">
            </footer>
        </div>
    );
}
