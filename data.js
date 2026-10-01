
"use strict";

const STOCKS = [
    {
        sym: "RELIANCE",
        name: "Reliance Industries",
        sector: "Energy",
        apiSymbol: "RELIANCE.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 1420, move: 0.5, conf: 65 },
            "5d": { price: 1440, move: 1.9, conf: 61 },
            "1m": { price: 1470, move: 4.0, conf: 58 },
            "1y": { price: 1600, move: 13.2, conf: 52 }
        }
    },
    {
        sym: "TCS",
        name: "Tata Consultancy Services",
        sector: "IT",
        apiSymbol: "TCS.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 3200, move: 0.4, conf: 64 },
            "5d": { price: 3240, move: 1.6, conf: 60 },
            "1m": { price: 3300, move: 3.5, conf: 57 },
            "1y": { price: 3500, move: 9.8, conf: 51 }
        }
    },
    {
        sym: "HDFCBANK",
        name: "HDFC Bank",
        sector: "Banking",
        apiSymbol: "HDFCBANK.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 950, move: 0.3, conf: 63 },
            "5d": { price: 970, move: 1.4, conf: 60 },
            "1m": { price: 990, move: 3.4, conf: 56 },
            "1y": { price: 1080, move: 12.8, conf: 52 }
        }
    },
    {
        sym: "INFY",
        name: "Infosys",
        sector: "IT",
        apiSymbol: "INFY.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 1500, move: 0.5, conf: 64 },
            "5d": { price: 1530, move: 1.8, conf: 61 },
            "1m": { price: 1580, move: 4.1, conf: 57 },
            "1y": { price: 1700, move: 12.0, conf: 52 }
        }
    },
    {
        sym: "TATAMOTORS",
        name: "Tata Motors",
        sector: "Automobile",
        apiSymbol: "TATAMOTORS.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 700, move: 0.6, conf: 62 },
            "5d": { price: 720, move: 2.0, conf: 59 },
            "1m": { price: 750, move: 4.5, conf: 55 },
            "1y": { price: 820, move: 14.0, conf: 50 }
        }
    },
    {
        sym: "WIPRO",
        name: "Wipro",
        sector: "IT",
        apiSymbol: "WIPRO.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 250, move: 0.3, conf: 62 },
            "5d": { price: 255, move: 1.5, conf: 58 },
            "1m": { price: 265, move: 3.8, conf: 55 },
            "1y": { price: 290, move: 12.5, conf: 50 }
        }
    },
    {
        sym: "BAJFINANCE",
        name: "Bajaj Finance",
        sector: "Finance",
        apiSymbol: "BAJFINANCE.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 900, move: 0.4, conf: 62 },
            "5d": { price: 925, move: 1.6, conf: 58 },
            "1m": { price: 960, move: 3.7, conf: 55 },
            "1y": { price: 1050, move: 12.0, conf: 50 }
        }
    },
    {
        sym: "SUNPHARMA",
        name: "Sun Pharmaceutical",
        sector: "Healthcare",
        apiSymbol: "SUNPHARMA.BSE",
        livePrice: null,
        liveChg: null,
        latestTradingDay: null,
        priceStatus: "pending",
        priceError: null,
        targets: {
            "1d": { price: 1700, move: 0.3, conf: 63 },
            "5d": { price: 1730, move: 1.4, conf: 59 },
            "1m": { price: 1780, move: 3.2, conf: 56 },
            "1y": { price: 1900, move: 10.5, conf: 51 }
        }
    }
];

// These index values are sample data, not live exchange quotes.
const INDICES = [
    { name: "NIFTY 50", value: 24583.15, chgAmt: 168.2, chg: 0.68 },
    { name: "SENSEX", value: 81482.43, chgAmt: 581.32, chg: 0.72 },
    { name: "BANK NIFTY", value: 52340.8, chgAmt: -115.6, chg: -0.22 },
    { name: "NIFTY IT", value: 43280.7, chgAmt: 492.5, chg: 1.15 }
];

// Demonstration IPO data only. Update from verified sources before publication.
const IPOS = [
    {
        name: "Example Technology Ltd.",
        symbol: "EXTECH",
        status: "upcoming",
        priceBand: "₹100–₹120",
        issueSize: "₹500 Cr",
        openDate: "To be verified",
        closeDate: "To be verified",
        about: "Demonstration record, not an actual IPO listing."
    },
    {
        name: "Example Industries Ltd.",
        symbol: "EXIND",
        status: "open",
        priceBand: "₹200–₹220",
        issueSize: "₹800 Cr",
        openDate: "To be verified",
        closeDate: "To be verified",
        about: "Demonstration record, not an actual IPO listing."
    },
    {
        name: "Example Finance Ltd.",
        symbol: "EXFIN",
        status: "listed",
        priceBand: "₹150–₹160",
        issueSize: "₹300 Cr",
        openDate: "To be verified",
        closeDate: "To be verified",
        about: "Demonstration record, not an actual IPO listing."
    }
];

const ACCURACY_DATA = [
    { horizon: "1 Day", pct: 65, note: "Illustrative figure" },
    { horizon: "5 Days", pct: 61, note: "Illustrative figure" },
    { horizon: "1 Month", pct: 57, note: "Illustrative figure" },
    { horizon: "1 Year", pct: 52, note: "Illustrative figure" }
];