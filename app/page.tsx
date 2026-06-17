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
      {/* Outer pulsing halo */}
      <div className="animate-scale-pulse" style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.08)',
      }} />
      {/* Mid ring */}
      <div className="animate-scale-pulse" style={{
        position: 'absolute', inset: size * 0.13, borderRadius: '50%',
        border: '1px solid rgba(0,0,0,0.11)',
        animationDelay: '0.6s',
      }} />
      {/* Rotating rays */}
      <div className="animate-spin-slow" style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: c - 0.5,
            top: c - size * 0.38,
            width: 1,
            height: size * 0.10,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
            transformOrigin: `0.5px ${size * 0.38}px`,
            transform: `rotate(${i * 30}deg)`,
          }} />
        ))}
      </div>
      {/* Glossy core */}
      <div style={{
        position: 'absolute',
        inset: c - coreR,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, #2a2a2e 0%, #09090B 100%)',
        boxShadow: '0 6px 32px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.20) inset',
      }} />
      {/* Gloss highlight */}
      <div style={{
        position: 'absolute', inset: c - coreR, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 33% 22%, rgba(255,255,255,0.28) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Floating nav (shared mobile + desktop)
───────────────────────────────────────────────────── */
function NavPill({ onReset }: { onReset: () => void }) {
  return (
    <header style={{
      position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, width: 'calc(100% - 28px)', maxWidth: 880,
    }}>
      <div style={{
        borderRadius: 999, padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,1) inset',
      }}>
        <button onClick={onReset} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          <div className="animate-spin-slow" style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(145deg, #2a2a2e, #09090B)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.18) inset',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
      </div>
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
    <div style={{ width: '100%', height: '100%', background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />
      <motion.div
        animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}
      >
        <HeroSun size={80} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic', fontSize: 18, fontWeight: 500, color: '#3F3F46' }}>Plan a journey</p>
          <p style={{ fontSize: 11, color: '#A1A1AA', letterSpacing: '0.04em', marginTop: 2 }}>Your route will appear here</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Page root
───────────────────────────────────────────────────── */
export default function Home() {
  const [appState, setAppState]   = React.useState<AppState>('form');
  const [result, setResult]       = React.useState<AnalysisResult | null>(null);
  const [optimization, setOptimization] = React.useState<DepartureOptimization | undefined>();
  const [errorMsg, setErrorMsg]   = React.useState('');
  const [lastRequest, setLastRequest] = React.useState<AnalysisRequest | null>(null);
  const [vehicleType, setVehicleType] = React.useState<AnalysisRequest['vehicleType']>('car');

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
      <div className="hidden lg:flex" style={{ height: '100dvh' }}>
        {/* Sidebar */}
        <div style={{
          width: 420, flexShrink: 0, height: '100dvh', overflowY: 'auto',
          borderRight: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF',
        }}>
          <div style={{ paddingTop: 90, paddingBottom: 48, paddingLeft: 36, paddingRight: 36 }}>
            <AnimatePresence mode="wait">
              {appState === 'form' && (
                <motion.div key="d-form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 12 }}>Solar Route Planner</p>
                  <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic', fontWeight: 600, fontSize: 46, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#09090B', marginBottom: 10 }}>
                    Travel smarter,<br />sit in the shade.
                  </h1>
                  <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.65, marginBottom: 36, maxWidth: 320 }}>
                    Solar physics calculates exactly which window seat gets the least direct sunlight on your route.
                  </p>
                  <JourneyForm onSubmit={handleSubmit} loading={false} />
                </motion.div>
              )}
              {appState === 'loading' && (
                <motion.div key="d-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LoadingState />
                </motion.div>
              )}
              {appState === 'results' && result && (
                <motion.div key="d-results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <ErrorBoundary>
                    <ResultsDashboard result={result} vehicleType={vehicleType} onOptimizeDeparture={handleOptimize} optimization={optimization} optimizationLoading={optMutation.isPending} onApplyOptimizedTime={handleApplyTime} onReset={handleReset} />
                  </ErrorBoundary>
                </motion.div>
              )}
              {appState === 'error' && (
                <motion.div key="d-error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <ErrorState error={errorMsg} onRetry={() => lastRequest ? handleSubmit(lastRequest) : handleReset()} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop footer credit */}
            <div style={{
              marginTop: 48, paddingTop: 20,
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
                  borderBottom: '1px solid rgba(0,0,0,0.25)',
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
          <MapPanel result={appState === 'results' ? result : null} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE (below lg) — no AnimatePresence,
          no opacity:0 traps, plain conditional render
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
   MobileView — extracted component, NO AnimatePresence,
   content is always immediately visible
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
      className="lg:hidden"
      style={{ minHeight: '100dvh', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── FORM ── */}
      {appState === 'form' && (
        <div style={{ flex: 1 }}>

          {/* Hero band */}
          <div style={{
            paddingTop: 88,
            paddingBottom: 32,
            paddingLeft: 20,
            paddingRight: 20,
            textAlign: 'center',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <HeroSun size={130} />

            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#A1A1AA', marginTop: 22, marginBottom: 10,
            }}>
              Solar Route Planner
            </p>

            <h1 style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontStyle: 'italic', fontWeight: 600,
              fontSize: 'clamp(32px, 9vw, 44px)',
              lineHeight: 1.12, letterSpacing: '-0.02em',
              color: '#09090B', marginBottom: 10,
            }}>
              Travel smarter,<br />sit in the shade.
            </h1>

            <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6, maxWidth: 270, margin: '0 auto' }}>
              Find the shadiest seat on any route using real solar physics.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              {[['< 0.1°', 'Solar accuracy'], ['5 min', 'Segments'], ['4', 'Vehicles']].map(([v, l]) => (
                <div key={l} style={{
                  background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 10, padding: '7px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic', fontSize: 17, fontWeight: 600, color: '#09090B' }}>{v}</div>
                  <div style={{ fontSize: 9, color: '#A1A1AA', marginTop: 1, letterSpacing: '0.04em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div style={{ padding: '20px 16px 0' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 20,
              padding: '22px 18px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.05), 0 1px 0 rgba(255,255,255,1) inset',
            }}>
              <JourneyForm onSubmit={onSubmit} loading={false} />
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: '28px 20px 80px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A1A1AA', textAlign: 'center', marginBottom: 20 }}>
              How it works
            </p>
            {[
              ['01', 'Route Geometry', 'Splits your journey into 5-minute segments with precise vehicle headings'],
              ['02', 'Solar Position',  'SunCalc computes sun azimuth and altitude for each segment in time'],
              ['03', 'Weather Layer',   'Cloud cover from OpenWeatherMap modulates the raw exposure score'],
              ['04', 'Seat Selection',  'The window with the least direct sun gets the recommendation'],
            ].map(([num, title, desc]) => (
              <div key={num} style={{
                display: 'flex', gap: 16, paddingTop: 16, paddingBottom: 16,
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontStyle: 'italic', fontSize: 24, fontWeight: 400,
                  color: '#D4D4D8', flexShrink: 0, width: 26, lineHeight: 1, marginTop: 1,
                }}>
                  {num}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#09090B', marginBottom: 3 }}>{title}</p>
                  <p style={{ fontSize: 12, color: '#71717A', lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {appState === 'loading' && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100dvh', paddingTop: 80, paddingLeft: 20, paddingRight: 20,
        }}>
          <LoadingState />
        </div>
      )}

      {/* ── RESULTS ── */}
      {appState === 'results' && result && (
        <div style={{ flex: 1, paddingTop: 76 }}>
          {/* Mini map */}
          <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
            <RouteMap mapSegments={result.mapData} source={undefined} destination={undefined} className="h-full w-full" />
            {/* fade edge */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
              background: 'linear-gradient(to bottom, transparent, #ffffff)',
              pointerEvents: 'none',
            }} />
          </div>
          <div style={{ padding: '0 16px 80px' }}>
            <ErrorBoundary>
              <ResultsDashboard
                result={result} vehicleType={vehicleType}
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
          padding: 24, minHeight: '100dvh',
        }}>
          <ErrorState error={errorMsg} onRetry={() => lastRequest ? onSubmit(lastRequest) : onReset()} />
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '14px 20px 18px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
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
              borderBottom: '1px solid rgba(0,0,0,0.25)',
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
