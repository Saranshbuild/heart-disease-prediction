import React from 'react';

const RECOMMENDATIONS = {
  Low: "Your risk profile appears low based on the provided clinical indicators. Continue maintaining a healthy lifestyle with regular exercise, balanced nutrition, and routine check-ups.",
  Medium: "Your indicators suggest a moderate risk. Consider consulting a cardiologist for a thorough evaluation. Lifestyle modifications — including diet changes, increased activity, and stress management — are advisable.",
  High: "Your risk profile indicates elevated cardiovascular risk. Please seek immediate medical consultation. Early intervention is critical — inform your doctor about these findings promptly.",
};

export default function ResultCard({ result }) {
  const { probability, risk_level, model_used, metrics } = result;
  const level = risk_level.toLowerCase();

  return (
    <div className="result-card">
      <div className="result-header">
        <h3>Risk Assessment Result</h3>
        <span className="result-model-badge">Model: {model_used}</span>
      </div>

      <div className="result-body">
        <div className="risk-gauge">
          <div className={`gauge-circle ${level}`}>
            <span className="gauge-percent">{probability}%</span>
            <span className="gauge-label">Risk Score</span>
          </div>
          <div className={`risk-level-label ${level}`}>{risk_level} Risk</div>
        </div>

        <div className="result-details">
          <div className="detail-row">
            <span className="detail-label">Prediction</span>
            <span className="detail-value" style={{ color: result.prediction === 1 ? 'var(--danger)' : 'var(--success)' }}>
              {result.prediction === 1 ? 'Heart Disease Detected' : 'No Heart Disease'}
            </span>
          </div>
          {metrics && (
            <>
              <div className="detail-row">
                <span className="detail-label">Model Accuracy</span>
                <span className="detail-value">{metrics.accuracy}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">F1 Score</span>
                <span className="detail-value">{(metrics.f1 * 100).toFixed(1)}%</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="risk-bar-container">
        <div className="risk-bar-label">Risk Probability</div>
        <div className="risk-bar-track">
          <div
            className={`risk-bar-fill ${level}`}
            style={{ width: `${probability}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span>0% Low</span>
          <span>35% Med</span>
          <span>65% High</span>
          <span>100%</span>
        </div>
      </div>

      <div className={`recommendation ${level}`}>
        <strong>Recommendation: </strong>{RECOMMENDATIONS[risk_level]}
      </div>
    </div>
  );
}
