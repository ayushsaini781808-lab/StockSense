from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="StockSense ML Service")

LAGS = 5


class PredictRequest(BaseModel):
    symbol: str
    closes: list[float]


@app.get("/")
def root():
    return {"service": "stocksense-ml", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: PredictRequest):
    closes = np.array([c for c in req.closes if c and c > 0], dtype=float)
    if len(closes) < 35:
        raise HTTPException(status_code=400, detail="Need at least 35 closes")

    # Autoregressive features: previous LAGS closes -> next close
    X = np.array([closes[i:i + LAGS] for i in range(len(closes) - LAGS)])
    y = closes[LAGS:]

    # Chronological split (no shuffling for time series)
    split = int(len(X) * 0.8)
    model = LinearRegression().fit(X[:split], y[:split])

    pred_test = model.predict(X[split:])
    err = pred_test - y[split:]
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err ** 2)))

    # Refit on all data, forecast the next session
    model.fit(X, y)
    forecast = float(model.predict(closes[-LAGS:].reshape(1, -1))[0])
    last_close = float(closes[-1])
    change_pct = (forecast - last_close) / last_close * 100

    return {
        "symbol": req.symbol.upper(),
        "last_close": round(last_close, 2),
        "forecast": round(forecast, 2),
        "estimated_change_percent": round(change_pct, 2),
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "test_observations": int(len(X) - split),
        "model": "Linear Regression (5-lag autoregressive)",
    }