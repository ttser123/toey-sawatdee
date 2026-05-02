// src/app/page.tsx — Overview (Home)
'use client';


import ReleaseNotes from '@/components/ReleaseNotes';

export default function Home() {
  return (
    <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8 lg:p-10">
      {/* Architecture */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Web Architecture</h2>
        </div>
      </div>
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-start gap-2.5 text-gray-600">
          <span className="material-symbols-outlined text-purple-500 text-[20px] mt-0.5">code</span>
          <span className="leading-relaxed"><strong className="text-gray-900 font-medium">Tech Stack:</strong> Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, AWS (S3, CloudFront, Route 53, ACM, Cognito, API Gateway, Lambda, DynamoDB), GitHub Actions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Cloud Networking & Edge Delivery */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2.5 rounded-lg">public</span>
            <h3 className="text-lg font-bold text-gray-900">Cloud Networking & Edge Delivery</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Architected a highly available static web infrastructure hosted on AWS S3 and distributed globally via AWS CloudFront CDN for sub-millisecond edge delivery.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Configured DNS routing and SSL/TLS encryption utilizing AWS Route 53 and AWS Certificate Manager (ACM), ensuring secure HTTPS connections across all custom domains.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Implemented Edge Computing logic using CloudFront Functions to dynamically rewrite URL paths, resolving Next.js static routing limitations at the CDN level.</span></li>
          </ul>
        </div>

        {/* Enterprise-Grade Security & Authentication */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-600 bg-red-50 p-2.5 rounded-lg">shield_lock</span>
            <h3 className="text-lg font-bold text-gray-900">Enterprise-Grade Security & Authentication</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Integrated AWS Cognito (User Pools) for administrator authentication, enforcing the Secure Remote Password (SRP) protocol to eliminate plain-text credential transmission.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Engineered a Smart Auth Guard architecture utilizing React Context API for global state management, securely restricting access to protected routes and managing JWT session lifecycles seamlessly.</span></li>
          </ul>
        </div>

        {/* Serverless Backend & Telemetry APIs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 p-2.5 rounded-lg">api</span>
            <h3 className="text-lg font-bold text-gray-900">Serverless Backend & Telemetry APIs</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Developed a serverless RESTful API gateway using AWS API Gateway and Lambda functions to asynchronously aggregate and serve real-time network telemetry from a remote dedicated node.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Designed a high-throughput analytics engine with AWS DynamoDB (NoSQL) to track global profile interactions, optimizing read/write capacity limits for extreme cost-efficiency.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Optimized Client-Side Data Fetching by implementing parallel asynchronous requests (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-[12px] font-mono border border-gray-200">Promise.all</code>), drastically reducing Dashboard rendering time.</span></li>
          </ul>
        </div>

        {/* CI/CD & Automated Workflows */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-purple-600 bg-purple-50 p-2.5 rounded-lg">rocket_launch</span>
            <h3 className="text-lg font-bold text-gray-900">CI/CD & Automated Workflows</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Constructed automated deployment pipelines via GitHub Actions, systematically building and syncing the Next.js static site directly to AWS S3 upon branch merges.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Achieved Zero-Downtime Deployments by orchestrating automated AWS CloudFront cache invalidations within the CI pipeline, ensuring immediate global content parity.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Enforced Strict Code Quality & Security by integrating TypeScript type-checking and ESLint, while securely managing AWS IAM credentials via GitHub Secrets to prevent exposure.</span></li>
          </ul>
        </div>

      </div>

      <ReleaseNotes />

    </main>
  );
}