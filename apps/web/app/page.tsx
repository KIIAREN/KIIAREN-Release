'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useConvexAuth } from 'convex/react';
import { Loader, Check, CheckCircle, Github, ArrowRight, Copy } from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [copied, setCopied] = useState(false);

  const handleStart = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      const isProd = window.location.hostname.includes('kiiaren.com');
      if (isProd) {
        window.location.href = 'https://dashboard.kiiaren.com';
      } else {
        router.push('/workspace');
      }
    } else {
      const isProd = window.location.hostname.includes('kiiaren.com');
      if (isProd) {
        window.location.href = 'https://account.kiiaren.com';
      } else {
        router.push('/account');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('npm install kiiaren');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300 font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-mono">KIIAREN_</div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a className="hover:text-black dark:hover:text-white transition-colors" href="#philosophy">Philosophy</a>
            <a className="hover:text-black dark:hover:text-white transition-colors" href="#architecture">Architecture</a>
            <a className="hover:text-black dark:hover:text-white transition-colors" href="#pricing">Open Core</a>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white" href="https://github.com/KIIAREN/KIIAREN" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </a>
            <Button onClick={handleStart} disabled={isLoading} className="text-xs font-mono font-bold uppercase tracking-wider">
              {isLoading ? <Loader className="size-4 animate-spin" /> : 'Access Kernel'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f21_1px,transparent_1px),linear-gradient(to_bottom,#1f1f21_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">v1.0.4 stable release</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-6">
            Organization-first<br className="hidden lg:block" /> workspace kernel.
          </h1>
          <p className="text-lg lg:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            A sovereignty engine for modern teams. Built on strict domain-based ownership and cryptographic trust, devoid of social noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleStart} disabled={isLoading} className="w-full sm:w-auto px-8">
              {isLoading ? <Loader className="size-5 animate-spin" /> : (isAuthenticated ? 'Open App' : 'Start Deployment')}
            </Button>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-8 py-3 bg-transparent text-zinc-900 dark:text-white font-mono text-sm border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all flex items-center justify-center gap-2 rounded-md"
            >
              <span>$ npm install kiiaren</span>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section className="py-24 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" id="philosophy">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Not a social network.<br />A private infrastructure.</h2>
            <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Most "productivity" tools are social networks in disguise - prioritizing engagement over utility. KIIAREN is different. It is an infrastructure kernel designed exclusively for organizational throughput.
              </p>
              <p>
                We strip away the likes, the feeds, and the algorithmic distractions. What remains is a pure, domain-verified workspace where identity is strictly scoped to the organization.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded">
                <svg className="h-6 w-6 text-zinc-900 dark:text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 className="font-mono text-sm font-bold text-zinc-900 dark:text-white">Domain Scoped</h4>
              </div>
              <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded">
                <svg className="h-6 w-6 text-zinc-900 dark:text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h4 className="font-mono text-sm font-bold text-zinc-900 dark:text-white">Zero Leakage</h4>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square w-full max-w-md mx-auto relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f21_1px,transparent_1px),linear-gradient(to_bottom,#1f1f21_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
              <div className="relative z-10 w-64 h-64 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-32 h-32 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center z-20">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">ORG_ROOT</span>
                </div>
                <div className="absolute top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-50"></div>
                <div className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24" id="architecture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Trust Topology</h2>
            <p className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">Identity && Access Management Flow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors rounded">
              <div className="absolute top-4 right-4 font-mono text-xs text-zinc-400">01</div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded">
                <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">DNS Verification</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Proof of ownership is established via TXT record. No email magic links. We trust the domain registrar as the root of truth.
              </p>
              <div className="mt-4 p-2 bg-zinc-50 dark:bg-black font-mono text-xs text-green-600 dark:text-green-400 truncate rounded">
                TXT kiiaren-verify=93f8a...
              </div>
            </div>
            <div className="group relative p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors rounded">
              <div className="absolute top-4 right-4 font-mono text-xs text-zinc-400">02</div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded">
                <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Key Generation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                An organizational master key is minted client-side. KIIAREN never sees your raw data, only encrypted blobs.
              </p>
            </div>
            <div className="group relative p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors rounded">
              <div className="absolute top-4 right-4 font-mono text-xs text-zinc-400">03</div>
              <div className="w-12 h-12 mb-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded">
                <svg className="h-6 w-6 text-zinc-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Workspace Isolation</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A dedicated tenancy is spun up. Users are provisioned strictly from the verified domain email suffix.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Intentionally Missing Features */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-12">Intentionally Missing Features</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Global Search Discovery', '"Follow" User Mechanics', 'Algorithmic Feed', 'Public Profiles', 'Gamification Badges'].map((feature) => (
              <div key={feature} className="px-6 py-3 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 font-mono text-sm rounded">
                <span className="line-through decoration-red-500">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800" id="pricing">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Open Core Model</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Full source availability. Pay for managed reliability.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-6 px-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-mono flex items-center rounded">MIT License</span>
              <span className="h-6 px-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-mono flex items-center rounded">SOC2 Type II</span>
            </div>
          </div>
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-12 border border-zinc-200 dark:border-zinc-800 rounded-l-lg lg:rounded-r-none rounded-t-lg lg:rounded-bl-lg">
              <div className="font-mono text-sm text-zinc-500 mb-2">COMMUNITY EDITION</div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Self-Hosted</h3>
              <ul className="space-y-4 mb-10">
                {['Full kernel functionality', 'Unlimited users & workspaces', 'Bring your own infrastructure (BYOI)', 'Community support'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a className="inline-flex items-center gap-2 text-zinc-900 dark:text-white font-mono text-sm hover:underline" href="https://github.com/KIIAREN/KIIAREN" target="_blank" rel="noopener noreferrer">
                View Source <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="p-8 lg:p-12 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-r-lg lg:rounded-l-none rounded-b-lg lg:rounded-tr-lg">
              <div className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-2">ENTERPRISE CLOUD</div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Managed Cloud</h3>
              <ul className="space-y-4 mb-10">
                {['Automated backups & redundancy', 'SSO (SAML/OIDC) enforcement', 'Audit logs & compliance reporting', 'Dedicated support engineer'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-900 dark:text-white font-medium">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Operators Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-sm font-mono uppercase tracking-widest text-zinc-500 mb-16">Designed for operators</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
              <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Engineering</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                API-first design. Integrate KIIAREN directly into your CI/CD pipelines and internal tooling.
              </p>
            </div>
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
              <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Founders</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Retain total ownership of your organizational graph. No vendor lock-in on your data.
              </p>
            </div>
            <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900">
              <div className="w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <svg className="h-4 w-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">IT Operations</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Zero-touch provisioning via DNS. Scale to thousands of seats with predictable infrastructure costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mb-2">KIIAREN_</div>
            <p className="text-sm text-zinc-500 max-w-xs">
              The open-core workspace kernel for sovereignty-minded organizations.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a className="px-5 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm rounded" href="https://github.com/KIIAREN/KIIAREN" target="_blank" rel="noopener noreferrer">
              Explore Docs
            </a>
            <Button onClick={handleStart} disabled={isLoading}>
              {isLoading ? <Loader className="size-4 animate-spin" /> : 'Join Waitlist'}
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between text-xs text-zinc-500 font-mono">
          <div>2025 KiiAren Inc. System status: Normal.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a className="hover:text-zinc-900 dark:hover:text-white" href="#">Privacy</a>
            <a className="hover:text-zinc-900 dark:hover:text-white" href="#">Terms</a>
            <a className="hover:text-zinc-900 dark:hover:text-white" href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
