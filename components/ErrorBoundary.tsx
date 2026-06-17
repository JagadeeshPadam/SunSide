'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props { children: React.ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-6">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-2">
            {this.state.error.message}
          </p>
          <pre className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg p-3 max-w-lg overflow-x-auto mb-6">
            {this.state.error.stack?.split('\n').slice(0,4).join('\n')}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} />
            Reload & try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
