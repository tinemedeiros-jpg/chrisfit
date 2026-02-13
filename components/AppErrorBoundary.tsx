import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4fbff] flex items-center justify-center px-6 py-10">
          <div className="max-w-xl w-full bg-white border border-[#D05B92]/20 shadow-lg p-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-[#D05B92] mb-3">erro de interface</p>
            <h1 className="text-2xl font-semibold text-[#0f1c2e] mb-3">Não foi possível renderizar a tela.</h1>
            <p className="text-sm text-[#0f1c2e]/70 mb-6">
              Atualize a página para tentar novamente. Se o problema continuar, envie este erro para análise.
            </p>
            {this.state.message && (
              <p className="text-xs text-left bg-[#f4fbff] border border-[#D05B92]/20 p-3 mb-5 text-[#BA4680] break-all">
                {this.state.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="bg-[#D05B92] text-white px-5 py-2 rounded-full font-semibold hover:brightness-110 transition"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
