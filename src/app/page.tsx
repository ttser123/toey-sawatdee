// src/app/page.tsx — Overview (Detailed Infrastructure + Visual Flow)
'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { FlowDiagram } from '@/components/landing/FlowDiagram';
import { ArchitectureDetails } from '@/components/landing/ArchitectureDetails';

export default function Home() {
  return (
    <div className="space-y-8 sm:space-y-10 pb-10">
      {/* HEADER: THE TECH STACK */}
      <HeroSection />

      {/* THE VISUAL FLOW DIAGRAM */}
      <FlowDiagram />

      {/* ARCHITECTURE ZONES (EDGE, COMPUTE, SERVERLESS, CI/CD) */}
      <ArchitectureDetails />
    </div>
  );
}
