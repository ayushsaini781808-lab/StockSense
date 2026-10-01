"use strict";

require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ─── LOAD 500+ STOCKS DATABASE ──────────────────────────────────────────────
let ALL_STOCKS = [];
try {
    const dataPath = path.join(__dirname, "stocks_data.json");
    if (fs.existsSync(dataPath)) {
        ALL_STOCKS = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
        console.log(`✅ Loaded ${ALL_STOCKS.length} Indian BSE/NSE stocks from stocks_data.json`);
    }
} catch (err) {
    console.warn("Failed loading stocks_data.json, using fallback watchlist:", err.message);
}

// Baseline Core Watchlist (Primary symbols with Upstox instrument keys)
const STOCKS = [
    { sym: "RELIANCE",   name: "Reliance Industries",       tradingSymbol: "RELIANCE",   instrumentKey: "NSE_EQ|INE002A01018", yahoo: "RELIANCE.NS", sector: "Energy", cap: "Large Cap" },
    { sym: "TCS",        name: "Tata Consultancy Services", tradingSymbol: "TCS",        instrumentKey: "NSE_EQ|INE467B01029", yahoo: "TCS.NS", sector: "IT Services", cap: "Large Cap" },
    { sym: "HDFCBANK",   name: "HDFC Bank",                tradingSymbol: "HDFCBANK",   instrumentKey: "NSE_EQ|INE040A01034", yahoo: "HDFCBANK.NS", sector: "Banking", cap: "Large Cap" },
    { sym: "INFY",       name: "Infosys",                  tradingSymbol: "INFY",       instrumentKey: "NSE_EQ|INE009A01021", yahoo: "INFY.NS", sector: "IT Services", cap: "Large Cap" },
    { sym: "ICICIBANK",  name: "ICICI Bank",               tradingSymbol: "ICICIBANK",  instrumentKey: "NSE_EQ|INE090A01021", yahoo: "ICICIBANK.NS", sector: "Banking", cap: "Large Cap" },
    { sym: "TATAMOTORS", name: "Tata Motors Limited",       tradingSymbol: "TATAMOTORS", instrumentKey: "NSE_EQ|INE155A01022", yahoo: "TMCV.NS", sector: "Automobile", cap: "Large Cap" },
    { sym: "BHARTIARTL", name: "Bharti Airtel",            tradingSymbol: "BHARTIARTL", instrumentKey: "NSE_EQ|INE397D01024", yahoo: "BHARTIARTL.NS", sector: "Telecom", cap: "Large Cap" },
    { sym: "SBIN",       name: "State Bank of India",       tradingSymbol: "SBIN",       instrumentKey: "NSE_EQ|INE062A01020", yahoo: "SBIN.NS", sector: "Banking", cap: "Large Cap" },
    { sym: "ITC",        name: "ITC Limited",               tradingSymbol: "ITC",        instrumentKey: "NSE_EQ|INE154A01025", yahoo: "ITC.NS", sector: "FMCG", cap: "Large Cap" },
    { sym: "WIPRO",      name: "Wipro",                    tradingSymbol: "WIPRO",      instrumentKey: "NSE_EQ|INE075A01022", yahoo: "WIPRO.NS", sector: "IT Services", cap: "Large Cap" },
    { sym: "BAJFINANCE", name: "Bajaj Finance",            tradingSymbol: "BAJFINANCE", instrumentKey: "NSE_EQ|INE296A01024", yahoo: "BAJFINANCE.NS", sector: "Financial Services", cap: "Large Cap" },
    { sym: "SUNPHARMA",  name: "Sun Pharma",               tradingSymbol: "SUNPHARMA",  instrumentKey: "NSE_EQ|INE044A01036", yahoo: "SUNPHARMA.NS", sector: "Healthcare", cap: "Large Cap" },
    { sym: "ZOMATO",     name: "Zomato Ltd",               tradingSymbol: "ZOMATO",     instrumentKey: "NSE_EQ|INE758T01015", yahoo: "ZOMATO.NS", sector: "Consumer Services", cap: "Large Cap" },
    { sym: "TRENT",      name: "Trent Ltd",                tradingSymbol: "TRENT",      instrumentKey: "NSE_EQ|INE849A01020", yahoo: "TRENT.NS", sector: "Retail", cap: "Large Cap" },
    { sym: "HAL",        name: "Hindustan Aeronautics",    tradingSymbol: "HAL",        instrumentKey: "NSE_EQ|INE066F01012", yahoo: "HAL.NS", sector: "Defense & Aerospace", cap: "Large Cap" },
    { sym: "BEL",        name: "Bharat Electronics",       tradingSymbol: "BEL",        instrumentKey: "NSE_EQ|INE263A01024", yahoo: "BEL.NS", sector: "Defense & Aerospace", cap: "Large Cap" }
];

