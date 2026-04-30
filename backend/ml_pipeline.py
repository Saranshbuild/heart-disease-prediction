"""
Heart Disease Risk Prediction - ML Pipeline
Based on: "Heart Disease Risk Prediction: Evaluating Machine Learning 
Algorithms with Feature Reduction using LDA"
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import warnings
warnings.filterwarnings('ignore')

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'heart.csv')

# Categorical columns and their encodings
CATEGORICAL_COLS = {
    'Sex': ['F', 'M'],
    'ChestPainType': ['ASY', 'ATA', 'NAP', 'TA'],
    'RestingECG': ['LVH', 'Normal', 'ST'],
    'ExerciseAngina': ['N', 'Y'],
    'ST_Slope': ['Down', 'Flat', 'Up'],
}

FEATURE_COLS = ['Age', 'Sex', 'ChestPainType', 'RestingBP', 'Cholesterol',
                'FastingBS', 'RestingECG', 'MaxHR', 'ExerciseAngina',
                'Oldpeak', 'ST_Slope']
TARGET_COL = 'HeartDisease'


def load_and_preprocess(data_path=DATA_PATH):
    df = pd.read_csv(data_path)

    # Encode categorical columns
    encoders = {}
    for col, categories in CATEGORICAL_COLS.items():
        le = LabelEncoder()
        le.classes_ = np.array(categories)
        df[col] = le.transform(df[col])
        encoders[col] = le

    X = df[FEATURE_COLS].values
    y = df[TARGET_COL].values

    # Compute dataset stats for defaults
    stats = {
        col: float(df[col].median()) for col in FEATURE_COLS
    }

    return X, y, encoders, stats


def train_pipeline():
    os.makedirs(MODEL_DIR, exist_ok=True)
    X, y, encoders, stats = load_and_preprocess()

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Normalize
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # LDA (binary classification → max 1 component)
    lda = LinearDiscriminantAnalysis(n_components=1)
    X_train_lda = lda.fit_transform(X_train_scaled, y_train)
    X_test_lda = lda.transform(X_test_scaled)

    # Feature importance via LDA scalings * scaler std adjustment
    raw_scalings = np.abs(lda.scalings_[:, 0])
    feature_importance = dict(zip(FEATURE_COLS, raw_scalings.tolist()))

    # Top features (top 6 by LDA importance)
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    top_features = [f[0] for f in sorted_features[:6]]

    # Train models
    models_def = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'KNN': KNeighborsClassifier(n_neighbors=5),
    }

    results = {}
    trained_models = {}

    for name, model in models_def.items():
        model.fit(X_train_lda, y_train)
        y_pred = model.predict(X_test_lda)
        y_prob = model.predict_proba(X_test_lda)[:, 1]

        results[name] = {
            'accuracy': round(accuracy_score(y_test, y_pred) * 100, 2),
            'precision': round(precision_score(y_test, y_pred, average='weighted'), 4),
            'recall': round(recall_score(y_test, y_pred, average='weighted'), 4),
            'f1': round(f1_score(y_test, y_pred, average='weighted'), 4),
        }
        trained_models[name] = model

    # Select best model by accuracy
    best_model_name = max(results, key=lambda k: results[k]['accuracy'])

    # Save everything
    pipeline = {
        'scaler': scaler,
        'lda': lda,
        'models': trained_models,
        'encoders': encoders,
        'stats': stats,
        'results': results,
        'best_model': best_model_name,
        'feature_importance': feature_importance,
        'top_features': top_features,
        'feature_cols': FEATURE_COLS,
    }
    joblib.dump(pipeline, os.path.join(MODEL_DIR, 'pipeline.joblib'))
    print(f"✅ Training complete. Best model: {best_model_name} ({results[best_model_name]['accuracy']}%)")
    print(f"Top features: {top_features}")
    return pipeline


def load_pipeline():
    path = os.path.join(MODEL_DIR, 'pipeline.joblib')
    if not os.path.exists(path):
        return train_pipeline()
    return joblib.load(path)


def predict(input_data: dict, model_name: str = None):
    """
    input_data: dict with feature values (only top features needed, rest use defaults)
    model_name: which model to use; None = best model
    """
    pipeline = load_pipeline()
    scaler = pipeline['scaler']
    lda = pipeline['lda']
    models = pipeline['models']
    encoders = pipeline['encoders']
    stats = pipeline['stats']
    best_model = pipeline['best_model']

    if model_name is None or model_name not in models:
        model_name = best_model

    # Build feature vector using defaults for missing features
    feature_vector = []
    for col in FEATURE_COLS:
        if col in input_data:
            val = input_data[col]
            if col in encoders:
                # Encode categorical
                le = encoders[col]
                val = int(np.where(le.classes_ == val)[0][0])
            feature_vector.append(float(val))
        else:
            feature_vector.append(float(stats[col]))

    X = np.array([feature_vector])
    X_scaled = scaler.transform(X)
    X_lda = lda.transform(X_scaled)

    model = models[model_name]
    prediction = int(model.predict(X_lda)[0])
    probability = float(model.predict_proba(X_lda)[0][1])

    risk_level = (
        'Low' if probability < 0.35 else
        'Medium' if probability < 0.65 else
        'High'
    )

    return {
        'prediction': prediction,
        'probability': round(probability * 100, 1),
        'risk_level': risk_level,
        'model_used': model_name,
        'best_model': best_model,
    }


if __name__ == '__main__':
    pipeline = train_pipeline()
    print("\nModel Results:")
    for m, r in pipeline['results'].items():
        print(f"  {m}: Acc={r['accuracy']}%, P={r['precision']}, R={r['recall']}, F1={r['f1']}")
