'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { JourneyForm } from '@/components/JourneyForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CommandMenu } from '@/components/CommandMenu';
import { useAnalysis, useOptimization } from '@/hooks/useAnalysis';
import type { AnalysisRequest, AnalysisResult, DepartureOptimization } from '@/types';

const RouteMap = dynamic(() => import('@/components/RouteMap').then(m => m.RouteMap), { ssr: false });

type AppState = 'form' | 'loading' | 'results' | 'error';

/* ─────────────────────────────────────────────────────
   Geometric monochrome sun
───────────────────────────────────────────────────── */
function HeroSun({ size = 160 }: { size?: number }) {
  const c = size / 2;
  const coreR = size * 0.22;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', flexShrink: 0 }}>
      <div className="animate-scale-pulse" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.07)',
      }} />
      <div className="animate-scale-pulse" style={{
        position: 'absolute', inset: size * 0.13, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.10)',
        animationDelay: '0.6s',
      }} />
      <div className="animate-scale-pulse" style={{
        position: 'absolute', inset: size * 0.26, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.07)',
        animationDelay: '1.2s',
      }} />
      <div className="animate-spin-slow" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: c - 0.5,
            top: c - size * 0.40,
            width: 1,
            height: size * 0.11,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)',
            transformOrigin: `0.5px ${size * 0.40}px`,
            transform: `rotate(${i * 30}deg)`,
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute',
        inset: c - coreR,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #2a2a2e 0%, #09090B 100%)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 0 rgba(255,255,255,0.22) inset',
      }} />
      <div style={{
        position: 'absolute', inset: c - coreR, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 33% 22%, rgba(255,255,255,0.30) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Floating nav pill
───────────────────────────────────────────────────── */
function NavPill({ onReset }: { onReset: () => void }) {
  return (
    <header style={{
      position: 'fixed',
      top: 'max(14px, env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      width: 'calc(100% - 28px)',
      maxWidth: 900,
    }}>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          borderRadius: 999, padding: '10px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,1) inset',
        }}
      >
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <div className="animate-spin-slow" style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(145deg, #2a2a2e, #09090B)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.18) inset',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic', fontWeight: 600,
              fontSize: 18, letterSpacing: '-0.01em', color: '#09090B',
              lineHeight: 1.1,
            }}>
              SunSide
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.12em', color: '#A1A1AA', textTransform: 'uppercase' }}>
              Solar Optimizer
            </div>
          </div>
        </button>
        <CommandMenu
          onReset={onReset}
          onShare={() => navigator.clipboard?.writeText(window.location.href)}
          onExport={() => window.print()}
          onToggleTheme={() => {}}
        />
      </motion.div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────
   Desktop map panel
───────────────────────────────────────────────────── */
function MapPanel({ result }: { result: AnalysisResult | null }) {
  if (result) {
    return <RouteMap mapSegments={result.mapData} source={undefined} destination={undefined} className="h-full w-full" />;
  }
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--surface-1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.45,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, position: 'relative', zIndex: 1 }}
      >
        <HeroSun size={90} />
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: '#3F3F46',
          }}>
            Plan a journey
          </p>
          <p style={{ fontSize: 12, color: '#A1A1AA', letterSpacing: '0.04em', marginTop: 4 }}>
            Your route will appear here
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Page root
───────────────────────────────────────────────────── */
export default function Home() {
  const [appState, setAppState]         = React.useState<AppState>('form');
  const [result, setResult]             = React.useState<AnalysisResult | null>(null);
  const [optimization, setOptimization] = React.useState<DepartureOptimization | undefined>();
  const [errorMsg, setErrorMsg]         = React.useState('');
  const [lastRequest, setLastRequest]   = React.useState<AnalysisRequest | null>(null);
  const [vehicleType, setVehicleType]   = React.useState<AnalysisRequest['vehicleType']>('car');

  const analysis    = useAnalysis();
  const optMutation = useOptimization();

  const handleSubmit = async (request: AnalysisRequest) => {
    setLastRequest(request);
    setVehicleType(request.vehicleType);
    setAppState('loading');
    setResult(null);
    setOptimization(undefined);
    try {
      const data = await analysis.mutateAsync(request);
      setResult(data);
      setAppState('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('error');
    }
  };

  const handleOptimize = async () => {
    if (!lastRequest) return;
    try {
      const opt = await optMutation.mutateAsync({
        request: lastRequest,
        windowMinutes: lastRequest.optimizationWindowMinutes ?? 120,
      });
      setOptimization(opt);
    } catch { /* silent */ }
  };

  const handleApplyTime = (time: string) => {
    if (lastRequest) handleSubmit({ ...lastRequest, departureTime: time });
    else handleReset();
  };

  const handleReset = () => {
    setAppState('form');
    setResult(null);
    setOptimization(undefined);
    setErrorMsg('');
    setLastRequest(null);
    analysis.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <NavPill onReset={handleReset} />

      {/* ═══════════════════════════════════════════
          DESKTOP (lg+)
      ═══════════════════════════════════════════ */}
      <div className="hidden lg:flex" style={{ height: '100dvh', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 440, flexShrink: 0, height: '100dvh', overflowY: 'auto',
          borderRight: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF',
        }}>
          <div style={{ paddingTop: 96, paddingBottom: 56, paddingLeft: 40, paddingRight: 40 }}>
            <AnimatePresence mode="wait">
              {appState === 'form' && (
                <motion.div
                  key="d-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 14 }}>
                    Solar Route Planner
                  </p>
                  <h1 style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontStyle: 'italic', fontWeight: 600,
                    fontSize: 48, lineHeight: 1.07, letterSpacing: '-0.02em',
                    color: '#09090B', marginBottom: 12,
                  }}>
                    Travel smarter,<br />sit in the shade.
                  </h1>
                  <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.65, marginBottom: 40, maxWidth: 340 }}>
                    Solar physics calculates exactly which window seat gets the least direct sunlight on your route.
                  </p>
                  <JourneyForm onSubmit={handleSubmit} loading={false} />
                </motion.div>
              )}
              {appState === 'loading' && (
                <motion.div
                  key="d-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoadingState />
                </motion.div>
              )}
              {appState === 'results' && result && (
                <motion.div
                  key="d-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <ErrorBoundary>
                    <ResultsDashboard
                      result={result}
                      vehicleType={vehicleType}
                      onOptimizeDeparture={handleOptimize}
                      optimization={optimization}
                      optimizationLoading={optMutation.isPending}
                      onApplyOptimizedTime={handleApplyTime}
                      onReset={handleReset}
                    />
                  </ErrorBoundary>
                </motion.div>
              )}
              {appState === 'error' && (
                <motion.div
                  key="d-error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.38 }}
                >
                  <ErrorState
                    error={errorMsg}
                    onRetry={() => lastRequest ? handleSubmit(lastRequest) : handleReset()}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{
              marginTop: 52, paddingTop: 22,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              fontSize: 11, color: '#A1A1AA',
            }}>
              Created by{' '}
              <a
                href="https://www.linkedin.com/in/jagadeeshpadam/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontStyle: 'italic', fontWeight: 600,
                  color: '#09090B', textDecoration: 'none',
                  borderBottom: '1px solid rgba(0,0,0,0.22)',
                  paddingBottom: 1,
                }}
              >
                Jag
              </a>
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, height: '100dvh', position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={appState === 'results' ? 'map' : 'placeholder'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', height: '100%' }}
            >
              <MapPanel result={appState === 'results' ? result : null} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE (below lg)
      ═══════════════════════════════════════════ */}
      <MobileView
        appState={appState}
        result={result}
        vehicleType={vehicleType}
        optimization={optimization}
        optimizationLoading={optMutation.isPending}
        errorMsg={errorMsg}
        lastRequest={lastRequest}
        onSubmit={handleSubmit}
        onOptimize={handleOptimize}
        onApplyTime={handleApplyTime}
        onReset={handleReset}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────
   MobileView
