import React, { useState } from 'react';

const FEATURE_META = {
  Age: { label: 'Age', type: 'number', min: 1, max: 120, unit: 'years', placeholder: '28–77' },
  Sex: { label: 'Biological Sex', type: 'select', options: ['M', 'F'], optionLabels: { M: 'Male', F: 'Female' } },
  ChestPainType: {
    label: 'Chest Pain Type', type: 'select',
    options: ['ASY', 'ATA', 'NAP', 'TA'],
    optionLabels: { ASY: 'Asymptomatic', ATA: 'Atypical Angina', NAP: 'Non-Anginal Pain', TA: 'Typical Angina' }
  },
  RestingBP: { label: 'Resting Blood Pressure', type: 'number', min: 0, max: 250, unit: 'mm Hg', placeholder: '80–200' },
  Cholesterol: { label: 'Serum Cholesterol', type: 'number', min: 0, max: 700, unit: 'mg/dL', placeholder: '0–600' },
  FastingBS: { label: 'Fasting Blood Sugar > 120 mg/dL', type: 'select', options: ['0', '1'], optionLabels: { '0': 'No', '1': 'Yes' } },
  RestingECG: {
    label: 'Resting ECG Result', type: 'select',
    options: ['Normal', 'ST', 'LVH'],
    optionLabels: { Normal: 'Normal', ST: 'ST-T Wave Abnormality', LVH: 'Left Ventricular Hypertrophy' }
  },
  MaxHR: { label: 'Max Heart Rate Achieved', type: 'number', min: 60, max: 250, unit: 'bpm', placeholder: '60–202' },
  ExerciseAngina: { label: 'Exercise-Induced Angina', type: 'select', options: ['N', 'Y'], optionLabels: { N: 'No', Y: 'Yes' } },
  Oldpeak: { label: 'Oldpeak (ST Depression)', type: 'number', min: -5, max: 10, step: 0.1, unit: 'mm', placeholder: '-2.6 to 6.2' },
  ST_Slope: {
    label: 'Slope of Peak Exercise ST', type: 'select',
    options: ['Down', 'Flat', 'Up'],
    optionLabels: { Down: 'Downsloping', Flat: 'Flat', Up: 'Upsloping' }
  },
};

export default function PredictionForm({ topFeatures, categoricalOptions, stats, onPredict, loading }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    topFeatures.forEach(f => {
      const meta = FEATURE_META[f];
      const val = values[f];
      if (val === undefined || val === '') {
        errs[f] = 'Required';
      } else if (meta.type === 'number') {
        const n = parseFloat(val);
        if (isNaN(n)) errs[f] = 'Must be a number';
        else if (meta.min !== undefined && n < meta.min) errs[f] = `Min: ${meta.min}`;
        else if (meta.max !== undefined && n > meta.max) errs[f] = `Max: ${meta.max}`;
      }
    });
    return errs;
  };

  const handleChange = (field, value) => {
    setValues(v => ({ ...v, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Build feature payload: top features from user, rest from dataset median
    const features = {};
    topFeatures.forEach(f => {
      const meta = FEATURE_META[f];
      features[f] = meta.type === 'number' ? parseFloat(values[f]) : values[f];
    });

    // remaining features use defaults from stats
    Object.keys(FEATURE_META).forEach(f => {
      if (!topFeatures.includes(f)) {
        // For numeric, use median; for categorical, use most common (encoded median ≈ category)
        // We pass the raw numeric median and let backend handle encoding internally
        // Actually for categoricals, let's pass nothing so backend uses its defaults
      }
    });

    onPredict(features);
  };

  return (
    <div className="prediction-form">
      <div className="form-note">
        <strong>Top {topFeatures.length} features</strong> identified by LDA as most predictive.
        Remaining features are handled automatically using population median values from the training dataset.
      </div>

      <div className="form-grid">
        {topFeatures.map(field => {
          const meta = FEATURE_META[field];
          if (!meta) return null;
          return (
            <div key={field} className="form-field">
              <label className="field-label">
                {meta.label}
                <span>Key Feature</span>
                {meta.unit && <span style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem' }}>{meta.unit}</span>}
              </label>
              {meta.type === 'select' ? (
                <select
                  className="field-select"
                  value={values[field] || ''}
                  onChange={e => handleChange(field, e.target.value)}
                >
                  <option value="">Select...</option>
                  {meta.options.map(opt => (
                    <option key={opt} value={opt}>
                      {meta.optionLabels ? meta.optionLabels[opt] : opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className={`field-input ${errors[field] ? 'error' : ''}`}
                  placeholder={meta.placeholder || ''}
                  value={values[field] || ''}
                  step={meta.step || 1}
                  min={meta.min}
                  max={meta.max}
                  onChange={e => handleChange(field, e.target.value)}
                />
              )}
              {errors[field] && <span className="field-error">{errors[field]}</span>}
            </div>
          );
        })}
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Analyzing...
          </>
        ) : (
          <>♥ Predict Heart Disease Risk</>
        )}
      </button>
    </div>
  );
}
