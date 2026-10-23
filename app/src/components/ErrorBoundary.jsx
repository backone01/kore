import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Terjadi Kendala Tampilan</h2>
              <p className="text-xs text-muted-foreground">
                Aplikasi mengalami kendala saat merender komponen. Klik tombol di bawah untuk memuat ulang.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-[11px] font-mono text-left bg-secondary/50 p-2.5 rounded-lg text-muted-foreground overflow-x-auto max-h-32">
                {this.state.error?.toString()}
              </pre>
            )}
            <Button onClick={this.handleReset} className="w-full gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
