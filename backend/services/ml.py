from database import supabase
from datetime import datetime, timedelta, timezone
import numpy as np

METRICS = ["temperature", "humidity", "pressure"]


def calculate_accuracy():
    """Proper accuracy — train on 80% of data, test on remaining 20%."""
    results = {}

    data = supabase.table("sensor_readings").select(
        "temperature,humidity,pressure,created_at"
    ).order("created_at", desc=True).limit(200).execute().data

    if len(data) < 10:
        return {}

    data = list(reversed(data))

    for metric in METRICS:
        values = [float(r[metric]) for r in data if r[metric] is not None]
        if len(values) < 10:
            continue

        X = np.arange(len(values), dtype=float)
        Y = np.array(values)
        X_norm = (X - X.mean()) / (X.std() + 1e-8)

        # 80% train, 20% test — never touch test data during fitting
        split = int(len(values) * 0.8)
        X_train, X_test = X_norm[:split], X_norm[split:]
        Y_train, Y_test = Y[:split], Y[split:]

        degree = best_polynomial_degree(X_train, Y_train)
        coeffs = np.polyfit(X_train, Y_train, degree)
        poly = np.poly1d(coeffs)

        # Accuracy measured only on the 20% the model never saw
        test_preds = poly(X_test)
        errors = np.abs(Y_test - test_preds)
        avg_error_pct = float(np.mean(errors / (np.abs(Y_test) + 1e-8) * 100))
        accuracy = round(max(0.0, 100.0 - avg_error_pct), 1)

        results[metric] = {
            "accuracy_percent": accuracy,
            "avg_error_percent": round(avg_error_pct, 2),
            "samples_compared": len(Y_test),
            "degree_used": degree,
        }

    return results


def best_polynomial_degree(X, Y):
    if len(X) < 6:
        return 1
    best_degree = 1
    best_score = float('inf')
    for degree in range(1, 6):
        if len(X) < degree + 2:
            continue
        split = max(int(len(X) * 0.8), 1)
        X_train, X_val = X[:split], X[split:]
        Y_train, Y_val = Y[:split], Y[split:]
        if len(X_val) == 0:
            continue
        try:
            coeffs = np.polyfit(X_train, Y_train, degree)
            poly = np.poly1d(coeffs)
            mse = np.mean((Y_val - poly(X_val)) ** 2)
            score = mse * (1 + 0.05 * degree)
            if score < best_score:
                best_score = score
                best_degree = degree
        except Exception:
            continue
    return best_degree


def run_predictions():
    data = supabase.table("sensor_readings").select(
        "temperature,humidity,pressure,created_at"
    ).order("created_at", desc=True).limit(200).execute().data

    if len(data) < 5:
        return

    data = list(reversed(data))

    supabase.table("predictions").delete().lt(
        "predicted_for", datetime.now(timezone.utc).isoformat()
    ).execute()

    for metric in METRICS:
        values = [float(r[metric]) for r in data if r[metric] is not None]
        if len(values) < 5:
            continue

        X = np.arange(len(values), dtype=float)
        Y = np.array(values)
        X_norm = (X - X.mean()) / (X.std() + 1e-8)

        degree = best_polynomial_degree(X_norm, Y)
        coeffs = np.polyfit(X_norm, Y, degree)
        poly = np.poly1d(coeffs)

        fitted = poly(X_norm)
        std = np.std(Y - fitted)
        y_mean = Y.mean()
        recent_avg = float(np.mean(values[-10:]))

        x_mean = X.mean()
        x_std = X.std() + 1e-8
        now = datetime.now(timezone.utc)
        rows = []

        for i in range(1, 13):
            future_x_norm = (float(len(values) + i) - x_mean) / x_std
            poly_pred = float(poly(future_x_norm))
            blend = min(i / 12.0, 0.4)
            predicted = poly_pred * (1 - blend) + recent_avg * blend
            confidence = max(0.0, 1.0 - (std / (abs(y_mean) + 1e-5)) - i * 0.015)
            rows.append({
                "metric": metric,
                "predicted_for": (now + timedelta(minutes=30 * i)).isoformat(),
                "predicted_value": round(predicted, 2),
                "confidence": round(confidence, 3),
            })

        supabase.table("predictions").insert(rows).execute()
        print(f"[ML] {metric} degree={degree} accuracy={100 - float(np.mean(np.abs(Y - fitted) / (np.abs(Y) + 1e-8) * 100)):.1f}%")