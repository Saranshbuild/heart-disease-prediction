# CardioML — Heart Disease Risk Predictor

A full-stack ML web application based on:
> *"Heart Disease Risk Prediction: Evaluating Machine Learning Algorithms with Feature Reduction using LDA"*

---

## Project Structure

```
heart-app/
├── backend/
│   ├── app.py              # Flask API server
│   ├── ml_pipeline.py      # ML training & prediction pipeline
│   ├── heart.csv           # Dataset (Heart Disease UCI)
│   ├── requirements.txt
│   └── models/             # Auto-generated after training
│       └── pipeline.joblib
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── index.js
        └── components/
            ├── Header.js
            ├── PredictionForm.js
            ├── ResultCard.js
            ├── ModelMetrics.js
            └── LoadingSpinner.js
```

---

## Quick Start

### 1. Backend (Flask + ML)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# (Optional) Pre-train models
python ml_pipeline.py

# Start API server
python app.py
# → Running on http://localhost:5000
```

The pipeline auto-trains on first startup if no saved model is found.

---

### 2. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
# → Opens http://localhost:3000
```

The React dev server proxies `/api/*` to `http://localhost:5000`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/info` | Model metadata, top features, metrics |
| POST | `/api/predict` | Run prediction |
| POST | `/api/train` | Force retrain all models |

### POST /api/predict

```json
{
  "features": {
    "ST_Slope": "Flat",
    "ChestPainType": "ASY",
    "ExerciseAngina": "Y",
    "Cholesterol": 245,
    "Sex": "M",
    "FastingBS": "1"
  },
  "model": "SVM"
}
```

Response:
```json
{
  "prediction": 1,
  "probability": 82.3,
  "risk_level": "High",
  "model_used": "SVM",
  "best_model": "Logistic Regression",
  "metrics": { "accuracy": 85.87, "precision": 0.863, "recall": 0.8587, "f1": 0.857 }
}
```

---

## ML Pipeline Details

1. **Preprocessing**: Label encoding for categorical features (Sex, ChestPainType, RestingECG, ExerciseAngina, ST_Slope), StandardScaler normalization
2. **Feature Reduction**: Linear Discriminant Analysis (LDA) — 1 component for binary classification
3. **Models trained**: Logistic Regression, Random Forest, SVM (RBF kernel), KNN (k=5)
4. **Split**: 80% train / 20% test, stratified
5. **Best model selection**: Automatic by test accuracy
6. **Top features**: Identified by LDA discriminant coefficients

## Feature Importance (LDA-derived)

The form shows the **top 6 features** by LDA coefficient magnitude. These are typically:
- ST_Slope, ChestPainType, ExerciseAngina, Cholesterol, Sex, FastingBS

Remaining features (Age, RestingBP, RestingECG, MaxHR, Oldpeak) use dataset medians as defaults.

---

## Production Deployment

### Backend
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
```bash
npm run build
# Serve the build/ folder with nginx or serve
npx serve -s build -l 3000
```

For production, update the frontend API base URL in `App.js` to point to your server.
