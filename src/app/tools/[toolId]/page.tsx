import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ToolRenderer from '@/components/tools/ToolRenderer';

const VALID_TOOLS: string[] = ['subnet-solver'];

export async function generateStaticParams() {
    return VALID_TOOLS.map(toolId => ({ toolId }));
}

type Props = {
    params: Promise<{ toolId: string }>;
};

export default async function ToolPage({ params }: Props) {
    const { toolId } = await params;

    if (VALID_TOOLS.length > 0 && !VALID_TOOLS.includes(toolId)) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-8">
            <ToolRenderer toolId={toolId} />
        </div>
    );
}
