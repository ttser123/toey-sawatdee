import React from 'react';

type ReleaseNote = {
  date: string;
  title: string;
  isLatest?: boolean;
  changes: string[];
};

// ==========================================
// 🚀 ADD NEW UPDATES HERE
// ==========================================
const releaseNotes: ReleaseNote[] = [
  {
    date: 'May 3, 2026',
    title: 'Zomboid Serverless Infrastructure & Guardian Agent (v2.0)',
    isLatest: true,
    changes: [
      '**AWS Architecture & Backend:** Corrected the Lambda function runtime mismatch (Node.js -> Python 3.12) and fixed the hardcoded AWS Region bug (ap-southeast-2).',
      '**CORS & Security:** Fixed the double-header trap, properly configured AWS HTTP API CORS settings, and removed a useless API Gateway Authorizer blocking the public API.',
      '**DynamoDB Decimal Serialization:** Implemented a custom DecimalEncoder in Python to prevent JSON parsing crashes.',
      '**The Guardian Agent:** Completely rewrote the game server polling script with stateful memory tracking (Peak Players, Total Ping, Uptime).',
      '**Graceful Shutdown:** Added SIGINT and SIGTERM signal listeners to push a final OFFLINE payload to AWS before dying, preventing "Ghost Online" statuses.',
      '**Direct File System Parsing:** Bypassed GameDig limitations by directly reading the Zomboid servertest.ini configuration file to extract and push the active ModsList.',
      '**Frontend React Hydration Fix:** Implemented an isMounted state to prevent server/client rendering mismatches caused by dynamic timestamps.',
      '**Offline Flex Dashboard:** Revamped the UI logic to dynamically shift and show an AWS Serverless Architecture Diagram alongside Last Session Historical Stats during downtime.',
      '**Eradicated Ghost Data Bugs:** Forced conditional rendering to cleanly display 0/0 and 0 ms when the server is down.'
    ]
  },
  {
    date: 'May 2, 2026',
    title: 'Zomboid Dashboard Redesign & Stability',
    changes: [
      'Redesigned **ZomboidStatus** component to always display all stat fields (Map, Players, Ping, Last Update) even when the server is offline — showing zero / placeholder values.',
      'Refactored **Zomboid API route** with graceful offline defaults so the page never renders an error state.',
      'Aligned the Zomboid page to the project **design system** (white cards, Material Symbols icons, consistent spacing).',
      'Converted all Thai text and comments to **English** across the Zomboid module for codebase consistency.',
      'Added an **offline hint banner** explaining auto-refresh behavior to visitors.'
    ]
  },
  {
    date: 'May 2, 2026',
    title: 'Project Zomboid Server Integration',
    changes: [
      'Integrated real-time **Project Zomboid Server Dashboard** into the public view.',
      'Developed robust backend API polling leveraging the **gamedig** library.',
      'Refactored **ZomboidStatus** component for centralized server monitoring.'
    ]
  },
  {
    date: 'May 1, 2026',
    title: 'Architectural Refactoring & UI Overhaul',
    changes: [
      'Transitioned to a unified **Light Theme** and modernized the typography using the Inter font.',
      'Engineered a **Mobile-First Sidebar** with an interactive slide-over menu and backdrop blur.',
      'Implemented a secure **Isolated Login Route** with an intelligent Auth Guard and Callback URLs.'
    ]
  },
  {
    date: 'Apr 28, 2026',
    title: 'Initial Infrastructure Deployment',
    changes: [
      'Configured AWS S3 and CloudFront for global static asset delivery.',
      'Integrated AWS Cognito User Pools for robust administrator access control.',
      'Established automated CI/CD pipelines via GitHub Actions.'
    ]
  }
];

// Helper to render basic markdown-like bold text (e.g. **bold text**)
const renderText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export default function ReleaseNotes() {
  return (
    <>
      {/* Changelog & Release Notes Section */}
      <div className="mb-6 flex items-center gap-3 px-1 mt-10">
        <span className="material-symbols-outlined text-gray-400 text-[28px]">update</span>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Release Notes</h2>
          <p className="text-sm text-gray-500 mt-1">Track recent updates, feature rollouts, and infrastructure changes.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="space-y-8">
          {releaseNotes.map((note, index) => (
            <div key={index} className="relative pl-8 md:pl-0">
              
              {/* Timeline Line (Hidden on the very last item) */}
              {index !== releaseNotes.length - 1 && (
                <div className="absolute left-[11px] md:left-[116px] top-2 bottom-[-32px] w-px bg-gray-200"></div>
              )}

              {/* Timeline Dot */}
              <div 
                className={`absolute left-[11.5px] md:left-[116.5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white -translate-x-1/2 ${note.isLatest ? 'bg-blue-600' : 'bg-gray-300'}`}
              ></div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                
                {/* Date Column */}
                <div className="md:w-[100px] shrink-0 pt-0.5 md:text-right">
                  <span className={`text-sm font-bold ${note.isLatest ? 'text-blue-600' : 'text-gray-500'}`}>
                    {note.date}
                  </span>
                </div>
                
                {/* Content Column */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base font-semibold text-gray-900">{note.title}</h4>
                    {note.isLatest && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {note.changes.map((change, i) => (
                      <p key={i} className="leading-relaxed">• {renderText(change)}</p>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