───────────────────────────────────────────────────── */
interface MobileViewProps {
  appState: AppState;
  result: AnalysisResult | null;
  vehicleType: AnalysisRequest['vehicleType'];
  optimization?: DepartureOptimization;
  optimizationLoading: boolean;
  errorMsg: string;
  lastRequest: AnalysisRequest | null;
  onSubmit: (r: AnalysisRequest) => void;
  onOptimize: () => void;
  onApplyTime: (t: string) => void;
  onReset: () => void;
}

function MobileView({
  appState, result, vehicleType, optimization, optimizationLoading,
  errorMsg, lastRequest, onSubmit, onOptimize, onApplyTime, onReset,
}: MobileViewProps) {
  return (
    <div
      className="lg:hidden flex flex-col"
      style={{ minHeight: '100dvh', background: '#FFFFFF' }}
    >
      {/* ── FORM ── */}
      {appState === 'form' && (
        <div style={{ flex: 1 }}>

          {/* Hero band */}
          <div style={{
            paddingTop: 'max(90px, calc(72px + env(safe-area-inset-top)))',
            paddingBottom: 28,
            paddingLeft: 20,
            paddingRight: 20,
            textAlign: 'center',
            background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <HeroSun size={clamp(100, 28, 130)} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#A1A1AA', marginTop: 20, marginBottom: 8,
              }}
            >
              Solar Route Planner
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              style={{
                fontFamily: 'var(--font-cormorant), Georgia, serif',
                fontStyle: 'italic', fontWeight: 600,
                fontSize: 'clamp(30px, 8.5vw, 42px)',
                lineHeight: 1.12, letterSpacing: '-0.02em',
                color: '#09090B', marginBottom: 10,
              }}
            >
              Travel smarter,<br />sit in the shade.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.30, duration: 0.4 }}
              style={{ fontSize: 13, color: '#71717A', lineHeight: 1.65, maxWidth: 280, margin: '0 auto 18px' }}
            >
              Find the shadiest seat on any route using real solar physics.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              style={{ display: 'flex', justifyContent: 'center', gap: 8 }}
            >
              {[['< 0.1°', 'Solar accuracy'], ['5 min', 'Segments'], ['4', 'Vehicles']].map(([v, l]) => (
                <div key={l} style={{
                  background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 12, padding: '8px 13px', textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontStyle: 'italic', fontSize: 16, fontWeight: 600, color: '#09090B',
                  }}>{v}</div>
                  <div style={{ fontSize: 9, color: '#A1A1AA', marginTop: 1, letterSpacing: '0.04em' }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ padding: '20px 16px 0' }}
          >
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 22,
              padding: '24px 18px',
              boxShadow: '0 6px 32px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,1) inset',
            }}>
              <JourneyForm onSubmit={onSubmit} loading={false} />
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            style={{ padding: '28px 20px 40px' }}
          >
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: '#A1A1AA',
              textAlign: 'center', marginBottom: 20,
            }}>
              How it works
            </p>
            {[
              ['01', 'Route Geometry', 'Splits your journey into 5-minute segments with precise vehicle headings'],
              ['02', 'Solar Position',  'SunCalc computes sun azimuth and altitude for each segment in time'],
              ['03', 'Weather Layer',   'Cloud cover from OpenWeatherMap modulates the raw exposure score'],
              ['04', 'Seat Selection',  'The window with the least direct sun gets the recommendation'],
            ].map(([num, title, desc], idx) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.07, duration: 0.35 }}
                style={{
                  display: 'flex', gap: 16, paddingTop: 16, paddingBottom: 16,
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontStyle: 'italic', fontSize: 22, fontWeight: 400,
                  color: '#D4D4D8', flexShrink: 0, width: 26, lineHeight: 1, marginTop: 2,
                }}>
                  {num}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#09090B', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── LOADING ── */}
      {appState === 'loading' && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100dvh',
          paddingTop: 'max(80px, calc(64px + env(safe-area-inset-top)))',
          paddingLeft: 20, paddingRight: 20,
        }}>
          <LoadingState />
        </div>
      )}

      {/* ── RESULTS ── */}
      {appState === 'results' && result && (
        <div style={{ flex: 1, paddingTop: 'max(72px, calc(58px + env(safe-area-inset-top)))' }}>
          {/* Map */}
          <div style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
            <RouteMap
              mapSegments={result.mapData}
              source={undefined}
              destination={undefined}
              className="h-full w-full"
            />
            {/* Bottom fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 48,
              background: 'linear-gradient(to bottom, transparent, #ffffff)',
              pointerEvents: 'none',
            }} />
          </div>

          <div style={{ padding: '0 16px', paddingBottom: 'max(80px, calc(64px + env(safe-area-inset-bottom)))' }}>
            <ErrorBoundary>
              <ResultsDashboard
                result={result}
                vehicleType={vehicleType}
                onOptimizeDeparture={onOptimize}
                optimization={optimization}
                optimizationLoading={optimizationLoading}
                onApplyOptimizedTime={onApplyTime}
                onReset={onReset}
              />
            </ErrorBoundary>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {appState === 'error' && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px', minHeight: '100dvh',
        }}>
          <ErrorState
            error={errorMsg}
            onRetry={() => lastRequest ? onSubmit(lastRequest) : onReset()}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '14px 20px',
        paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#A1A1AA' }}>
          <MapPin size={10} />
          OpenRouteService · OpenWeatherMap · SunCalc
        </div>
        <div style={{ fontSize: 11, color: '#71717A' }}>
          Created by{' '}
          <a
            href="https://www.linkedin.com/in/jagadeeshpadam/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic', fontWeight: 600,
              color: '#09090B', textDecoration: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.22)',
              paddingBottom: 1,
            }}
          >
            Jag
          </a>
        </div>
      </div>
    </div>
  );
}

/* viewport-clamped size helper (pure, no hooks) */
function clamp(_min: number, _vw: number, max: number): number {
  return max; // SSR-safe fallback; CSS clamp handles real responsiveness
}
