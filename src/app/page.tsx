// src/app/page.tsx — Overview (Home)
'use client';

export default function Home() {
  return (
    <main className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8 lg:p-10">
      {/* Architecture */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <span className="material-symbols-outlined text-purple-500 text-[20px] mt-0.5">code</span>
        <h2 className="text-xl font-bold text-gray-900">Web Architecture</h2>
      </div>
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
        <div className="flex items-start gap-2.5 text-gray-600">
          <span className="leading-relaxed"><strong className="text-gray-900 font-medium">Tech Stack:</strong> Next.js (App Router), TypeScript, Tailwind CSS, Python, Node.js, AWS (S3, CloudFront, Route 53, ACM, Cognito, API Gateway, Lambda, DynamoDB), GitHub Actions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Cloud Networking & Edge Delivery */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-blue-600 bg-blue-50 p-2.5 rounded-lg">public</span>
            <h3 className="text-lg font-bold text-gray-900">Cloud Networking</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Reduced global asset delivery latency to ~50ms by migrating static hosting to AWS S3 and distributing content via AWS CloudFront CDN.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Ensured HTTPS connections across custom domains by configuring DNS routing and SSL/TLS encryption with AWS Route 53 and AWS Certificate Manager (ACM).</span></li>
            <li className="pl-1"><span className="leading-relaxed">Resolved Next.js static routing limitations at the CDN level by implementing Edge Computing logic using CloudFront Functions to dynamically rewrite URL paths.</span></li>
          </ul>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Architectural Trade-offs</p>
            <p className="text-sm text-gray-600 leading-relaxed"><strong className="font-medium text-gray-800">Why CloudFront Functions over Lambda@Edge?</strong> Chose CloudFront Functions for its sub-millisecond startup time and lower cost for simple URL rewrites, despite the limitation of not being able to access the network or filesystem.</p>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-600 bg-red-50 p-2.5 rounded-lg">shield_lock</span>
            <h3 className="text-lg font-bold text-gray-900">Security & Authentication</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Secured internal dashboard access against unauthorized brute-force attempts using AWS Cognito SRP authentication.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Prevented unauthorized access to protected routes and managed JWT session lifecycles by implementing a custom Auth Guard with React Context API.</span></li>
          </ul>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Architectural Trade-offs</p>
            <p className="text-sm text-gray-600 leading-relaxed"><strong className="font-medium text-gray-800">Why AWS Cognito instead of NextAuth.js?</strong> Chose Cognito to offload user credential management entirely to AWS and enforce SRP, despite the initial learning curve of configuring User Pools and dealing with AWS-specific JWT validation.</p>
          </div>
        </div>

        {/* Serverless Backend & Telemetry APIs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 p-2.5 rounded-lg">api</span>
            <h3 className="text-lg font-bold text-gray-900">Serverless Backend APIs</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Handled real-time network telemetry asynchronously without managing servers using a REST API built on AWS API Gateway and Python 3.12 Lambda functions.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Prevented &quot;Ghost Online&quot; statuses by deploying a Node.js Guardian Agent with SIGINT/SIGTERM listeners on a dedicated server to push final OFFLINE metrics upon shutdown.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Implemented a DynamoDB analytics table utilizing On-Demand capacity, keeping monthly read/write costs under $1 while handling continuous polling requests.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Optimized client-side rendering performance by executing parallel asynchronous data fetches (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-[12px] font-mono border border-gray-200">Promise.all</code>).</span></li>
          </ul>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Architectural Trade-offs</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3"><strong className="font-medium text-gray-800">Why API Gateway & Lambda over an Express.js EC2 instance?</strong> Chose serverless to completely eliminate OS patching (DevSecOps mindset) and minimize idle costs, despite the initial pain of debugging CORS preflight limits.</p>
            <p className="text-sm text-gray-600 leading-relaxed"><strong className="font-medium text-gray-800">Why DynamoDB instead of RDS/PostgreSQL?</strong> Needed a fast, scalable key-value store for simple telemetry payloads. DynamoDB On-Demand keeps the cost near zero during idle hours, though it required writing custom DecimalEncoder serialization in Python to prevent JSON parsing crashes.</p>
          </div>
        </div>

        {/* CI/CD & Automated Workflows */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-purple-600 bg-purple-50 p-2.5 rounded-lg">rocket_launch</span>
            <h3 className="text-lg font-bold text-gray-900">CI/CD & Workflows</h3>
          </div>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-outside ml-4 marker:text-gray-300">
            <li className="pl-1"><span className="leading-relaxed">Eliminated manual deployments by building automated pipelines via GitHub Actions to sync Next.js static builds to AWS S3 upon branch merges.</span></li>
            <li className="pl-1"><span className="leading-relaxed">Achieved zero-downtime content updates by orchestrating automated AWS CloudFront cache invalidations within the CI pipeline.</span></li>
          </ul>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Architectural Trade-offs</p>
            <p className="text-sm text-gray-600 leading-relaxed"><strong className="font-medium text-gray-800">Why GitHub Actions over AWS CodePipeline?</strong> Kept the CI/CD configuration closer to the code repository for faster iteration, though it required strict management of AWS IAM credentials via GitHub Secrets to prevent exposure.</p>
          </div>
        </div>

      </div>

    </main>
  );
}