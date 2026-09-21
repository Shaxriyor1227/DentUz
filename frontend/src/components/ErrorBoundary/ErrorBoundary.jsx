import React from 'react';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Production telemetry / Sentry / log dispatch can be hooked here
    console.error('DentUz ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <div className={styles.iconCircle}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            
            <h2 className={styles.title}>Kutilmagan xatolik yuz berdi</h2>
            <p className={styles.description}>
              Tizimda kichik texnik nosozlik aniqlandi. Ma'lumotlaringiz xavfsiz holatda saqlangan.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className={styles.debugDetails}>
                {this.state.error.toString()}
              </pre>
            )}

            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={this.handleReload}
                className={styles.primaryBtn}
              >
                Sahifani qayta yuklash
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className={styles.secondaryBtn}
              >
                Bosh sahifaga qaytish
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
