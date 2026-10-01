# StockSense AI - Indian Stock Price Predictor & IPO Hub

**Date:** 28 Sep 2026  
**Version:** 1.0  
**Status:** MVP  

StockSense is a comprehensive web platform for Indian retail investors that provides AI-generated price targets for NSE/BSE listed stocks, a complete IPO tracking section, and a Gemini-powered AI chatbot.

## 🚀 Features

*   **AI Stock Predictions:** View price targets across 5 time horizons (1 hour, 1 day, 5 days, 1 month, 1 year) with confidence intervals and directional indicators (Bullish, Bearish, Neutral).
*   **IPO Hub:** Track upcoming, open, and closed IPOs (Mainboard & SME). Features include Grey Market Premium (GMP) history, live subscription data, and AI-generated verdicts (Apply / Avoid / Neutral).
*   **Market Screener:** Screen 5,000+ stocks based on AI signals, prediction confidence, and sectors.
*   **AI Chatbot:** Built-in assistant powered by Google Gemini, grounded in Indian stock market context to answer queries regarding technicals, fundamentals, and IPOs in English and Hindi.
*   **Modern UI:** Dark-themed, glassmorphic UI built for speed and aesthetics, delivering a premium user experience.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, Vanilla JavaScript, CSS3 (Custom Design System without external dependencies)
*   **Backend:** Python, FastAPI (API endpoints and secure AI proxy)
*   **AI Integration:** Google Gemini API 
*   **Architecture:** Decoupled client-server architecture with CORS enabled for seamless local development.

## 📦 Project Structure

```text
stock predictor/
│
├── index.html          # Dashboard / Homepage
├── stocks.html         # All Stocks listing
├── stock.html          # Detailed stock view with predictions & charts
├── ipo.html            # IPO Hub
├── screener.html       # AI Stock Screener
├── chatbot.html        # Conversational AI assistant
├── login.html          # User authentication UI
│
├── css/
│   └── style.css       # Global design system and styles
│
├── js/
│   ├── app.js          # Main frontend interactions and DOM manipulation
│   └── data.js         # Client-side fallback data (Mocking the DB)
│
└── backend/
    ├── main.py         # FastAPI application and endpoints
    └── requirements.txt# Backend dependencies
```

## 🏁 Getting Started

### 1. Running the Frontend (UI)

The frontend is built with pure HTML/CSS/JS and can be served through any basic web server.

1.  Open a terminal in the root directory (`stock predictor/`).
2.  Run a local server. If you have Node.js installed:
    ```bash
    npx serve . -p 3000
    ```
3.  Open your browser and navigate to `http://localhost:3000`.

### 2. Running the Backend (FastAPI)

The backend provides the secure proxy for the Gemini AI chatbot and serves the mock data APIs.

1.  Open a new terminal and navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server using Uvicorn:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
4.  The API will be available at `http://localhost:8000`. You can view the automatic API documentation at `http://localhost:8000/docs`.

### Backend API Endpoints:
*   `GET /api/stocks` - Get all stocks
*   `GET /api/stocks/{symbol}` - Get specific stock
*   `GET /api/ipos` - Get all IPO data
*   `POST /api/chat` - Secure endpoint for Gemini AI chatbot queries

## ⚠️ Disclaimer

StockSense AI predictions and AI chatbot responses are for **educational and informational purposes only**, and do not constitute SEBI-registered investment advice. The Grey Market Premium (GMP) is an unofficial indicator. Always consult a certified financial advisor before making investment decisions.
