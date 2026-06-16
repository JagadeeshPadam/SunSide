'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Wind, MapPin, ChevronDown } from 'lucide-react';
import { JourneyForm } from '@/components/JourneyForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAnalysis, useOptimization } from '@/hooks/useAnalysis';
import type { AnalysisRequest, AnalysisResult, DepartureOptimization } from '@/types';

type AppState = 'form' | 'loading' | 'results' | 'error';

export default function Home() {
  const [appState, setAppState] = React.useState<AppState>('form');
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [optimization, setOptimization] = React.useState<DepartureOptimization | undefined>();
  const [errorMsg, setErrorMsg] = React.useState('');
  const [lastRequest, setLastRequest] = React.useState<AnalysisRequest | null>(null);
  const [vehicleType, setVehicleType] = React.useState<AnalysisRequest['vehicleType']>('car');

  const analysis = useAnalysis();
  const optMutation = useOptimization();

  const handleSubmit = async (request: AnalysisRequest) => {
    setLastRequest(request);
    setVehicleType(request.vehicleType);
    setAppState('loading');
    setResult(null);
    setOptimization(undefined);

    try {
      const data = await analysis.mutateAsync(request);
      setResult(data.result);
      if (data.optimization) setOptimization(data.optimization);
      setAppState('results');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('error');
    }
  };

  const handleOptimize = async () => {
    if (!lastRequest) return;
    try {
      const data = await optMutation.mutateAsync({
        request: lastRequest,
        windowMinutes: lastRequest.optimizationWindowMinutes ?? 120,
      });
      setOptimization(data);
    } catch {
      // silently fail — user can retry
    }
  };

  const handleApplyTime = (time: string) => {
    if (!lastRequest) return;
    const updated = { ...lastRequest, departureTime: time };
    handleSubmit(updated);
  };

  const handleReset = () => {
    setAppState('form');
    setResult(null);
    setOptimization(undefined);
    setErrorMsg('');
    setLastRequest(null);
    analysis.reset();
  };

  return (
    <div className="min-h-screen flex flex-col hero-gradient">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg group-hover:shadow-amber-400/40 transition-shadow" />
              <Sun
                size={18}
                className="absolute inset-0 m-auto text-white animate-spin-slow"
                strokeWidth={2.5}
              />
            </div>
            <div className="leading-none">
              <span className="font-bold text-lg tracking-tight gradient-text">SunSide</span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-widest uppercase">
                Solar Optimizer
              </span>
            </div>
          </button>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#how" className="hover:text-slate-900 dark:hover:text-white transition-colors">How it works</a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── Form State ── */}
          {appState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero */}
              <div className="text-center pt-6 pb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
                >
                  <Wind size={12} />
                  AI-free · Pure solar physics
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4"
                >
                  Sit on the{' '}
                  <span className="gradient-text">right side</span>
                  <br className="hidden sm:block" /> of your journey.
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto"
                >
                  Enter your route and we&apos;ll calculate exactly which seat minimizes
                  direct sun exposure — using real solar angles, live weather, and route geometry.
                </motion.p>

                {/* Stats strip */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-8 mt-8 text-sm"
                >
                  {[
                    { label: 'Solar accuracy', value: '< 0.1°' },
                    { label: 'Segment resolution', value: '5 min' },
                    { label: 'Vehicle types', value: '4' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-2xl font-bold gradient-text">{s.value}</div>
                      <div className="text-slate-400 dark:text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Form card */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <JourneyForm onSubmit={handleSubmit} loading={false} />
              </motion.div>

              {/* How it works */}
              <motion.section
                id="how"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-24 pb-16"
              >
                <div className="text-center mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    How SunSide works
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Pure physics — no AI guesswork. Every recommendation is derived from
                    real solar geometry and your exact route.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      step: '01',
                      icon: '🗺️',
                      title: 'Route Geometry',
                      desc: 'We fetch your exact route and split it into 5-minute segments with precise headings.',
                    },
                    {
                      step: '02',
                      icon: '☀️',
                      title: 'Solar Position',
                      desc: 'SunCalc computes sun azimuth & altitude at each segment\'s exact location and time.',
                    },
                    {
                      step: '03',
                      icon: '🌤️',
                      title: 'Weather Impact',
                      desc: 'Cloud coverage from OpenWeatherMap modulates how much solar exposure you actually receive.',
                    },
                    {
                      step: '04',
                      icon: '💺',
                      title: 'Seat Recommendation',
                      desc: 'The side that faces away from the sun gets recommended, with a full timeline for long journeys.',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-6 hover:border-sky-300 dark:hover:border-sky-600 transition-colors group"
                    >
                      <div className="text-3xl mb-4">{item.icon}</div>
                      <div className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-200 dark:text-slate-700 group-hover:text-sky-200 dark:group-hover:text-sky-900 transition-colors">
                        {item.step}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </motion.div>
          )}

          {/* ── Loading State ── */}
          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState />
            </motion.div>
          )}

          {/* ── Results State ── */}
          {appState === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ResultsDashboard
                result={result}
                vehicleType={vehicleType}
                onOptimizeDeparture={handleOptimize}
                optimization={optimization}
                optimizationLoading={optMutation.isPending}
                onApplyOptimizedTime={handleApplyTime}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {/* ── Error State ── */}
          {appState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-16"
            >
              <ErrorState
                error={errorMsg}
                onRetry={() => {
                  if (lastRequest) handleSubmit(lastRequest);
                  else handleReset();
                }}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin size={13} />
            <span>Powered by OpenRouteService · OpenWeatherMap · SunCalc</span>
          </div>
          <span>© {new Date().getFullYear()} SunSide. Built for travelers.</span>
        </div>
      </footer>
    </div>
  );
}
