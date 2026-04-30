import React from 'react';

export default function ModelMetrics({ metrics, bestModel }) {
  return (
    <div className="metrics-grid">
      {Object.entries(metrics).map(([name, m]) => (
        <div key={name} className={`metric-card ${name === bestModel ? 'best-card' : ''}`}>
          <div className="metric-card-header">
            <span className="metric-model-name">{name}</span>
            {name === bestModel && <span className="metric-best-tag">Best</span>}
          </div>
          <div className="metric-rows">
            {[
              { key: 'accuracy', label: 'Accuracy', value: `${m.accuracy}%`, pct: m.accuracy },
              { key: 'precision', label: 'Precision', value: `${(m.precision * 100).toFixed(1)}%`, pct: m.precision * 100 },
              { key: 'recall', label: 'Recall', value: `${(m.recall * 100).toFixed(1)}%`, pct: m.recall * 100 },
              { key: 'f1', label: 'F1 Score', value: `${(m.f1 * 100).toFixed(1)}%`, pct: m.f1 * 100 },
            ].map(({ key, label, value, pct }) => (
              <div key={key} className="metric-row">
                <span className="metric-name">{label}</span>
                <div className="metric-bar-wrap">
                  <div className="metric-bar">
                    <div className="metric-bar-inner" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="metric-val">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