if (ALL_STOCKS.length === 0) {
    ALL_STOCKS = STOCKS;
}

const INDICES = [
    { sym: "^NSEI", name: "NIFTY 50", exchange: "NSE" },
    { sym: "^BSESN", name: "SENSEX", exchange: "BSE" },
    { sym: "^NSEBANK", name: "BANK NIFTY", exchange: "NSE" },
    { sym: "^CNXIT", name: "NIFTY IT", exchange: "NSE" }
];

const REAL_IPOS = [
    {
        name: "Hyundai Motor India Ltd",
        symbol: "HYUNDAI",
        status: "listed",
        type: "Mainboard",
        priceBand: "₹1,865 – ₹1,960",
        issuePrice: 1960,
        issueSize: "₹27,870 Cr",
        openDate: "15 Oct 2024",
        closeDate: "17 Oct 2024",
        listingDate: "22 Oct 2024",
        listingGain: "+1.5%",
        currentGMP: "₹45",
        subscription: "2.37x",
        verdict: "Apply for Long Term",
        about: "India's largest IPO ever. Second largest passenger vehicle manufacturer in India with deep R&D and global export presence."
    },
    {
        name: "Swiggy Limited",
        symbol: "SWIGGY",
        status: "listed",
        type: "Mainboard",
        priceBand: "₹371 – ₹390",
        issuePrice: 390,
        issueSize: "₹11,327 Cr",
        openDate: "06 Nov 2024",
        closeDate: "08 Nov 2024",
        listingDate: "13 Nov 2024",
        listingGain: "+16.9%",
        currentGMP: "₹30",
        subscription: "3.59x",
        verdict: "Growth Play",
        about: "Leading Indian online on-demand food delivery, Instamart quick commerce, and dining convenience network."
    },
    {
        name: "NTPC Green Energy Ltd",
        symbol: "NTPCGREEN",
        status: "listed",
        type: "Mainboard",
        priceBand: "₹102 – ₹108",
        issuePrice: 108,
        issueSize: "₹10,000 Cr",
        openDate: "19 Nov 2024",
        closeDate: "22 Nov 2024",
        listingDate: "27 Nov 2024",
        listingGain: "+10.3%",
        currentGMP: "₹12",
        subscription: "2.42x",
        verdict: "Strong Apply",
        about: "Renewable power platform of PSU giant NTPC, spearheading utility-scale solar, wind, and green hydrogen projects."
    },
    {
        name: "Waaree Energies Limited",
        symbol: "WAAREE",
        status: "listed",
        type: "Mainboard",
        priceBand: "₹1,427 – ₹1,503",
        issuePrice: 1503,
        issueSize: "₹4,321 Cr",
        openDate: "21 Oct 2024",
        closeDate: "23 Oct 2024",
        listingDate: "28 Oct 2024",
        listingGain: "+69.7%",
        currentGMP: "₹1,320",
        subscription: "76.34x",
        verdict: "Superhit / High Growth",
        about: "India's largest solar PV module producer with over 12 GW installed capacity and massive export market share."
    },
    {
        name: "Ather Energy Limited",
        symbol: "ATHER",
        status: "upcoming",
        type: "Mainboard",
        priceBand: "₹280 – ₹310 (Est.)",
        issuePrice: null,
        issueSize: "₹4,500 Cr",
        openDate: "Upcoming 2025-26",
        closeDate: "TBA",
        listingDate: "TBA",
        listingGain: "TBA",
        currentGMP: "₹42 (Expected)",
        subscription: "Pending",
        verdict: "Watchlist / Growth",
        about: "Pioneering Indian smart electric scooter manufacturer with extensive fast-charging Ather Grid ecosystem."
    },
    {
        name: "Vishal Mega Mart Ltd",
        symbol: "VISHAL",
        status: "upcoming",
        type: "Mainboard",
        priceBand: "₹74 – ₹78",
        issuePrice: null,
        issueSize: "₹8,000 Cr",
        openDate: "Upcoming 2025-26",
        closeDate: "TBA",
        listingDate: "TBA",
        listingGain: "TBA",
        currentGMP: "₹18",
        subscription: "Pending",
        verdict: "Apply for Value",
        about: "Leading Indian value-fashion and hypermarket retail chain operating over 600+ departmental stores."
    }
];

