import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ToolRenderer from '@/components/tools/ToolRenderer';

const VALID_TOOLS: string[] = [];

export async function generateStaticParams() {
    return VALID_TOOLS.map(toolId => ({ toolId }));
}

export default function ToolPage({ params }: { params: { toolId: string } }) {
    const { toolId } = params;

    if (VALID_TOOLS.length > 0 && !VALID_TOOLS.includes(toolId)) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-end">
                <Link 
                    href="/tools"
                    className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-sm border border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all font-mono text-[10px] font-black uppercase"
                >
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                    Back to Directory
                </Link>
            </div>

            <ToolRenderer toolId={toolId} />
        </div>
    );
}
