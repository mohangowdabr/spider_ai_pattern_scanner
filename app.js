/**
 * Power Bull — Spider AI Stock Pattern Scanner
 * Core Interactive Platform JavaScript
 */

document.addEventListener("DOMContentLoaded", () => {
    // === Core Constants & Mock Databases ===
    const STOCKS_DB = [
        {
            symbol: "RELIANCE",
            name: "Reliance Industries Ltd.",
            pattern: "Cup & Handle",
            direction: "BUY",
            confidence: 87,
            entry: 2845.50,
            target: 2990.00,
            stopLoss: 2790.00,
            rr: "1 : 2.63",
            timestamp: "11:18:42",
            // Candlestick mock generator parameters: [trendDirection, patternAnomalyOffset]
            candles: [2800, 2790, 2795, 2785, 2790, 2810, 2800, 2820, 2835, 2815, 2810, 2812, 2825, 2835, 2845.5],
            volume: [45, 52, 38, 48, 62, 59, 71, 68, 85, 92, 77, 83, 98, 120, 155]
        },
        {
            symbol: "TCS",
            name: "Tata Consultancy Services Ltd.",
            pattern: "Bull Flag",
            direction: "BUY",
            confidence: 82,
            entry: 3912.10,
            target: 4050.00,
            stopLoss: 3840.00,
            rr: "1 : 1.91",
            timestamp: "11:15:02",
            candles: [3820, 3840, 3860, 3875, 3890, 3900, 3885, 3878, 3870, 3880, 3872, 3868, 3890, 3905, 3912.1],
            volume: [80, 85, 95, 110, 130, 142, 90, 75, 60, 52, 48, 55, 78, 115, 160]
        },
        {
            symbol: "HDFCBANK",
            name: "HDFC Bank Ltd.",
            pattern: "Double Bottom",
            direction: "BUY",
            confidence: 79,
            entry: 1542.30,
            target: 1590.00,
            stopLoss: 1515.00,
            rr: "1 : 1.75",
            timestamp: "11:10:18",
            candles: [1565, 1550, 1538, 1520, 1528, 1540, 1548, 1530, 1518, 1524, 1535, 1538, 1532, 1539, 1542.3],
            volume: [60, 68, 72, 85, 90, 78, 65, 59, 74, 88, 92, 80, 84, 105, 130]
        },
        {
            symbol: "INFY",
            name: "Infosys Ltd.",
            pattern: "Ascending Triangle",
            direction: "BUY",
            confidence: 84,
            entry: 1422.80,
            target: 1485.00,
            stopLoss: 1395.00,
            rr: "1 : 2.24",
            timestamp: "11:08:55",
            candles: [1380, 1390, 1410, 1395, 1415, 1400, 1420, 1410, 1422, 1415, 1425, 1418, 1421, 1422, 1422.8],
            volume: [50, 58, 65, 55, 72, 60, 78, 68, 85, 75, 88, 80, 92, 110, 145]
        },
        {
            symbol: "ICICIBANK",
            name: "ICICI Bank Ltd.",
            pattern: "Cup & Handle",
            direction: "BUY",
            confidence: 88,
            entry: 1114.90,
            target: 1180.00,
            stopLoss: 1090.00,
            rr: "1 : 2.61",
            timestamp: "11:01:30",
            candles: [1090, 1085, 1088, 1080, 1084, 1095, 1092, 1102, 1108, 1099, 1096, 1098, 1104, 1110, 1114.9],
            volume: [95, 88, 76, 82, 105, 98, 115, 108, 125, 140, 110, 115, 130, 160, 195]
        },
        {
            symbol: "SBIN",
            name: "State Bank of India",
            pattern: "Bull Flag",
            direction: "BUY",
            confidence: 76,
            entry: 825.25,
            target: 855.00,
            stopLoss: 812.00,
            rr: "1 : 2.28",
            timestamp: "10:55:12",
            candles: [802, 808, 815, 822, 828, 832, 825, 820, 818, 821, 819, 817, 822, 824, 825.25],
            volume: [110, 115, 120, 140, 175, 190, 125, 105, 92, 85, 76, 82, 95, 118, 150]
        },
        {
            symbol: "KOTAKBANK",
            name: "Kotak Mahindra Bank Ltd.",
            pattern: "Double Bottom",
            direction: "SELL",
            confidence: 81,
            entry: 1712.00,
            target: 1640.00,
            stopLoss: 1745.00,
            rr: "1 : 2.18",
            timestamp: "10:48:05",
            // Reversed direction mock candles
            candles: [1750, 1735, 1720, 1740, 1730, 1715, 1705, 1722, 1738, 1725, 1718, 1720, 1715, 1710, 1712.0],
            volume: [72, 65, 80, 88, 95, 76, 82, 70, 83, 91, 105, 88, 92, 112, 138]
        }
    ];

    const API_RESPONSES = {
        "today-signals": `{
  "status": "success",
  "data": {
    "timestamp": "2026-05-27T11:26:09Z",
    "signals_scanned": 204,
    "signals_active": 7,
    "signals": [
      {
        "symbol": "RELIANCE",
        "direction": "BUY",
        "pattern": "Cup & Handle",
        "confidence": 0.87,
        "entry": 2845.50,
        "target": 2990.00,
        "stop_loss": 2790.00,
        "verified_by_agents": ["DataIngestion", "ChartRenderer", "PatternVision", "SignalValidator", "Compliance"]
      },
      {
        "symbol": "TCS",
        "direction": "BUY",
        "pattern": "Bull Flag",
        "confidence": 0.82,
        "entry": 3912.10,
        "target": 4050.00,
        "stop_loss": 3840.00,
        "verified_by_agents": ["DataIngestion", "ChartRenderer", "PatternVision", "SignalValidator", "Compliance"]
      }
    ]
  }
}`,
        "screener": `{
  "status": "success",
  "data": {
    "screener_name": "Lightning Screener",
    "scan_criteria": {
      "index": "NIFTY_50",
      "min_confidence": 0.75,
      "patterns": ["Cup & Handle", "Bull Flag", "Double Bottom", "Ascending Triangle"]
    },
    "matches": [
      { "symbol": "INFY", "pattern": "Ascending Triangle", "confidence": 0.84 },
      { "symbol": "ICICIBANK", "pattern": "Cup & Handle", "confidence": 0.88 },
      { "symbol": "SBIN", "pattern": "Bull Flag", "confidence": 0.76 }
    ]
  }
}`,
        "ws-signals": `{
  "event": "signal_breakout",
  "topic": "signals:live",
  "payload": {
    "symbol": "TCS",
    "direction": "BUY",
    "pattern": "Bull Flag",
    "confidence": 0.82,
    "entry": 3912.10,
    "target": 4050.00,
    "stop_loss": 3840.00,
    "timestamp": "2026-05-27T11:15:02Z",
    "volume_surge": "2.4x"
  }
}`
    };

    // State Variables
    let activeSignals = [...STOCKS_DB];
    let selectedSignal = STOCKS_DB[0];
    let simulatedStocksScannedCount = 204;
    let pipelineInterval = null;
    let tickerInterval = null;

    // Canvas Constants & Contexts
    const heroCanvas = document.getElementById("hero-canvas");
    const mainChartCanvas = document.getElementById("main-terminal-canvas");
    let heroCtx = null;
    let mainChartCtx = null;

    // === 1. Background Hero Canvas Effect (Neural Net + Candlestick Drift) ===
    if (heroCanvas) {
        heroCtx = heroCanvas.getContext("2d");
        resizeHeroCanvas();
        window.addEventListener("resize", resizeHeroCanvas);
        
        // Setup neural nodes
        const nodes = [];
        const numNodes = 45;
        const driftCandles = [];
        
        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: Math.random() * heroCanvas.width,
                y: Math.random() * heroCanvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1
            });
        }

        // Setup subtle drifting candles in background
        for (let i = 0; i < 15; i++) {
            driftCandles.push({
                x: Math.random() * heroCanvas.width,
                y: Math.random() * heroCanvas.height,
                w: Math.random() * 4 + 2,
                h: Math.random() * 40 + 10,
                color: Math.random() > 0.4 ? "#00ff66" : "#ff3b30",
                speed: Math.random() * 0.2 + 0.05
            });
        }

        let mouse = { x: null, y: null };
        window.addEventListener("mousemove", (e) => {
            const rect = heroCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
        });

        function animateHero() {
            heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

            // Draw drifting candles first
            driftCandles.forEach(candle => {
                heroCtx.strokeStyle = candle.color;
                heroCtx.lineWidth = 1;
                // Draw wick
                heroCtx.beginPath();
                heroCtx.moveTo(candle.x + candle.w / 2, candle.y - 5);
                heroCtx.lineTo(candle.x + candle.w / 2, candle.y + candle.h + 5);
                heroCtx.stroke();
                
                // Draw body
                heroCtx.fillStyle = candle.color === "#00ff66" ? "rgba(0, 255, 102, 0.08)" : "rgba(255, 59, 48, 0.08)";
                heroCtx.fillRect(candle.x, candle.y, candle.w, candle.h);
                
                // Drift
                candle.x -= candle.speed;
                if (candle.x + candle.w < 0) {
                    candle.x = heroCanvas.width;
                    candle.y = Math.random() * heroCanvas.height;
                }
            });

            // Draw neural network nodes
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > heroCanvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > heroCanvas.height) node.vy *= -1;

                heroCtx.fillStyle = "rgba(0, 229, 255, 0.25)";
                heroCtx.beginPath();
                heroCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
                heroCtx.fill();
            });

            // Draw lines between nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.12;
                        heroCtx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        heroCtx.lineWidth = 0.5;
                        heroCtx.beginPath();
                        heroCtx.moveTo(nodes[i].x, nodes[i].y);
                        heroCtx.lineTo(nodes[j].x, nodes[j].y);
                        heroCtx.stroke();
                    }
                }

                // Check mouse proximity
                if (mouse.x !== null) {
                    const mDist = Math.hypot(nodes[i].x - mouse.x, nodes[i].y - mouse.y);
                    if (mDist < 160) {
                        const alpha = (1 - mDist / 160) * 0.35;
                        heroCtx.strokeStyle = `rgba(0, 255, 102, ${alpha})`;
                        heroCtx.lineWidth = 1;
                        heroCtx.beginPath();
                        heroCtx.moveTo(nodes[i].x, nodes[i].y);
                        heroCtx.lineTo(mouse.x, mouse.y);
                        heroCtx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateHero);
        }
        animateHero();
    }

    function resizeHeroCanvas() {
        heroCanvas.width = heroCanvas.parentElement.clientWidth;
        heroCanvas.height = heroCanvas.parentElement.clientHeight;
    }

    // === 2. Smooth Metrics Counter Widgets ===
    function animateMetrics() {
        const stocksEl = document.getElementById("metric-stocks");
        const latencyEl = document.getElementById("metric-latency");
        const accuracyEl = document.getElementById("metric-accuracy");
        const agentsEl = document.getElementById("metric-agents");

        // Dynamic targets
        let countStocks = 0;
        let countAccuracy = 0;
        let countAgents = 0;

        const intervalStocks = setInterval(() => {
            if (countStocks < simulatedStocksScannedCount) {
                countStocks += Math.ceil((simulatedStocksScannedCount - countStocks) / 10) || 1;
                stocksEl.innerText = String(countStocks).padStart(3, "0");
            } else {
                clearInterval(intervalStocks);
            }
        }, 30);

        const intervalAccuracy = setInterval(() => {
            if (countAccuracy < 87) {
                countAccuracy += 1;
                accuracyEl.innerText = countAccuracy;
            } else {
                clearInterval(intervalAccuracy);
            }
        }, 20);

        const intervalAgents = setInterval(() => {
            if (countAgents < 5) {
                countAgents += 1;
                agentsEl.innerText = countAgents;
            } else {
                clearInterval(intervalAgents);
            }
        }, 150);

        // Fluctuate Latency and Scanned Stocks count over time
        setInterval(() => {
            simulatedStocksScannedCount += Math.floor(Math.random() * 2) + 1;
            stocksEl.innerText = String(simulatedStocksScannedCount).padStart(3, "0");

            const latent = (2.2 + Math.random() * 0.25).toFixed(2);
            latencyEl.innerText = latent;

            const accuracyVar = (86.8 + Math.random() * 0.7).toFixed(1);
            // Dynamic minor accuracy bounce
            if (Math.random() > 0.7) {
                accuracyEl.innerText = Math.round(accuracyVar);
            }
        }, 4000);
    }
    animateMetrics();

    // === 3. Multi-Agent Pipeline Simulator ===
    function runAgentPipeline() {
        const agentNodes = [
            document.getElementById("agent-1"),
            document.getElementById("agent-2"),
            document.getElementById("agent-3"),
            document.getElementById("agent-4"),
            document.getElementById("agent-5")
        ];

        const logViewport = document.getElementById("log-viewport");
        const pulseNodes = [
            document.getElementById("pulse-1"),
            document.getElementById("pulse-2"),
            document.getElementById("pulse-3"),
            document.getElementById("pulse-4")
        ];

        const agentLogs = [
            [
                { level: "info", tag: "AGENT_01", msg: "NSE Direct L-3 Tick Stream Buffer Resized to 2048." },
                { level: "success", tag: "AGENT_01", msg: "Ingested trade packets for symbol {SYMBOL}. Normalizing OHLCV..." }
            ],
            [
                { level: "info", tag: "AGENT_02", msg: "High-DPI rendering initiated for resampled candle stream of {SYMBOL}." },
                { level: "success", tag: "AGENT_02", msg: "Canvas anti-aliased bitmap compiled for {SYMBOL}. Passing image node..." }
            ],
            [
                { level: "info", tag: "AGENT_03", msg: "Cognitive scan running on {SYMBOL} chart image. Executing convolution matrix..." },
                { level: "success", tag: "AGENT_03", msg: "Vision AI detected a structural {PATTERN} pattern. Confidence score: {CONFIDENCE}%." }
            ],
            [
                { level: "info", tag: "AGENT_04", msg: "Order book depth query executed. Analyzing volumes at price levels..." },
                { level: "success", tag: "AGENT_04", msg: "Breakout volume validated (2.4x surge). R/R ratio secure at {RR}." }
            ],
            [
                { level: "info", tag: "AGENT_05", msg: "SEBI RA Registry verification complete (INH200001483)." },
                { level: "success", tag: "AGENT_05", msg: "Audit trail signed. Broadcaster dispatched {DIRECTION} signal for {SYMBOL}." }
            ]
        ];

        let currentAgentIdx = 0;
        let randomStockCycle = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN"];
        let cycleSymbol = randomStockCycle[0];
        let cyclePattern = "Cup & Handle";
        let cycleConfidence = "87";
        let cycleRr = "1:2.6";
        let cycleDirection = "BUY";

        // Connection pulses moving animations
        function triggerPulseAnim(idx) {
            if (idx >= 4 || !pulseNodes[idx]) return;
            const pulse = pulseNodes[idx];
            pulse.classList.remove("active-pulse");
            void pulse.offsetWidth; // Trigger reflow
            pulse.classList.add("active-pulse");
        }

        function appendLog(level, tag, msg) {
            if (!logViewport) return;
            const now = new Date();
            const timeStr = `[${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}]`;
            
            const logRow = document.createElement("div");
            logRow.className = `log-row ${level}`;
            logRow.innerHTML = `<span class="log-time">${timeStr}</span> <span class="log-tag">[${tag}]</span> ${msg}`;
            
            logViewport.appendChild(logRow);
            logViewport.scrollTop = logViewport.scrollHeight;

            // Maintain log size limits
            if (logViewport.children.length > 30) {
                logViewport.removeChild(logViewport.firstChild);
            }
        }

        pipelineInterval = setInterval(() => {
            // Pick properties dynamically at start of cycle
            if (currentAgentIdx === 0) {
                const randomPick = activeSignals[Math.floor(Math.random() * activeSignals.length)];
                cycleSymbol = randomPick.symbol;
                cyclePattern = randomPick.pattern;
                cycleConfidence = randomPick.confidence;
                cycleRr = randomPick.rr;
                cycleDirection = randomPick.direction;
            }

            // Remove active classes
            agentNodes.forEach(node => {
                if (node) {
                    node.classList.remove("active");
                    node.classList.remove("active-vision");
                }
            });

            // Set current active agent
            const currentNode = agentNodes[currentAgentIdx];
            if (currentNode) {
                if (currentAgentIdx === 2) {
                    currentNode.classList.add("active-vision");
                } else {
                    currentNode.classList.add("active");
                }
            }

            // Execute corresponding agent logs
            const actions = agentLogs[currentAgentIdx];
            actions.forEach((act, actIdx) => {
                setTimeout(() => {
                    let processedMsg = act.msg
                        .replace("{SYMBOL}", cycleSymbol)
                        .replace("{PATTERN}", cyclePattern)
                        .replace("{CONFIDENCE}", cycleConfidence)
                        .replace("{RR}", cycleRr)
                        .replace("{DIRECTION}", cycleDirection);
                    appendLog(act.level, act.tag, processedMsg);
                }, actIdx * 800);
            });

            // Trigger visual arrow line pulses
            if (currentAgentIdx > 0) {
                triggerPulseAnim(currentAgentIdx - 1);
            }

            // Loop step
            currentAgentIdx = (currentAgentIdx + 1) % 5;
        }, 2200);
    }
    runAgentPipeline();

    // === 4. Live Signals Dashboard: Mini-Chart Renderers & WS Feeds ===
    function populateSignals() {
        const listContainer = document.getElementById("signals-list-box");
        if (!listContainer) return;
        
        listContainer.innerHTML = ""; // Clear loader skeletons

        activeSignals.forEach((stock, idx) => {
            const card = document.createElement("div");
            card.className = `signal-card-interactive ${stock.direction === "BUY" ? "buy-signal" : "sell-signal"}`;
            card.id = `signal-card-${stock.symbol}`;
            if (selectedSignal && selectedSignal.symbol === stock.symbol) {
                card.classList.add("selected");
            }

            card.innerHTML = `
                <div class="signal-card-header">
                    <div class="ticker-name-row">
                        <span class="card-ticker">${stock.symbol}</span>
                        <span class="card-pattern-lbl">${stock.name}</span>
                    </div>
                    <span class="signal-badge ${stock.direction.toLowerCase()}">${stock.direction}</span>
                </div>
                
                <div class="card-mini-metrics">
                    <div class="mini-met">
                        <span class="mini-lbl block">PATTERN</span>
                        <span class="mini-val text-cyan">${stock.pattern}</span>
                    </div>
                    <div class="mini-met">
                        <span class="mini-lbl block text-center">CONFIDENCE</span>
                        <div class="confidence-bar-outer mt-xs">
                            <div class="confidence-bar-inner ${stock.direction.toLowerCase()}" style="width: ${stock.confidence}%"></div>
                        </div>
                    </div>
                </div>
                
                <canvas class="card-mini-chart-canvas" id="mini-canvas-${stock.symbol}"></canvas>
                <div class="card-timestamp text-mono">${stock.timestamp}</div>
            `;

            // Click handler
            card.addEventListener("click", () => {
                selectSignalCard(stock);
            });

            listContainer.appendChild(card);
            
            // Draw the canvas candlestick visual for the card
            setTimeout(() => {
                drawMiniCandlestickChart(stock);
            }, 10);
        });
    }

    function selectSignalCard(stock) {
        selectedSignal = stock;
        
        // Toggle selected class on UI cards
        const allCards = document.querySelectorAll(".signal-card-interactive");
        allCards.forEach(c => c.classList.remove("selected"));

        const targetCard = document.getElementById(`signal-card-${stock.symbol}`);
        if (targetCard) targetCard.classList.add("selected");

        // Update Central Display info
        document.getElementById("chart-title").innerText = stock.symbol;
        document.getElementById("chart-pattern").innerText = `${stock.pattern} Pattern`;
        
        const badge = document.getElementById("chart-badge");
        badge.className = `signal-direction-badge ${stock.direction.toLowerCase()}`;
        badge.innerText = stock.direction;

        document.getElementById("chart-confidence").innerText = `${stock.confidence}%`;
        document.getElementById("chart-confidence").className = `val ${stock.direction === "BUY" ? "text-green" : "text-red"}`;
        
        document.getElementById("chart-time-val").innerText = stock.timestamp;

        document.getElementById("chart-entry").innerText = `₹${stock.entry.toFixed(2)}`;
        document.getElementById("chart-target").innerText = `₹${stock.target.toFixed(2)}`;
        document.getElementById("chart-target").className = `val ${stock.direction === "BUY" ? "text-green" : "text-red"}`;
        
        document.getElementById("chart-stop").innerText = `₹${stock.stopLoss.toFixed(2)}`;
        document.getElementById("chart-rr").innerText = stock.rr;

        // Animate Scan Overlay Line
        const scanOverlay = document.getElementById("vision-scan-line");
        if (scanOverlay) {
            scanOverlay.style.display = "block";
            setTimeout(() => {
                // Keep active
            }, 4000);
        }

        // Draw central display high-res chart
        drawMainChart(stock);
    }

    // Mini canvas drawing function
    function drawMiniCandlestickChart(stock) {
        const canvas = document.getElementById(`mini-canvas-${stock.symbol}`);
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        // DPI Scaling
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx.scale(dpr, dpr);

        const w = canvas.clientWidth;
        const h = canvas.clientHeight;

        ctx.clearRect(0, 0, w, h);
        
        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < w; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        }
        for (let i = 0; i < h; i += 15) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
        }

        const data = stock.candles;
        const minVal = Math.min(...data) - 5;
        const maxVal = Math.max(...data) + 5;
        const range = maxVal - minVal;

        const itemWidth = (w - 20) / data.length;
        const upColor = "#00ff66";
        const downColor = "#ff3b30";

        // Draw candles
        data.forEach((val, i) => {
            const nextVal = data[i+1] || val;
            const x = 10 + i * itemWidth;
            const open = val;
            const close = nextVal + (Math.random() - 0.5) * 2; // subtle variation for wicks
            
            const high = Math.max(open, close) + Math.random() * 2;
            const low = Math.min(open, close) - Math.random() * 2;

            const yOpen = h - ((open - minVal) / range) * (h - 10) - 5;
            const yClose = h - ((close - minVal) / range) * (h - 10) - 5;
            const yHigh = h - ((high - minVal) / range) * (h - 10) - 5;
            const yLow = h - ((low - minVal) / range) * (h - 10) - 5;

            const color = close >= open ? upColor : downColor;

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            // Wick
            ctx.beginPath();
            ctx.moveTo(x + itemWidth/2, yHigh);
            ctx.lineTo(x + itemWidth/2, yLow);
            ctx.stroke();

            // Body
            ctx.fillStyle = color;
            const rectHeight = Math.max(Math.abs(yOpen - yClose), 1.5);
            ctx.fillRect(x + 1, Math.min(yOpen, yClose), itemWidth - 2, rectHeight);
        });

        // Draw pattern geometric helper line
        ctx.strokeStyle = "rgba(0, 229, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);

        ctx.beginPath();
        if (stock.pattern === "Cup & Handle") {
            // Draw mini semi-circle
            ctx.arc(w/2, h/2 - 2, w/4, 0, Math.PI);
        } else if (stock.pattern === "Double Bottom") {
            // Draw W
            ctx.moveTo(15, 10);
            ctx.lineTo(w/3, h - 8);
            ctx.lineTo(w/2, h/2);
            ctx.lineTo(w * 0.7, h - 8);
            ctx.lineTo(w - 15, 10);
        } else if (stock.pattern === "Bull Flag") {
            // Draw channel lines
            ctx.moveTo(10, h - 10);
            ctx.lineTo(w/2, 10);
            ctx.lineTo(w * 0.8, 22);
            ctx.moveTo(w/2, 15);
            ctx.lineTo(w * 0.8, 27);
        } else {
            // Triangle
            ctx.moveTo(10, h - 10);
            ctx.lineTo(w - 15, h/2);
            ctx.lineTo(10, 10);
            ctx.closePath();
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // === 5. High-fidelity Central Screen Terminal Chart Render ===
    function drawMainChart(stock) {
        if (!mainChartCanvas) return;

        mainChartCtx = mainChartCanvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        mainChartCanvas.width = mainChartCanvas.clientWidth * dpr;
        mainChartCanvas.height = mainChartCanvas.clientHeight * dpr;
        mainChartCtx.scale(dpr, dpr);

        const w = mainChartCanvas.clientWidth;
        const h = mainChartCanvas.clientHeight;

        mainChartCtx.clearRect(0, 0, w, h);

        // Core Colors
        const isBuy = stock.direction === "BUY";
        const gridColor = "rgba(255, 255, 255, 0.02)";
        const axisColor = "rgba(255, 255, 255, 0.08)";
        const upColor = "#00ff66";
        const downColor = "#ff3b30";
        const themeColor = isBuy ? "#00ff66" : "#ff3b30";

        // Grid Drawing
        mainChartCtx.strokeStyle = gridColor;
        mainChartCtx.lineWidth = 1;
        const gridIntervalX = 60;
        const gridIntervalY = 40;

        for (let i = 0; i < w; i += gridIntervalX) {
            mainChartCtx.beginPath(); mainChartCtx.moveTo(i, 0); mainChartCtx.lineTo(i, h); mainChartCtx.stroke();
        }
        for (let i = 0; i < h; i += gridIntervalY) {
            mainChartCtx.beginPath(); mainChartCtx.moveTo(0, i); mainChartCtx.lineTo(w, i); mainChartCtx.stroke();
        }

        // Draw Right & Bottom borders (Axes)
        mainChartCtx.strokeStyle = axisColor;
        mainChartCtx.lineWidth = 1;
        mainChartCtx.beginPath();
        mainChartCtx.moveTo(0, h - 30);
        mainChartCtx.lineTo(w - 80, h - 30);
        mainChartCtx.lineTo(w - 80, 0);
        mainChartCtx.stroke();

        // Stock Candles In-Depth Rendering
        const data = stock.candles;
        const volData = stock.volume;
        const minVal = Math.min(...data) - 10;
        const maxVal = Math.max(...data) + 15;
        const range = maxVal - minVal;

        const usableW = w - 100;
        const usableH = h - 120;
        const itemWidth = usableW / data.length;

        // Draw Volume Histogram (transparent bars at the bottom)
        const maxVol = Math.max(...volData);
        volData.forEach((vol, i) => {
            const x = 20 + i * itemWidth;
            const barH = (vol / maxVol) * 45;
            mainChartCtx.fillStyle = isBuy ? "rgba(0, 255, 102, 0.06)" : "rgba(255, 59, 48, 0.06)";
            mainChartCtx.fillRect(x + 2, h - 30 - barH, itemWidth - 4, barH);
            mainChartCtx.strokeStyle = isBuy ? "rgba(0, 255, 102, 0.12)" : "rgba(255, 59, 48, 0.12)";
            mainChartCtx.lineWidth = 0.5;
            mainChartCtx.strokeRect(x + 2, h - 30 - barH, itemWidth - 4, barH);
        });

        // Loop and render complex candles
        data.forEach((val, i) => {
            const nextVal = data[i+1] || val + (Math.random() - 0.5) * 5;
            const x = 20 + i * itemWidth;
            
            const open = val;
            const close = nextVal;
            const high = Math.max(open, close) + Math.random() * 5 + 2;
            const low = Math.min(open, close) - Math.random() * 5 - 2;

            const yOpen = h - 30 - ((open - minVal) / range) * usableH - 20;
            const yClose = h - 30 - ((close - minVal) / range) * usableH - 20;
            const yHigh = h - 30 - ((high - minVal) / range) * usableH - 20;
            const yLow = h - 30 - ((low - minVal) / range) * usableH - 20;

            const color = close >= open ? upColor : downColor;

            // Wick
            mainChartCtx.strokeStyle = color;
            mainChartCtx.lineWidth = 1.5;
            mainChartCtx.beginPath();
            mainChartCtx.moveTo(x + itemWidth/2, yHigh);
            mainChartCtx.lineTo(x + itemWidth/2, yLow);
            mainChartCtx.stroke();

            // Candlestick Body with subtle horizontal grid shine
            mainChartCtx.fillStyle = color;
            const bodyH = Math.max(Math.abs(yOpen - yClose), 3);
            mainChartCtx.fillRect(x + 3, Math.min(yOpen, yClose), itemWidth - 6, bodyH);
            
            // Draw axis labels
            if (i % 3 === 0) {
                mainChartCtx.fillStyle = varColor("--text-dark");
                mainChartCtx.font = "9px JetBrains Mono";
                mainChartCtx.fillText(`T+${i}m`, x, h - 14);
            }
        });

        // Price Axis labels (right side)
        mainChartCtx.fillStyle = varColor("--text-muted");
        mainChartCtx.font = "9px JetBrains Mono";
        for (let i = 0; i <= 5; i++) {
            const valLabel = minVal + (range / 5) * i;
            const y = h - 30 - (i / 5) * usableH - 20;
            mainChartCtx.fillText(`₹${valLabel.toFixed(1)}`, w - 74, y + 3);
            // Tick dash
            mainChartCtx.strokeStyle = axisColor;
            mainChartCtx.beginPath();
            mainChartCtx.moveTo(w - 80, y);
            mainChartCtx.lineTo(w - 76, y);
            mainChartCtx.stroke();
        }

        // Draw Pattern Overlay Vision Geometry
        mainChartCtx.strokeStyle = isBuy ? "rgba(0, 229, 255, 0.75)" : "rgba(255, 59, 48, 0.75)";
        mainChartCtx.lineWidth = 2.5;
        mainChartCtx.setLineDash([4, 4]);

        mainChartCtx.beginPath();
        if (stock.pattern === "Cup & Handle") {
            // Draw elaborate bezier curve for cup
            const startX = 40;
            const startY = h - 120;
            const cp1X = w * 0.25;
            const cp1Y = h - 20;
            const cp2X = w * 0.55;
            const cp2Y = h - 20;
            const endX = w * 0.75;
            const endY = h - 110;

            mainChartCtx.moveTo(startX, startY);
            mainChartCtx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
            // Handle draw
            mainChartCtx.lineTo(w * 0.85, h - 85);
            mainChartCtx.lineTo(w * 0.92, h - 130); // Breakout arrow segment
        } else if (stock.pattern === "Double Bottom") {
            // Draw Double Bottom 'W' shapes
            mainChartCtx.moveTo(40, 60);
            mainChartCtx.lineTo(w * 0.25, h - 80);
            mainChartCtx.lineTo(w * 0.45, h * 0.45);
            mainChartCtx.lineTo(w * 0.65, h - 80);
            mainChartCtx.lineTo(w * 0.88, 40);
        } else if (stock.pattern === "Bull Flag") {
            // Draw Flag Pole
            mainChartCtx.moveTo(40, h - 60);
            mainChartCtx.lineTo(w * 0.45, 60);
            // Flag body channels
            const fTopLeftX = w * 0.45;
            const fTopLeftY = 60;
            mainChartCtx.lineTo(w * 0.8, 120); // top border
            mainChartCtx.moveTo(w * 0.38, h * 0.5);
            mainChartCtx.lineTo(w * 0.75, 170); // bottom border
        } else {
            // Triangle structures
            mainChartCtx.moveTo(40, h - 70);
            mainChartCtx.lineTo(w * 0.85, h * 0.4);
            mainChartCtx.lineTo(40, 50);
            mainChartCtx.closePath();
        }
        mainChartCtx.stroke();
        mainChartCtx.setLineDash([]);

        // Vision Target Spotlights (small green crosshairs)
        mainChartCtx.strokeStyle = varColor("--electric-blue");
        mainChartCtx.lineWidth = 1.5;
        
        const spotX = w * 0.75;
        const spotY = h - 110;
        
        mainChartCtx.beginPath();
        mainChartCtx.arc(spotX, spotY, 8, 0, Math.PI * 2);
        mainChartCtx.stroke();
        // Crosshair lines
        mainChartCtx.beginPath();
        mainChartCtx.moveTo(spotX - 12, spotY); mainChartCtx.lineTo(spotX + 12, spotY);
        mainChartCtx.moveTo(spotX, spotY - 12); mainChartCtx.lineTo(spotX, spotY + 12);
        mainChartCtx.stroke();

        // Print mathematical tags in chart
        mainChartCtx.fillStyle = varColor("--electric-blue");
        mainChartCtx.font = "bold 9px JetBrains Mono";
        mainChartCtx.fillText("VISION_TRIGGER: BREAKOUT_POINT", spotX + 16, spotY + 3);
    }

    // Helper to get CSS root variables values inside canvas
    function varColor(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // Dynamic Websocket Simulated Adder
    function simulateNewSignalPush() {
        setInterval(() => {
            const extraStocks = [
                { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", pattern: "Double Bottom", entry: 945.00, target: 995.00, stopLoss: 915.00, rr: "1 : 1.67" },
                { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd.", pattern: "Cup & Handle", entry: 1320.00, target: 1410.00, stopLoss: 1290.00, rr: "1 : 3.00" },
                { symbol: "WIPRO", name: "Wipro Ltd.", pattern: "Bull Flag", entry: 462.50, target: 495.00, stopLoss: 448.00, rr: "1 : 2.24" },
                { symbol: "LTIM", name: "LTIMindtree Ltd.", pattern: "Ascending Triangle", entry: 4780.00, target: 5100.00, stopLoss: 4610.00, rr: "1 : 1.88" }
            ];

            const pick = extraStocks[Math.floor(Math.random() * extraStocks.length)];
            
            // Check if stock already exists in current list to prevent excessive duplicate cards
            if (activeSignals.some(s => s.symbol === pick.symbol)) return;

            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
            
            const newObj = {
                ...pick,
                direction: Math.random() > 0.15 ? "BUY" : "SELL", // default strong BUY bias for bulls
                confidence: Math.floor(Math.random() * 15) + 75,
                timestamp: timeStr,
                candles: Array.from({length: 15}, () => pick.entry + (Math.random() - 0.5) * (pick.entry * 0.03)),
                volume: Array.from({length: 15}, () => Math.floor(Math.random() * 100) + 40)
            };

            // Inject at index 0
            activeSignals.unshift(newObj);
            
            // Limit array bounds
            if (activeSignals.length > 10) {
                activeSignals.pop();
            }

            // Repopulate UI and draw w/ highlight effect
            populateSignals();
            
            const cardElement = document.getElementById(`signal-card-${newObj.symbol}`);
            if (cardElement) {
                cardElement.style.border = "1px solid #00ff66";
                cardElement.style.boxShadow = "0 0 15px rgba(0, 255, 102, 0.3)";
                setTimeout(() => {
                    cardElement.style.border = "";
                    cardElement.style.boxShadow = "";
                }, 3000);
            }
        }, 16000);
    }

    // === 6. Sidebar Search & Filter Handling ===
    const searchBar = document.getElementById("signal-search");
    const filterDropdown = document.getElementById("signal-filter");

    if (searchBar && filterDropdown) {
        function handleFilters() {
            const searchVal = searchBar.value.toUpperCase();
            const filterVal = filterDropdown.value;

            const filtered = STOCKS_DB.filter(stock => {
                const matchesSearch = stock.symbol.includes(searchVal);
                const matchesPattern = filterVal === "ALL" || stock.pattern === filterVal;
                return matchesSearch && matchesPattern;
            });

            activeSignals = filtered;
            populateSignals();
        }

        searchBar.addEventListener("input", handleFilters);
        filterDropdown.addEventListener("change", handleFilters);
    }

    // === 7. API Sandbox Console Executor ===
    const apiRouteBtns = document.querySelectorAll(".api-route-btn");
    const apiCodeBlock = document.getElementById("api-code-block");
    const runMockBtn = document.getElementById("run-mock-api");
    const apiStatus = document.getElementById("api-status-badge");
    const apiTime = document.getElementById("api-time-badge");
    let activeEndpoint = "today-signals";

    apiRouteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            apiRouteBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeEndpoint = btn.dataset.endpoint;
            
            // Immediate placeholder update
            apiCodeBlock.innerText = `Loading cached output for route: ${btn.querySelector(".route").innerText}...`;
            runMockApiRequest();
        });
    });

    if (runMockBtn) {
        runMockBtn.addEventListener("click", runMockApiRequest);
    }

    function runMockApiRequest() {
        if (!apiCodeBlock) return;

        apiStatus.innerText = "STATUS: PENDING...";
        apiStatus.style.color = "var(--text-muted)";
        
        setTimeout(() => {
            apiStatus.innerText = "STATUS: 200 OK";
            apiStatus.style.color = "var(--neon-green)";
            
            const randomLatency = Math.floor(Math.random() * 8) + 6;
            apiTime.innerText = `RESPONSE TIME: ${randomLatency}ms`;
            
            apiCodeBlock.innerText = API_RESPONSES[activeEndpoint];
        }, 350);
    }

    // === 8. Ticker Tape Generator ===
    function animateTickerTape() {
        const track = document.getElementById("ticker-track");
        if (!track) return;
        
        // Dynamically double items to ensure continuous glide loop
        const originalContent = track.innerHTML;
        track.innerHTML = originalContent + originalContent;
        
        // Slow tick updater for price fluctuations
        tickerInterval = setInterval(() => {
            const items = track.querySelectorAll(".ticker-item");
            if (items.length === 0) return;
            
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const priceEl = randomItem.querySelector(".ticker-price");
            const changeEl = randomItem.querySelector(".ticker-change");

            if (!priceEl || !changeEl) return;

            let price = parseFloat(priceEl.innerText.replace("₹", "").replace(",", ""));
            let deltaPercent = (Math.random() - 0.5) * 0.4; // +/- 0.2% change
            let priceDelta = price * (deltaPercent / 100);
            
            price += priceDelta;
            priceEl.innerText = `₹${price.toLocaleString("en-IN", {maximumFractionDigits: 2, minimumFractionDigits: 2})}`;
            
            let isUp = changeEl.classList.contains("up");
            let changeVal = parseFloat(changeEl.innerText.replace("%", ""));
            changeVal += deltaPercent;

            if (changeVal >= 0) {
                changeEl.className = "ticker-change up";
                changeEl.innerText = `+${changeVal.toFixed(2)}%`;
            } else {
                changeEl.className = "ticker-change down";
                changeEl.innerText = `${changeVal.toFixed(2)}%`;
            }
        }, 3000);
    }

    // === 9. Global Initialization Execution ===
    populateSignals();
    if (selectedSignal) {
        setTimeout(() => {
            selectSignalCard(selectedSignal);
        }, 100);
    }
    simulateNewSignalPush();
    animateTickerTape();
});