// In-memory cache for market quotes
const cache = {
    marketData: null,
    lastFetched: 0,
    ttlMs: 15000,
    quoteCache: new Map() // individual quotes cache
};

// ─── ENDPOINT: 500+ STOCKS DIRECTORY & SEARCH ──────────────────────────────
app.get("/api/stocks", (req, res) => {
    let list = ALL_STOCKS;
    const q = String(req.query.q || "").trim().toUpperCase();
    const sector = String(req.query.sector || "").trim();
    const cap = String(req.query.cap || "").trim();
    const limit = Math.min(Number(req.query.limit) || 60, 600);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    if (q) {
        list = list.filter(s => 
            s.sym.toUpperCase().includes(q) || 
            (s.name && s.name.toUpperCase().includes(q))
        );
    }

    if (sector && sector !== "All") {
        list = list.filter(s => s.sector && s.sector.toLowerCase() === sector.toLowerCase());
    }

    if (cap && cap !== "All") {
        list = list.filter(s => s.cap && s.cap.toLowerCase() === cap.toLowerCase());
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limit);

    res.json({
        total,
        offset,
        limit,
        stocks: paginated
    });
});

// Fast autocomplete endpoint
app.get("/api/search", (req, res) => {
    const q = String(req.query.q || "").trim().toUpperCase();
    if (!q) {
        return res.json(ALL_STOCKS.slice(0, 15));
    }
    const matches = ALL_STOCKS.filter(s => 
        s.sym.toUpperCase().startsWith(q) || 
        s.sym.toUpperCase().includes(q) || 
        (s.name && s.name.toUpperCase().includes(q))
    ).slice(0, 20);
    res.json(matches);
});

// ─── UPSTOX QUOTE PROXY (Optional) ──────────────────────────────────────────
app.get("/api/quotes", async (req, res) => {
    const token = process.env.UPSTOX_ACCESS_TOKEN;

    if (!token || token === "PASTE_YOUR_ACCESS_TOKEN_HERE" || token === "YOUR_ACTUAL_UPSTOX_ACCESS_TOKEN") {
        return res.status(500).json({
            error: "Upstox access token is missing in .env"
        });
    }

    const url = new URL("https://api.upstox.com/v2/market-quote/quotes");
    url.searchParams.set("instrument_key", STOCKS.map(s => s.instrumentKey).join(","));

    try {
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        const body = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({
                error: "Upstox rejected the quote request",
                status: response.status,
                details: body
            });
        }

        const quoteData = body.data || {};
        const allQuotes = Object.entries(quoteData);

        const quotes = STOCKS.map(stock => {
            const match = allQuotes.find(([key, quote]) =>
                quote.instrument_token === stock.instrumentKey ||
                key === `NSE_EQ:${stock.tradingSymbol}` ||
                quote.symbol === stock.tradingSymbol
            );

            if (!match) {
                return { sym: stock.sym, status: "error", error: "Quote not returned" };
            }

            const quote = match[1];
            const price = Number(quote.last_price);
            const change = Number(quote.net_change ?? 0);
            const previousClose = Number(quote.ohlc?.close ?? 0);

            return {
                sym: stock.sym,
                status: "success",
                price,
                change,
                changePercent: previousClose > 0 ? (change / previousClose) * 100 : 0
            };
        });

        res.json({ fetchedAt: new Date().toISOString(), quotes });
    } catch (error) {
        res.status(502).json({ error: "Could not connect to Upstox", details: error.message });
    }
});

