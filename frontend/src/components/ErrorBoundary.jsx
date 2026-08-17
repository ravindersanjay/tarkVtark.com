import React from 'react';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div data-testid="error-boundary-wrapper" style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#f8f9fa'
        }}>
          <h1 data-testid="error-boundary-title" style={{ color: '#dc3545' }}>⚠️ Something went wrong</h1>
          <p data-testid="error-boundary-message" style={{ color: '#6c757d', marginBottom: '20px' }}>
            The application encountered an error. Please try refreshing the page.
          </p>

          {this.state.error && (
            <details data-testid="error-boundary-details" style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              textAlign: 'left',
              maxWidth: '800px',
              margin: '20px auto'
            }}>
              <summary data-testid="error-boundary-summary" style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                Error Details (click to expand)
              </summary>
              <pre data-testid="error-boundary-pre" style={{
                overflow: 'auto',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            data-testid="error-boundary-refresh-button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

