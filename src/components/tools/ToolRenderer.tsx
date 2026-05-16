'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ToolSkeleton = () => (
    <div className="w-full h-96 bg-slate-100 animate-pulse rounded-sm flex items-center justify-center">
        <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">Initialising Module...</span>
    </div>
);

/**
 * Registry of modular tools.
 * Add new tools here using dynamic imports with { ssr: false }.
 */
const TOOL_COMPONENTS: Record<string, any> = {
    'subnet-solver': dynamic(() => import('@/components/tools/SubnetSolver'), { loading: () => <ToolSkeleton />, ssr: false }),
};

export default function ToolRenderer({ toolId }: { toolId: string }) {
    const ToolComponent = TOOL_COMPONENTS[toolId];

    if (!ToolComponent) {
        return (
            <div className="bg-slate-50 border border-slate-200 p-12 rounded-sm text-center">
                <span className="material-symbols-outlined text-slate-300 text-4xl mb-4">extension</span>
                <h2 className="text-slate-600 font-black font-mono uppercase tracking-tight text-xl mb-2">Module Not Found</h2>
                <p className="text-slate-400 text-sm italic font-mono">System cannot locate the specified module component.</p>
            </div>
        );
    }

    return <ToolComponent />;
}