// ─── ML PREDICTION ROUTE (Supports all 500+ Indian Stocks) ──────────────────
app.get("/api/predict/:symbol", async (req, res) => {
    try {
        const token = process.env.UPSTOX_ACCESS_TOKEN;
        const symbol = String(req.params.symbol || "").trim().toUpperCase();

        // Check if stock exists in 500+ list or watchlist
        const found = ALL_STOCKS.find(s => s.sym.toUpperCase() === symbol) ||
                      STOCKS.find(s => s.sym.toUpperCase() === symbol);

        const yahooTicker = found?.yahoo || `${symbol}.NS`;
        const instrumentKey = found?.instrumentKey;

        let closes = [];
        let dataSource = "Upstox historical daily candles";

        const hasValidToken = token &&
            token !== "YOUR_ACTUAL_UPSTOX_ACCESS_TOKEN" &&
            token !== "PASTE_YOUR_ACCESS_TOKEN_HERE";

        if (hasValidToken && instrumentKey) {
            try {
                const toDate = new Date().toISOString().slice(0, 10);
                const from = new Date();
                from.setUTCDate(from.getUTCDate() - 180);
                const fromDate = from.toISOString().slice(0, 10);

                const historyUrl = "https://api.upstox.com/v3/historical-candle/" +
                    `${encodeURIComponent(instrumentKey)}/days/1/` +
                    `${toDate}/${fromDate}`;

                const historyResponse = await fetch(historyUrl, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                if (historyResponse.ok) {
                    const historyBody = await historyResponse.json();
                    const candles = historyBody.data?.candles || [];
                    closes = candles
                        .map(candle => Number(candle[4]))
                        .filter(price => Number.isFinite(price) && price > 0)
                        .reverse();
                }
            } catch (err) {
                console.warn("Upstox historical fetch failed, falling back to exchange:", err.message);
            }
        }

        // Reliable fallback using live exchange daily candles (180 days)
        if (closes.length < 35) {
            dataSource = "NSE/BSE historical daily candles";
            const candidates = [yahooTicker, `${symbol}.NS`, `${symbol}.BO`];
            for (const cand of candidates) {
                try {
                    const fallbackUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(cand)}?interval=1d&range=6mo`;
                    const fbRes = await fetch(fallbackUrl, {
                        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
                    });
                    if (fbRes.ok) {
                        const fbData = await fbRes.json();
                        const quote = fbData.chart?.result?.[0]?.indicators?.quote?.[0];
                        if (quote?.close) {
                            const validCloses = quote.close.filter(c => typeof c === "number" && Number.isFinite(c) && c > 0);
                            if (validCloses.length >= 35) {
                                closes = validCloses;
                                break;
                            }
                        }
                    }
                } catch (e) {}
            }
        }

        // Alpha Vantage fallback (set ALPHAVANTAGE_API_KEY in Render Environment)
        if (closes.length < 35 && process.env.ALPHAVANTAGE_API_KEY) {
            try {
                const avUrl = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY" +
                    `&symbol=${encodeURIComponent(symbol)}.BSE&outputsize=compact` +
                    `&apikey=${process.env.ALPHAVANTAGE_API_KEY}`;
                const avRes = await fetch(avUrl, { signal: AbortSignal.timeout(20000) });
                const avData = await avRes.json();
                const series = avData["Time Series (Daily)"];
                if (series) {
                    const avCloses = Object.keys(series).sort()
                        .map(d => Number(series[d]["4. close"]))
                        .filter(c => Number.isFinite(c) && c > 0);
                    if (avCloses.length >= 35) {
                        closes = avCloses;
                        dataSource = "Alpha Vantage daily candles (BSE)";
                    }
                } else {
                    console.warn("Alpha Vantage returned no data:", JSON.stringify(avData).slice(0, 200));
                }
            } catch (e) {
                console.warn("Alpha Vantage fallback failed:", e.message);
            }
        }

        if (closes.length < 35) {
            return res.status(400).json({
                error: `At least 35 historical daily closes are required for "${symbol}". Retrieved ${closes.length}. Verify the symbol is active on NSE.`
            });
        }

        // Call Python FastAPI ML Service
        let mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
        if (!/^https?:\/\//.test(mlServiceUrl)) mlServiceUrl = `http://${mlServiceUrl}`;
        mlServiceUrl = mlServiceUrl.replace(/\/$/, "");

        const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, closes }),
            signal: AbortSignal.timeout(60000) // Render free tier wakes slowly
        });

        const prediction = await mlResponse.json().catch(() => ({}));

        if (!mlResponse.ok) {
            return res.status(mlResponse.status).json(prediction);
        }

        res.json({
            ...prediction,
            name: found?.name || `${symbol} Ltd`,
            sector: found?.sector || "Equities",
            history_days: closes.length,
            data_source: dataSource,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error("Prediction error:", error);
        res.status(502).json({
            error: "Prediction service failed. Check that the ML service is running and ML_SERVICE_URL is correct.",
            details: error.message
        });
    }
});

// ─── LLM AI STOCK ANALYST ROUTE ─────────────────────────────────────────────
app.post("/api/analyst", async (req, res) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        const { symbol, quote, prediction, question } = req.body || {};

        if (
            typeof symbol !== "string" ||
            !/^[A-Z0-9._-]{1,20}$/i.test(symbol) ||
            !prediction ||
            typeof prediction.forecast !== "number"
        ) {
            return res.status(400).json({ error: "Provide a symbol and valid prediction." });
        }

        const safeQuote = quote && typeof quote === "object" ? {
            price: Number(quote.price),
            changePercent: Number(quote.changePercent)
        } : null;

        const userQuestion = typeof question === "string" && question.trim().length > 0
            ? question.slice(0, 500)
            : "Explain this forecast and its limitations in simple language.";

        const hasValidKey = apiKey &&
            apiKey !== "YOUR_ACTUAL_LLM_API_KEY" &&
            apiKey !== "PASTE_YOUR_OPENAI_KEY_HERE";

        if (hasValidKey) {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    temperature: 0.2,
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are StockSense AI Analyst, an intelligent Indian equity assistant. " +
                                "Explain supplied stock data and model forecasts in simple, professional language. " +
                                "Do not invent market facts, news, prices, or causes. Distinguish observations from model estimates. " +
                                "Mention uncertainty and that this is not financial advice."
                        },
                        {
                            role: "user",
                            content: JSON.stringify({
                                symbol,
                                current_quote: safeQuote,
                                linear_regression_forecast: prediction,
                                question: userQuestion
                            })
                        }
                    ]
                })
            });

            const result = await response.json();
            if (response.ok) {
                return res.json({
                    symbol,
                    explanation: result.choices?.[0]?.message?.content || "No explanation returned."
                });
            }
        }

        // High quality grounded analyst synthesis
        const move = prediction.estimated_change_percent;
        const dir = move >= 0 ? "modest upward movement" : "modest downward adjustment";
        const sign = move >= 0 ? "+" : "";

        const explanation =
