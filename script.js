"use strict";

(() => {
    let allStocksList = [];
    let displayedStocksCount = 60;
    let selectedSector = "All";
    let selectedCap = "All";
    let searchQuery = "";
    let selectedHorizon = "1d";
    let latestPrediction = null;

    const $ = id => document.getElementById(id);

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function money(value) {
        if (!Number.isFinite(Number(value))) return "Unavailable";
        return "₹" + Number(value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // ─── INITIAL DATA FETCH ──────────────────────────────────────────────────
    async function initApp() {
        try {
            // Show skeleton loading while fetching
            const grid = $("stocksGrid");
            if (grid) {
                grid.innerHTML = Array.from({length: 12}, () => `
                    <div class="skeleton-card" style="min-height:130px;">
                        <div class="skeleton-line wide"></div>
                        <div class="skeleton-line mid"></div>
                        <div class="skeleton-line thin" style="margin-top:16px;"></div>
                    </div>
                `).join("");
            }
            // 1. Fetch 500+ stocks directory
            const stocksRes = await fetch("/api/stocks?limit=600");
            if (stocksRes.ok) {
                const data = await stocksRes.json();
                allStocksList = data.stocks || [];
                $("screenerTotalCount").textContent = data.total || allStocksList.length;
                populateAILabDropdown();
                renderScreenerStocks();
            }
        } catch (e) {
            console.warn("Could not load full stocks directory:", e);
        }

        // 2. Fetch live market snapshot & indices
        await refreshMarketOverview();

        // 3. Render initial targets & IPOs
        renderTargets();
        renderIPOs();

        // 4. Bind event listeners
        bindEvents();
    }

    // ─── MARKET OVERVIEW & TICKER ───────────────────────────────────────────
    async function refreshMarketOverview() {
        try {
            const res = await fetch("/api/market");
            if (res.ok) {
                const data = await res.json();
                if (data.indices) renderIndices(data.indices);
                if (data.stocks && data.stocks.length > 0) {
                    renderTickerTape(data.stocks, data.indices);
                    updateSpotlight(data.stocks[0]);
                }
                if (data.ipos) renderIPOs(data.ipos);
            }
        } catch (e) {
            console.warn("Market overview fetch failed:", e);
        }
    }

    function renderTickerTape(stocks, indices) {
        const track = $("tickerTapeTrack");
        if (!track) return;

        const items = [];
        if (indices) {
            indices.forEach(idx => {
                const pos = idx.chg >= 0;
                items.push(`
                    <span class="ticker-item">
                        <span class="t-sym">${escapeHTML(idx.name)}</span>
                        <span class="t-val">${Number(idx.value).toLocaleString("en-IN")}</span>
                        <span class="t-chg ${pos ? 'pos' : 'neg'}">${pos ? '+' : ''}${idx.chg.toFixed(2)}%</span>
                    </span>
                `);
            });
        }

        if (stocks) {
            stocks.forEach(s => {
                if (s.livePrice) {
                    const pos = s.changePct >= 0;
                    items.push(`
                        <span class="ticker-item">
                            <span class="t-sym">${escapeHTML(s.sym)}</span>
                            <span class="t-val">${money(s.livePrice)}</span>
                            <span class="t-chg ${pos ? 'pos' : 'neg'}">${pos ? '+' : ''}${s.changePct.toFixed(2)}%</span>
                        </span>
                    `);
                }
            });
        }

        // Double the content for smooth infinite marquee
        track.innerHTML = items.join("") + items.join("");
    }

    function renderIndices(indicesList) {
        const grid = $("indicesGrid");
        if (!grid) return;

        const list = indicesList || (typeof INDICES !== "undefined" ? INDICES : []);
        grid.innerHTML = list.map(idx => {
            const pos = idx.chg >= 0;
            return `
                <article class="index-card">
                    <div class="index-name">${escapeHTML(idx.name)}</div>
                    <div class="index-value">${Number(idx.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    <div class="index-change ${pos ? 'positive' : 'negative'}">
                        ${pos ? '▲ +' : '▼ '}${Number(idx.chgAmt).toLocaleString("en-IN")} (${pos ? '+' : ''}${idx.chg.toFixed(2)}%)
                    </div>
                </article>
            `;
        }).join("");
    }

    // ─── HERO SPOTLIGHT CARD ───
    async function updateSpotlight(stockData) {
        if (!stockData) return;

        $("spotlightAvatar").textContent = stockData.sym[0];
        $("spotlightName").textContent = stockData.name || `${stockData.sym} Ltd`;
        $("spotlightSym").textContent = stockData.sym;
        $("spotlightSector").textContent = stockData.sector || "Equities";
        if ($("spotlightCap")) $("spotlightCap").textContent = stockData.cap || "Large Cap";

        const price = Number(stockData.livePrice);
        const change = Number(stockData.changePct ?? 0);
        const pos = change >= 0;

        $("heroPrice").textContent = Number.isFinite(price) ? money(price) : "Waiting...";
        $("heroChange").className = `change ${pos ? 'positive' : 'negative'}`;
        $("heroChange").textContent = `${pos ? '▲ +' : '▼ '}${Math.abs(change).toFixed(2)}%`;

        if (stockData.dayLow && stockData.dayHigh) {
            $("spotlightDayLow").textContent = money(stockData.dayLow);
            $("spotlightDayHigh").textContent = money(stockData.dayHigh);
            if (stockData.dayHigh > stockData.dayLow && price) {
                const pct = Math.max(5, Math.min(95, ((price - stockData.dayLow) / (stockData.dayHigh - stockData.dayLow)) * 100));
                $("spotlightDayFill").style.width = `${pct}%`;
            }
        }

        if (stockData.fiftyTwoWeekHigh && stockData.fiftyTwoWeekLow) {
            $("spotlight52w").textContent = `${money(stockData.fiftyTwoWeekLow)} - ${money(stockData.fiftyTwoWeekHigh)}`;
        }

        if (stockData.volume) {
            $("spotlightVol").textContent = stockData.volume > 1000000 
                ? (stockData.volume / 1000000).toFixed(2) + "M"
                : Number(stockData.volume).toLocaleString("en-IN");
        }

        $("spotlightPredictBtn").onclick = () => {
            selectStockInAILab(stockData.sym);
            $("ai-analysis").scrollIntoView({ behavior: "smooth" });
        };
    }

    // ─── 500+ STOCKS SCREENER ───────────────────────────────────────────────
    function renderScreenerStocks() {
        const grid = $("stocksGrid");
        if (!grid) return;

        let filtered = allStocksList;

        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            filtered = filtered.filter(s => 
                s.sym.toUpperCase().includes(q) || 
                (s.name && s.name.toUpperCase().includes(q))
            );
        }

        if (selectedSector !== "All") {
            filtered = filtered.filter(s => s.sector && s.sector.toLowerCase() === selectedSector.toLowerCase());
        }

        if (selectedCap !== "All") {
            filtered = filtered.filter(s => s.cap && s.cap.toLowerCase() === selectedCap.toLowerCase());
        }

        $("screenerCurrentCount").textContent = Math.min(displayedStocksCount, filtered.length);
        $("screenerTotalCount").textContent = filtered.length;

        const slice = filtered.slice(0, displayedStocksCount);

        if (slice.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-dim);">
                    No stocks matching "${escapeHTML(searchQuery)}" in ${escapeHTML(selectedSector)}.
                </div>
            `;
            $("loadMoreStocksBtn").style.display = "none";
            return;
        }

        grid.innerHTML = slice.map((s, i) => {
            // Determine exchange from yahoo suffix
            const isNSE = !s.yahoo || s.yahoo.endsWith(".NS");
            const exchangeLabel = isNSE ? "NSE" : "BSE";
            const exchangeClass = isNSE ? "nse" : "bse";

            // Generate random-height mini bars for visual texture
            const barHeights = [40, 65, 35, 80, 55, 70, 45].map(h => h + Math.floor(Math.random() * 25));
            const barDurations = [1.1, 1.4, 0.9, 1.6, 1.2, 1.5, 1.0];
            const barDelays    = [0, 0.2, 0.4, 0.1, 0.3, 0.5, 0.25];

            const miniBars = barHeights.map((h, bi) =>
                `<div class="mini-bar" style="height:${h}%;--dur:${barDurations[bi]}s;--delay:${barDelays[bi]}s;"></div>`
            ).join("");

            return `
            <article class="stock-card" data-sym="${escapeHTML(s.sym)}" style="animation-delay:${Math.min(i * 0.04, 0.5)}s;">
                <div class="stock-card-top">
                    <div class="stock-avatar-sm">${escapeHTML(s.sym[0])}</div>
                    <div class="stock-card-info" style="flex:1;min-width:0;">
                        <h4 style="display:flex;align-items:center;gap:6px;">
                            ${escapeHTML(s.sym)}
                            <span class="exchange-badge ${exchangeClass}">${exchangeLabel}</span>
                        </h4>
                        <p style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(s.name || s.sym)}</p>
                    </div>
                    <div class="mini-pulse-bars">${miniBars}</div>
                </div>

                <div class="stock-card-tags">
                    <span class="tag-sector">${escapeHTML(s.sector || "Equities")}</span>
                    <span class="tag-cap-sm">${escapeHTML(s.cap || "Mid Cap")}</span>
                </div>

                <div class="stock-card-actions">
                    <button type="button" class="btn-card-predict" onclick="window.predictFromCard('${escapeHTML(s.sym)}')">
                        ⚡ Predict Close
                    </button>
                </div>
            </article>
        `;
        }).join("");

        const loadBtn = $("loadMoreStocksBtn");
        if (displayedStocksCount >= filtered.length) {
            loadBtn.style.display = "none";
        } else {
            loadBtn.style.display = "inline-block";
            $("btnLoadedCount").textContent = `${Math.min(displayedStocksCount, filtered.length)} / ${filtered.length}`;
        }
    }

    // Global helper for card clicks
    window.predictFromCard = (symbol) => {
        selectStockInAILab(symbol);
        $("ai-analysis").scrollIntoView({ behavior: "smooth" });
        $("predictBtn").click();
    };

    // ─── AI LAB WORKSPACE POPULATION & HANDLERS ─────────────────────────────
    function populateAILabDropdown() {
        const select = $("aiSymbolSelect");
        if (!select) return;

        const popular = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "WIPRO", "BAJFINANCE", "SUNPHARMA", "ZOMATO", "HAL", "TRENT"];
        
        let html = `<optgroup label="Popular Large Caps">`;
        popular.forEach(sym => {
            const found = allStocksList.find(s => s.sym === sym);
            const name = found ? found.name : sym;
            html += `<option value="${escapeHTML(sym)}">${escapeHTML(sym)} · ${escapeHTML(name)}</option>`;
        });
        html += `</optgroup><optgroup label="All 500+ Indian Stocks">`;

        allStocksList.forEach(s => {
            if (!popular.includes(s.sym)) {
                html += `<option value="${escapeHTML(s.sym)}">${escapeHTML(s.sym)} · ${escapeHTML(s.name || s.sym)}</option>`;
            }
        });
        html += `</optgroup>`;

        select.innerHTML = html;
    }

    function selectStockInAILab(symbol) {
        const select = $("aiSymbolSelect");
        if (!select) return;
        select.value = symbol.toUpperCase();
    }

    // ─── ML PREDICTION HANDLER ──────────────────────────────────────────────
    async function handlePredictClick() {
        const select = $("aiSymbolSelect");
        const symbol = select ? select.value : "RELIANCE";
        const btn = $("predictBtn");
        const resultBox = $("predictionResultBox");

        btn.disabled = true;
        resultBox.innerHTML = `
            <div class="placeholder-empty-state">
                <span class="icon-empty">⏳</span>
                <p>Retrieving 180-day historical daily candles for <strong>${escapeHTML(symbol)}</strong> and training scikit-learn Linear Regression model...</p>
            </div>
        `;

        try {
            const res = await fetch(`/api/predict/${encodeURIComponent(symbol)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.detail || "Prediction failed");
            }

            latestPrediction = data;
            const pos = data.estimated_change_percent >= 0;

            resultBox.innerHTML = `
                <div class="ml-output-header">
                    <div>
                        <strong style="font-size: 18px; color: var(--text);">${escapeHTML(data.symbol)}</strong>
                        <span style="font-size: 13px; color: var(--text-dim);"> · ${escapeHTML(data.name || "")}</span>
                    </div>
                    <span class="tag-sector">${escapeHTML(data.model)}</span>
                </div>

                <div class="ml-output-price-box">
                    <div class="price-caption">Predicted Next Closing Price</div>
                    <div class="big-forecast">₹${Number(data.forecast).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                    <div class="change ${pos ? 'positive' : 'negative'}" style="display: inline-block; margin-top: 6px;">
                        ${pos ? '▲ +' : '▼ '}${Math.abs(data.estimated_change_percent)}% vs Last Close (₹${data.last_close})
                    </div>
                </div>

                <div class="ml-stats-grid">
                    <div class="ml-stat-item">
                        <div class="stat-k">Test MAE (Mean Error)</div>
                        <div class="stat-v" style="color: var(--amber);">₹${data.mae}</div>
                    </div>
                    <div class="ml-stat-item">
                        <div class="stat-k">Test RMSE (Vol Error)</div>
                        <div class="stat-v" style="color: var(--cyan);">₹${data.rmse}</div>
                    </div>
                    <div class="ml-stat-item">
                        <div class="stat-k">Test Observations</div>
                        <div class="stat-v">${data.test_observations} Days</div>
                    </div>
                    <div class="ml-stat-item">
                        <div class="stat-k">History Sample</div>
                        <div class="stat-v">${data.history_days} Days</div>
                    </div>
                </div>

                <div class="ml-disclaimer-note">
                    ${escapeHTML(data.disclaimer)}
                </div>
            `;

            // Prompt the AI analyst automatically with a default question if empty
            if ($("analystQuestion") && !$("analystQuestion").value.trim()) {
                $("analystQuestion").value = `Explain the prediction of ₹${data.forecast} for ${data.symbol} and what its MAE of ₹${data.mae} means for risk.`;
            }

        } catch (err) {
            latestPrediction = null;
            resultBox.innerHTML = `
                <div style="padding: 20px; color: var(--red); background: rgba(255, 71, 87, 0.1); border-radius: var(--radius-sm);">
                    <strong>Prediction Error:</strong> ${escapeHTML(err.message)}
                </div>
            `;
        } finally {
            btn.disabled = false;
        }
    }

    // ─── AI ANALYST HANDLER ─────────────────────────────────────────────────
    async function handleAnalystClick() {
        const select = $("aiSymbolSelect");
        const symbol = select ? select.value : "RELIANCE";
        const question = $("analystQuestion").value.trim();
        const btn = $("analystBtn");
        const resultBox = $("analystResultBox");

        if (!latestPrediction || latestPrediction.symbol !== symbol) {
            resultBox.innerHTML = `
                <div style="padding: 20px; color: var(--amber); background: rgba(251, 191, 36, 0.1); border-radius: var(--radius-sm);">
                    ⚠️ Please click <strong>Predict Next-Day Price</strong> for <strong>${escapeHTML(symbol)}</strong> first to provide the AI Analyst with quantitative data.
                </div>
            `;
            return;
        }

        btn.disabled = true;
        resultBox.innerHTML = `
            <div class="placeholder-empty-state">
                <span class="icon-empty">🧠</span>
                <p>AI Analyst is synthesizing forecast metrics, calculating error distributions, and formulating explanation...</p>
            </div>
        `;

        try {
            const res = await fetch("/api/analyst", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    prediction: latestPrediction,
                    quote: { price: latestPrediction.last_close, changePercent: latestPrediction.estimated_change_percent },
                    question
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "AI Analyst request failed");

            resultBox.textContent = data.explanation;

        } catch (err) {
            resultBox.innerHTML = `
                <div style="padding: 20px; color: var(--red); background: rgba(255, 71, 87, 0.1); border-radius: var(--radius-sm);">
                    <strong>Analyst Error:</strong> ${escapeHTML(err.message)}
                </div>
            `;
        } finally {
            btn.disabled = false;
        }
    }

    // ─── TARGETS & IPO RENDERING ────────────────────────────────────────────
    function renderTargets() {
        const grid = $("predictionsGrid");
        if (!grid || typeof STOCKS === "undefined") return;

        grid.innerHTML = STOCKS.map(stock => {
            const target = stock.targets ? stock.targets[selectedHorizon] : { price: (stock.livePrice || 1000) * 1.02, move: 2.0, conf: 62 };
            const currentPrice = stock.livePrice;

            return `
                <article class="prediction-card">
                    <div class="prediction-header">
                        <div class="stock-avatar-sm">${escapeHTML(stock.sym[0])}</div>
                        <div>
                            <h4>${escapeHTML(stock.name)}</h4>
                            <p style="font-size: 12px; color: var(--text-dim);">${escapeHTML(stock.sym)} · ${escapeHTML(stock.sector)}</p>
                        </div>
                    </div>

                    <div class="prediction-row">
                        <div>
                            <span class="muted" style="display:block; font-size:11px; text-transform:uppercase;">Observed Quote</span>
                            <strong style="font-size:16px;">${currentPrice ? money(currentPrice) : "₹" + (target.price * 0.98).toFixed(2)}</strong>
                        </div>
                        <div>
                            <span class="muted" style="display:block; font-size:11px; text-transform:uppercase;">Statistical Target</span>
                            <strong style="font-size:16px; color: var(--green);">${money(target.price)}</strong>
                        </div>
                    </div>

                    <div class="target-details">
                        <span>Expected Move</span>
                        <strong style="color: ${target.move >= 0 ? 'var(--green)' : 'var(--red)'};">${target.move >= 0 ? '+' : ''}${target.move}%</strong>
                    </div>

                    <div class="target-details">
                        <span>Model Confidence</span>
                        <strong>${target.conf}%</strong>
                    </div>

                    <p class="card-disclaimer">
                        Algorithmic projection based on historical ATR & volatility channel.
                    </p>
                </article>
            `;
        }).join("");
    }

    function renderIPOs(iposData) {
        const grid = $("ipoGrid");
        if (!grid) return;

        const list = iposData || (typeof IPOS !== "undefined" ? IPOS : []);
        grid.innerHTML = list.map(ipo => `
            <article class="ipo-card">
                <div>
                    <div class="ipo-card-top">
                        <div class="stock-avatar-sm" style="color: var(--cyan); border-color: rgba(0, 229, 255, 0.3);">${escapeHTML(ipo.symbol[0])}</div>
                        <div style="flex:1;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h4 style="font-size: 16px;">${escapeHTML(ipo.name)}</h4>
                                <span class="ipo-badge-status ${ipo.status}">${escapeHTML(ipo.status)}</span>
                            </div>
                            <span style="font-size: 12px; color: var(--text-dim);">${escapeHTML(ipo.type || "Mainboard")} · ${escapeHTML(ipo.openDate)}</span>
                        </div>
                    </div>

                    <div class="ipo-stats-table">
                        <div>
                            <span style="color:var(--text-dim); font-size:11px;">Price Band:</span>
                            <div><strong>${escapeHTML(ipo.priceBand)}</strong></div>
                        </div>
                        <div>
                            <span style="color:var(--text-dim); font-size:11px;">Issue Size:</span>
                            <div><strong>${escapeHTML(ipo.issueSize)}</strong></div>
                        </div>
                        <div>
                            <span style="color:var(--text-dim); font-size:11px;">Subscription:</span>
                            <div><strong style="color:var(--cyan);">${escapeHTML(ipo.subscription || "N/A")}</strong></div>
                        </div>
                        <div>
                            <span style="color:var(--text-dim); font-size:11px;">Grey Market Premium:</span>
                            <div><strong style="color:var(--green);">${escapeHTML(ipo.currentGMP || "N/A")}</strong></div>
                        </div>
                    </div>

                    <p class="ipo-about">${escapeHTML(ipo.about)}</p>
                </div>

                <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size: 11.5px; color: var(--text-dim);">AI Verdict:</span>
                    <span style="font-size: 12px; font-weight:700; color:var(--green); background:rgba(0,245,160,0.1); padding:3px 10px; border-radius:12px;">
                        ${escapeHTML(ipo.verdict || "Neutral")}
                    </span>
                </div>
            </article>
        `).join("");
    }

    // ─── EVENT BINDINGS ─────────────────────────────────────────────────────
    function bindEvents() {
        // Quick tags in Hero
        document.querySelectorAll(".quick-tag").forEach(tag => {
            tag.addEventListener("click", () => {
                const sym = tag.dataset.sym;
                $("heroSearchInput").value = sym;
                selectStockInAILab(sym);
                fetchStockAndHighlight(sym);
            });
        });

        // Hero Search form
        $("stockSearchForm").addEventListener("submit", (e) => {
            e.preventDefault();
            const val = $("heroSearchInput").value.trim().toUpperCase();
            if (val) {
                selectStockInAILab(val);
                fetchStockAndHighlight(val);
            }
        });

        // Hero Search live autocomplete
        $("heroSearchInput").addEventListener("input", (e) => {
            const val = e.target.value.trim().toUpperCase();
            const dropdown = $("autocompleteDropdown");
            if (!val || val.length < 1) {
                dropdown.classList.add("hidden");
                return;
            }

            const matches = allStocksList.filter(s =>
                s.sym.toUpperCase().startsWith(val) ||
                s.sym.toUpperCase().includes(val) ||
                (s.name && s.name.toUpperCase().includes(val))
            ).slice(0, 8);

            if (matches.length === 0) {
                dropdown.classList.add("hidden");
                return;
            }

            dropdown.innerHTML = matches.map(m => `
                <div class="autocomplete-item" data-sym="${escapeHTML(m.sym)}">
                    <strong>${escapeHTML(m.sym)}</strong>
                    <span>${escapeHTML(m.name || m.sym)} · ${escapeHTML(m.sector || "")}</span>
                </div>
            `).join("");

            dropdown.classList.remove("hidden");

            dropdown.querySelectorAll(".autocomplete-item").forEach(item => {
                item.addEventListener("click", () => {
                    const sym = item.dataset.sym;
                    $("heroSearchInput").value = sym;
                    dropdown.classList.add("hidden");
                    selectStockInAILab(sym);
                    fetchStockAndHighlight(sym);
                });
            });
        });

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".search-container")) {
                $("autocompleteDropdown").classList.add("hidden");
            }
        });

        // Screener search input
        $("screenerSearchInput").addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            displayedStocksCount = 60;
            renderScreenerStocks();
        });

        // Screener Cap select
        $("screenerCapSelect").addEventListener("change", (e) => {
            selectedCap = e.target.value;
            displayedStocksCount = 60;
            renderScreenerStocks();
        });

        // Sector filter pills
        $("sectorPills").addEventListener("click", (e) => {
            const pill = e.target.closest(".sector-pill");
            if (!pill) return;

            document.querySelectorAll(".sector-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            selectedSector = pill.dataset.sector;
            displayedStocksCount = 60;
            renderScreenerStocks();
        });

        // Load More button
        $("loadMoreStocksBtn").addEventListener("click", () => {
            displayedStocksCount += 60;
            renderScreenerStocks();
        });

        // Refresh Data button in navbar
        $("refreshDataBtn").addEventListener("click", async () => {
            const btn = $("refreshDataBtn");
            btn.style.transform = "rotate(360deg)";
            await refreshMarketOverview();
            setTimeout(() => { btn.style.transform = "none"; }, 400);
        });

        // Horizon tabs
        $("horizonTabs").addEventListener("click", (e) => {
            const btn = e.target.closest("[data-horizon]");
            if (!btn) return;
            document.querySelectorAll("#horizonTabs [data-horizon]").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            selectedHorizon = btn.dataset.horizon;
            renderTargets();
        });

        // AI Lab Buttons
        $("predictBtn").addEventListener("click", handlePredictClick);
        $("analystBtn").addEventListener("click", handleAnalystClick);

        // Quick prompts in AI Lab
        $("quickPrompts").addEventListener("click", (e) => {
            const chip = e.target.closest(".prompt-chip");
            if (!chip) return;
            $("analystQuestion").value = chip.dataset.prompt;
            handleAnalystClick();
        });

        // Shortcut '/' to focus search
        document.addEventListener("keydown", (e) => {
            if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
                e.preventDefault();
                $("heroSearchInput").focus();
            }
        });
    }

    async function fetchStockAndHighlight(symbol) {
        try {
            const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}`);
            if (res.ok) {
                const data = await res.json();
                updateSpotlight(data);
                $("dashboard").scrollIntoView({ behavior: "smooth" });
            }
        } catch (e) {
            console.warn("Could not fetch spotlight stock:", e);
        }
    }

    // Launch application
    initApp();
})();