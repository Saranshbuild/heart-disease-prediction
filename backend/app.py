"""
Heart Disease Risk Prediction API
Flask backend serving ML predictions - Port 8080
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_pipeline import load_pipeline, predict, train_pipeline, CATEGORICAL_COLS, FEATURE_COLS
import os

app = Flask(__name__)
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

pipeline = None

def get_pipeline():
    global pipeline
    if pipeline is None:
        pipeline = load_pipeline()
    return pipeline


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/api/train', methods=['POST'])
def retrain():
    global pipeline
    pipeline = train_pipeline()
    return jsonify({
        'status': 'trained',
        'best_model': pipeline['best_model'],
        'results': pipeline['results'],
    })


@app.route('/api/info', methods=['GET'])
def info():
    p = get_pipeline()
    return jsonify({
        'best_model': p['best_model'],
        'available_models': list(p['models'].keys()),
        'metrics': p['results'],
        'top_features': p['top_features'],
        'feature_importance': {
            k: round(v, 4) for k, v in p['feature_importance'].items()
        },
        'categorical_options': CATEGORICAL_COLS,
        'feature_cols': FEATURE_COLS,
        'stats': {k: round(v, 2) for k, v in p['stats'].items()},
    })


@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict_endpoint():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    features = data.get('features', {})
    model_name = data.get('model', None)

    if not features:
        return jsonify({'error': 'No features provided'}), 400

    try:
        result = predict(features, model_name)
        p = get_pipeline()
        result['metrics'] = p['results'].get(result['model_used'], {})
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Loading ML pipeline...")
    get_pipeline()
    print("Server ready at http://localhost:8080")
    app.run(debug=True, port=8080, host='0.0.0.0')
