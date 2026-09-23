"""
Train Random Forest Failure Risk Prediction Model (Section 24 & 38)
Trains Scikit-Learn ensemble model on the campus infrastructure dataset.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import joblib

DATASET_FILE = os.path.join(os.path.dirname(__file__), 'campus_maintenance_dataset.csv')
MODEL_FILE = os.path.join(os.path.dirname(__file__), 'random_forest_model.joblib')

def train():
    if not os.path.exists(DATASET_FILE):
        print("Dataset not found. Generating dataset first...")
        from generate_dataset import main as gen_data
        gen_data()

    print("Loading campus maintenance dataset...")
    df = pd.read_csv(DATASET_FILE)
    print(f"Loaded {len(df)} records. Columns: {list(df.columns)}")

    categorical_features = ['asset_type', 'criticality']
    numerical_features = [
        'asset_age_years', 'previous_failures', 'days_since_maintenance',
        'maintenance_count_12m', 'complaints_30d', 'severity', 'usage_hours_day'
    ]

    X = df[categorical_features + numerical_features]
    y = df['failure_next_30d']

    print(f"Target distribution (Failures: {sum(y == 1)}, Non-failures: {sum(y == 0)})")

    # 80/20 Stratified Train/Test Split (Section 38)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', 'passthrough', numerical_features)
        ]
    )

    # Random Forest Classifier (Section 24)
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', rf)
    ])

    print("Training Random Forest Classifier...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred)

    print("\n================ MODEL EVALUATION RESULTS (Section 38) ================")
    print(f"Accuracy:  {acc:.4f} ({acc*100:.1f}%)")
    print(f"Precision: {prec:.4f} ({prec*100:.1f}%)")
    print(f"Recall:    {rec:.4f} ({rec*100:.1f}%)")
    print(f"F1-Score:  {f1:.4f} ({f1*100:.1f}%)")
    print(f"ROC-AUC:   {auc:.4f}")
    print("\nConfusion Matrix [ [TN, FP], [FN, TP] ]:")
    print(cm)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("========================================================================\n")

    # Save pipeline
    joblib.dump(pipeline, MODEL_FILE)
    print(f"Trained model saved to: {MODEL_FILE}")

if __name__ == '__main__':
    train()
