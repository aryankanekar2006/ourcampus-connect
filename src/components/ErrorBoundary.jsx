import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-gray-800">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-red-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">
              !
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              An unexpected application error occurred. Click below to clear local cache and restart OurCampus Connect portal.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              Reset App Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
