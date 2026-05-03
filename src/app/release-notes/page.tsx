// src/app/release-notes/page.tsx
'use client';

import ReleaseNotes from '@/components/ReleaseNotes';

export default function ReleaseNotesPage() {
  return (
    <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8 lg:p-10">
      <ReleaseNotes />
    </main>
  );
}

