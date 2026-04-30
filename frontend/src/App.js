import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import ModelMetrics from './components/ModelMetrics';
import LoadingSpinner from './components/LoadingSpinner';

const API = 'http://localhost:8080';

function App() {
  const [theme, setTheme] = useState('dark');
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API}/api/info`);
      const data = await res.json();
      setAppInfo(data);
      setSelectedModel(data.best_model);
    } catch (e) {
      setError('Failed to connect to server. Make sure the Flask backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (features) => {
    setPredicting(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features, model: selectedModel }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setPredicting(false);
    }
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-content">
        {loading ? (
          <div className="center-loader">
            <LoadingSpinner />
            <p className="loading-text">Initializing ML Pipeline...</p>
          </div>
        ) : error && !appInfo ? (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <section className="hero-section">
              <div className="hero-content">
                <div className="hero-badge">AI-Powered Diagnosis Tool</div>
                <h1 className="hero-title">
                  Heart Disease<br />
                  <span className="hero-accent">Risk Predictor</span>
                </h1>
                <p className="hero-subtitle">
                  Leveraging 4 ML algorithms with LDA feature reduction,
                  trained on clinical heart disease data to assess your cardiovascular risk.
                </p>
                <div className="hero-stats">
                  {appInfo && Object.entries(appInfo.metrics).map(([name, m]) => (
                    <div key={name} className={`stat-chip ${name === appInfo.best_model ? 'best' : ''}`}>
                      <span className="stat-model">{name}</span>
                      <span className="stat-acc">{m.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hero-visual">
                <HeartAnimation />
              </div>
            </section>

            <section className="form-section">
              <div className="section-header">
                <h2>Patient Assessment</h2>
                <p>Enter clinical values to receive a risk prediction</p>
              </div>

              {appInfo && (
                <div className="model-selector-row">
                  <label className="model-label">Prediction Model</label>
                  <div className="model-buttons">
                    {appInfo.available_models.map(m => (
                      <button
                        key={m}
                        className={`model-btn ${selectedModel === m ? 'active' : ''}`}
                        onClick={() => setSelectedModel(m)}
                      >
                        {m}
                        {m === appInfo.best_model && <span className="best-badge">Best</span>}
                        <span className="model-acc">{appInfo.metrics[m]?.accuracy}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {appInfo && (
                <PredictionForm
                  topFeatures={appInfo.top_features}
                  categoricalOptions={appInfo.categorical_options}
                  stats={appInfo.stats}
                  onPredict={handlePredict}
                  loading={predicting}
                />
              )}

              {error && (
                <div className="error-banner">
                  <span>⚠</span> {error}
                </div>
              )}
            </section>

            {(result || predicting) && (
              <section id="result-section" className="result-section">
                {predicting ? (
                  <div className="center-loader">
                    <LoadingSpinner />
                    <p className="loading-text">Analyzing risk factors...</p>
                  </div>
                ) : result && (
                  <ResultCard result={result} />
                )}
              </section>
            )}

            {appInfo && (
              <section className="metrics-section">
                <div className="section-header">
                  <h2>Model Performance</h2>
                  <p>Evaluation metrics on held-out test data (20% split, LDA-reduced features)</p>
                </div>
                <ModelMetrics metrics={appInfo.metrics} bestModel={appInfo.best_model} />
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>Based on: <em>Heart Disease Risk Prediction: Evaluating ML Algorithms with Feature Reduction using LDA</em></p>
        <p>Dataset: Heart Disease UCI • Models: LR, RF, SVM, KNN</p>
      </footer>
    </div>
  );
}

function HeartAnimation() {
  return (
    <div className="heart-container">
      <svg viewBox="0 0 200 200" className="heart-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#hg)" className="pulse-ring" />
        <circle cx="100" cy="100" r="70" fill="url(#hg)" className="pulse-ring-2" />
        <path
          d="M100 145 C60 115, 30 95, 30 70 C30 50, 48 35, 65 35 C78 35, 90 43, 100 55 C110 43, 122 35, 135 35 C152 35, 170 50, 170 70 C170 95, 140 115, 100 145Z"
          fill="var(--accent)"
          className="heart-path"
        />
        <polyline
          points="20,105 45,105 55,80 65,130 75,65 85,105 100,105 115,105 130,105 155,105 180,105"
          fill="none"
          stroke="var(--accent-light)"
          strokeWidth="2"
          className="ecg-line"
        />
      </svg>
    </div>
  );
}

export default App;
