from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
import math

app = FastAPI(title="StockSense ML Service")

class PredictionRequest(BaseModel):
    symbol: str
    closes: list[float]

@app.get("/health")
def health():
    return {"status": "ok", "service": "StockSense ML"}

@app.post("/predict")
def predict(request: PredictionRequest):
    prices = np.array(request.closes, dtype=float)
    if len(prices) < 35:
        raise HTTPException(
            status_code=400,
            detail="At least 35 historical closing prices are required."
        )

    if not np.all(np.isfinite(prices)) or np.any(prices <= 0):
        raise HTTPException(
            status_code=400,
            detail="Prices must be valid positive numbers."
        )

    # Five previous closes predict the next close.
    X = []
    y = []
    for i in range(5, len(prices)):
        X.append(prices[i-5:i][::-1])
        y.append(prices[i])

    X = np.array(X)
    y = np.array(y)

    # Keep the latest observations for testing.
    split = int(len(X) * 0.8)
    if split < 10 or len(X) - split < 5:
        raise HTTPException(
            status_code=400,
            detail="Not enough data for reliable evaluation."
        )

    model = LinearRegression()
    model.fit(X[:split], y[:split])

    test_predictions = model.predict(X[split:])
    mae = mean_absolute_error(y[split:], test_predictions)
    rmse = math.sqrt(mean_squared_error(y[split:], test_predictions))

    # Retrain on all available history before forecasting.
    model.fit(X, y)
    next_price = float(model.predict(prices[-5:][::-1].reshape(1, -1))[0])

    return {
        "symbol": request.symbol,
        "model": "Linear Regression",
        "forecast": round(next_price, 2),
        "last_close": round(float(prices[-1]), 2),
        "estimated_change_percent": round(
            ((next_price / prices[-1]) - 1) * 100, 2
        ),
        "mae": round(float(mae), 2),
        "rmse": round(float(rmse), 2),
        "test_observations": len(y) - split,
        "disclaimer": "Experimental estimate, not a guaranteed future price."
    }