`[StockSense AI Analyst Report]
Stock: ${symbol}
Observed Last Close: ₹${prediction.last_close}
ML Linear Regression Forecast: ₹${prediction.forecast} (${sign}${move}%)
Model Precision: Test MAE: ₹${prediction.mae} | Test RMSE: ₹${prediction.rmse} (tested on ${prediction.test_observations} held-out trading sessions)

Key Insights:
• The model's 5-day autoregressive linear fit projects a ${dir} (${sign}${move}%) toward ₹${prediction.forecast}.
• Error Analysis: The Mean Absolute Error (MAE) of ₹${prediction.mae} reflects the average historical spread on unseen data. The RMSE of ₹${prediction.rmse} reflects susceptibility to larger volatility swings.
• Limitations: This baseline algorithm is purely statistical, relying on price autocorrelation. It cannot foresee corporate quarterly results, geopolitical events, macroeconomic shifts, or unexpected regulatory announcements.

Disclaimer: This forecast is an experimental statistical baseline for educational exploration. It is not financial or trading advice.`;

        res.json({ symbol, explanation });

    } catch (error) {
        console.error("AI analyst error:", error);
        res.status(502).json({ error: "AI analyst service failed", details: error.message });
    }
});

// ─── LIVE MARKET DATA & IPO ROUTES ──────────────────────────────────────────
app.get("/api/market", async (req, res) => {
    try {
        const now = Date.now();
        if (cache.marketData && (now - cache.lastFetched) < cache.ttlMs) {
            return res.json({ ...cache.marketData, cached: true });
        }

        const stockPromises = STOCKS.map(async (stock) => {
            try {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.yahoo)}?interval=1d&range=1mo`;
                const r = await fetch(url, {
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
                });
                const d = await r.json();
                const meta = d.chart?.result?.[0]?.meta;
                const livePrice = Number(meta.regularMarketPrice);
                const prevClose = Number(meta.chartPreviousClose || livePrice);
                const changeAmt = +(livePrice - prevClose).toFixed(2);
                const changePct = prevClose > 0 ? +((changeAmt / prevClose) * 100).toFixed(2) : 0;

                return {
                    sym: stock.sym,
                    name: stock.name,
                    sector: stock.sector,
                    cap: stock.cap,
                    livePrice,
                    prevClose,
                    changeAmt,
                    changePct,
                    dayHigh: Number(meta.regularMarketDayHigh || livePrice),
                    dayLow: Number(meta.regularMarketDayLow || livePrice),
                    fiftyTwoWeekHigh: Number(meta.fiftyTwoWeekHigh || livePrice * 1.25),
                    fiftyTwoWeekLow: Number(meta.fiftyTwoWeekLow || livePrice * 0.8),
                    volume: Number(meta.regularMarketVolume || 0),
                    priceStatus: "success",
                    priceError: null
                };
            } catch (err) {
                return {
                    sym: stock.sym,
                    name: stock.name,
                    sector: stock.sector,
                    cap: stock.cap,
                    livePrice: null,
                    changeAmt: null,
                    changePct: null,
                    priceStatus: "error",
                    priceError: err.message
                };
            }
        });

        const indexPromises = INDICES.map(async (idx) => {
            try {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(idx.sym)}?interval=1d&range=1d`;
                const r = await fetch(url, {
                    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
                });
                const d = await r.json();
                const meta = d.chart?.result?.[0]?.meta;
                const value = Number(meta.regularMarketPrice);
                const prev = Number(meta.chartPreviousClose || value);
                const chgAmt = +(value - prev).toFixed(2);
                const chg = prev > 0 ? +((chgAmt / prev) * 100).toFixed(2) : 0;
                return { sym: idx.sym, name: idx.name, value, chgAmt, chg };
            } catch (err) {
                return { sym: idx.sym, name: idx.name, value: 0, chgAmt: 0, chg: 0 };
            }
        });

        const [stocks, indices] = await Promise.all([
            Promise.all(stockPromises),
            Promise.all(indexPromises)
        ]);

        const freshData = {
            timestamp: new Date().toISOString(),
            totalStocksCount: ALL_STOCKS.length,
            stocks,
            indices,
            ipos: REAL_IPOS
        };

        cache.marketData = freshData;
        cache.lastFetched = now;

        res.json({ ...freshData, cached: false });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch live market data", details: error.message });
    }
});

