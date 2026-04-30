# CardioML — Heart Disease Risk Predictor

A full-stack ML web application based on:
> *"Heart Disease Risk Prediction: Evaluating Machine Learning Algorithms with Feature Reduction using LDA"*
> — Nasution et al., Universitas Lancang Kuning

---

## Project Structure

```
heart-app/
├── backend/
│   ├── app.py              # Flask API server (port 8080)
│   ├── ml_pipeline.py      # ML training & prediction pipeline
│   ├── heart.csv           # Dataset (Heart Disease UCI, 918 patients)
│   ├── requirements.txt
│   └── models/             # Auto-generated on first run (gitignored)
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
pip install -r requirements.txt
python app.py
# → Running on http://localhost:8080
```

> Models auto-train on first run and save to `backend/models/pipeline.joblib`.
> To retrain from scratch, delete that file and restart.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
# → Opens http://localhost:3000
```

> Make sure Flask is running on port 8080 before starting the frontend.

---

## Features

- 4 ML models — Logistic Regression, Random Forest, SVM, KNN
- LDA feature reduction before training
- Smart form — only asks top 6 LDA-identified features
- All models comparison — predictions from all 4 models side by side
- Model consensus indicator
- Dark / Light theme toggle
- Auto best model selection at runtime

---

## API Endpoints

Base URL: `http://localhost:8080`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/info` | Model metadata, top features, metrics |
| POST | `/api/predict` | Run prediction across all models |
| POST | `/api/train` | Force retrain all models |

### GET /api/health
```json
{ "status": "ok" }
```

### GET /api/info
Returns available models, best model, top features, accuracy metrics, and dataset stats.

### POST /api/predict

Request:
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
  "metrics": { "accuracy": 85.87, "precision": 0.863, "recall": 0.859, "f1": 0.857 },
  "all_models": {
    "Logistic Regression": { "prediction": 1, "probability": 91.2, "risk_level": "High" },
    "Random Forest":        { "prediction": 1, "probability": 78.4, "risk_level": "High" },
    "SVM":                  { "prediction": 1, "probability": 82.3, "risk_level": "High" },
    "KNN":                  { "prediction": 0, "probability": 41.0, "risk_level": "Medium" }
  }
}
```

### POST /api/train
Force retrains all models from scratch and returns updated metrics.

---

## Model Results

| Model | Accuracy | F1 |
|-------|----------|----|
| **Logistic Regression** ⭐ | **87.5%** | 0.874 |
| SVM | 85.9% | 0.857 |
| KNN | 79.9% | 0.799 |
| Random Forest | 77.7% | 0.777 |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `'LogisticRegression' has no attribute 'multi_class'` | Delete `backend/models/pipeline.joblib` and restart Flask |
| "Failed to connect to server" | Make sure Flask is running on port 8080 |
| Port 8080 in use | `lsof -ti:8080 \| xargs kill -9` then restart |

---

## Dataset

- **Source**: Heart Disease UCI Dataset (Kaggle)
- **Patients**: 918
- **Features**: 12 clinical attributes
- **Target**: HeartDisease (1 = yes, 0 = no)
