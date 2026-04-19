"use client";

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Globe Crash Trapped:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-slate-900 border border-red-500 rounded-xl p-8">
          <h2 className="text-red-500 font-bold text-xl mb-4">3D Telemetry Render Failure</h2>
          <p className="text-gray-400 font-mono text-sm max-w-sm text-center">
             WebGL Engine Error: {this.state.errorMessage}
          </p>
          <button 
             className="mt-6 bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors"
             onClick={() => window.location.reload()}
          >
             Re-Initialize Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