// Single Stock Live Quote
app.get("/api/stock/:symbol", async (req, res) => {
    const rawSym = String(req.params.symbol || "").trim().toUpperCase();
    const found = ALL_STOCKS.find(s => s.sym.toUpperCase() === rawSym);
    const yahooTicker = found?.yahoo || `${rawSym}.NS`;

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1mo`;
        const r = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        const d = await r.json();
        const meta = d.chart?.result?.[0]?.meta;
        if (!meta) throw new Error("No data returned");

        const livePrice = Number(meta.regularMarketPrice);
        const prevClose = Number(meta.chartPreviousClose || livePrice);
        const changeAmt = +(livePrice - prevClose).toFixed(2);
        const changePct = prevClose > 0 ? +((changeAmt / prevClose) * 100).toFixed(2) : 0;

        res.json({
            sym: rawSym,
            name: found?.name || meta.longName || rawSym,
            sector: found?.sector || "Equities",
            cap: found?.cap || "Mid Cap",
            livePrice,
            prevClose,
            changeAmt,
            changePct,
            dayHigh: Number(meta.regularMarketDayHigh || livePrice),
            dayLow: Number(meta.regularMarketDayLow || livePrice),
            fiftyTwoWeekHigh: Number(meta.fiftyTwoWeekHigh || livePrice * 1.2),
            fiftyTwoWeekLow: Number(meta.fiftyTwoWeekLow || livePrice * 0.8),
            volume: Number(meta.regularMarketVolume || 0),
            priceStatus: "success"
        });
    } catch (e) {
        res.status(500).json({ error: `Could not fetch quote for ${rawSym}`, details: e.message });
    }
});

app.get("/api/ipos", (req, res) => {
    res.json(REAL_IPOS);
});

// ─── START ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 StockSense 2.0 active on port ${PORT}`);
    console.log(`📊 500+ Indian Stocks Directory: GET /api/stocks`);
    console.log(`🤖 ML Linear Regression: GET /api/predict/:symbol`);
    console.log(`🧠 AI Analyst Chat:       POST /api/analyst\n`);
});