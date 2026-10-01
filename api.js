
"use strict";

// Alpha Vantage API configuration.
// A key placed in frontend JavaScript is visible to website visitors.
const ALPHA_VANTAGE_API_KEY = "0SM7QOC2QHKASD6L";

const ALPHA_VANTAGE_URL = "https://www.alphavantage.co/query";

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function fetchStockQuote(stock) {
    stock.priceStatus = "pending";
    stock.priceError = null;

    if (!ALPHA_VANTAGE_API_KEY ||
        ALPHA_VANTAGE_API_KEY === "0SM7QOC2QHKASD6L") {
        stock.priceStatus = "error";
        stock.priceError = "API key is missing";
        return;
    }

    const url = new URL(ALPHA_VANTAGE_URL);
    url.searchParams.set("function", "GLOBAL_QUOTE");
    url.searchParams.set("symbol", stock.apiSymbol);
    url.searchParams.set("apikey", "0SM7QOC2QHKASD6L");

    try {
        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.Note || data.Information) {
            throw new Error(
                data.Note || data.Information
            );
        }

        if (data["Error Message"]) {
            throw new Error(data["Error Message"]);
        }

        const quote = data["Global Quote"];

        if (!quote || !quote["05. price"]) {
            throw new Error(
                `No quote returned for ${stock.apiSymbol}. The symbol may not be supported.`
            );
        }

        const price = Number(quote["05. price"]);
        const changePercent = parseFloat(
            String(quote["10. change percent"] || "0").replace("%", "")
        );
        const changeAmount = Number(quote["09. change"] || 0);

        if (!Number.isFinite(price) || price <= 0) {
            throw new Error("Invalid price received from API");
        }

        stock.livePrice = price;
        stock.liveChg = Number.isFinite(changePercent) ? changePercent : 0;
        stock.liveChgAmt = Number.isFinite(changeAmount) ? changeAmount : 0;
        stock.latestTradingDay = quote["07. latest trading day"] || null;
        stock.priceStatus = "success";
        stock.priceError = null;

        console.info(
            `Quote received for ${stock.sym}:`,
            price,
            stock.latestTradingDay
        );

    } catch (error) {
        stock.priceStatus = "error";
        stock.priceError = error.message || "Quote request failed";

        console.warn(
            `Quote unavailable for ${stock.sym}:`,
            stock.priceError
        );
    }
}

async function refreshStockPrices() {
    if (typeof STOCKS === "undefined" || !Array.isArray(STOCKS)) {
        console.error("STOCKS was not found. Check that data.js loads first.");
        return;
    }

    console.info("Starting StockSense quote refresh...");

    // 1. Fetch real-time quotes from local backend
    try {
        const response = await fetch("/api/market");
        if (response.ok) {
            const data = await response.json();
            if (data.stocks && Array.isArray(data.stocks)) {
                for (const item of data.stocks) {
                    const match = STOCKS.find(s => s.sym === item.sym);
                    if (match && item.priceStatus === "success") {
                        match.livePrice = item.livePrice;
                        match.liveChg = item.changePct;
                        match.liveChgAmt = item.changeAmt;
                        match.priceStatus = "success";
                        match.priceError = null;
                        match.latestTradingDay = new Date().toLocaleDateString("en-IN");
                    }
                }
                if (data.indices && typeof INDICES !== "undefined") {
                    for (const idx of data.indices) {
                        const m = INDICES.find(i => idx.name.includes(i.name) || i.name.includes(idx.name));
                        if (m) {
                            m.value = idx.value;
                            m.chg = idx.chg;
                            m.chgAmt = idx.chgAmt;
                        }
                    }
                }
                document.dispatchEvent(new CustomEvent("stocksense:prices-updated"));
                console.info("StockSense live quotes loaded from backend.");
                return;
            }
        }
    } catch (e) {
        console.warn("Backend market feed unavailable, trying Upstox quotes proxy...", e);
    }

    // 2. Try Upstox proxy endpoint
    try {
        const upstoxRes = await fetch("/api/quotes");
        if (upstoxRes.ok) {
            const data = await upstoxRes.json();
            if (data.quotes && Array.isArray(data.quotes)) {
                for (const q of data.quotes) {
                    const match = STOCKS.find(s => s.sym === q.sym);
                    if (match && q.status === "success") {
                        match.livePrice = q.price;
                        match.liveChg = q.changePercent;
                        match.liveChgAmt = q.change;
                        match.priceStatus = "success";
                        match.priceError = null;
                    }
                }
                document.dispatchEvent(new CustomEvent("stocksense:prices-updated"));
                return;
            }
        }
    } catch (e) {
        console.warn("Upstox quote proxy unavailable:", e);
    }
}