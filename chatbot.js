/**
 * Power Bull — Spider AI Chatbot Integration
 * Core Logic, Multi-Provider REST API Connector, and UI State Controller
 */

document.addEventListener("DOMContentLoaded", () => {
    // === DOM Element Selectors ===
    const chatBubble = document.getElementById("spider-chat-bubble");
    const chatContainer = document.getElementById("spider-chat-container");
    const chatCloseBtn = document.getElementById("chat-close-btn");
    const chatMinimizeBtn = document.getElementById("chat-minimize-btn");
    const chatKeyToggleBtn = document.getElementById("chat-key-toggle-btn");
    const chatInput = document.getElementById("chat-input-field");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatMessagesViewport = document.getElementById("chat-messages-viewport");
    const suggestionChipsContainer = document.getElementById("chat-suggestion-chips");
    
    // API Key Config Panel
    const chatKeyPanel = document.getElementById("chat-key-panel");
    const apiKeyInput = document.getElementById("api-key-input");
    const apiKeySaveBtn = document.getElementById("save-key-btn");
    const apiKeyDeleteBtn = document.getElementById("delete-key-btn");
    const apiKeyStatus = document.getElementById("key-status-indicator");
    const apiKeyMissingWarning = document.getElementById("api-key-missing-warning");

    // === State Variables ===
    let chatOpen = false;
    let apiKey = localStorage.getItem("AI_API_KEY") || localStorage.getItem("GEMINI_API_KEY") || "";
    // Store generic history: [{role: "user" | "assistant", content: "..."}]
    let chatHistory = []; 
    let isSending = false;
    let currentProvider = "UNKNOWN";

    const KEY_MASK = "••••••••••••••••••••••••••••••••";

    // Detect provider immediately if key exists
    if (apiKey) currentProvider = detectProvider(apiKey);

    // === Initialize API Key Status UI ===
    updateApiKeyUI();

    // === Event Listeners ===

    // Toggle Chat window visibility
    chatBubble.addEventListener("click", () => {
        chatOpen = true;
        chatContainer.classList.add("active");
        chatBubble.classList.remove("active");
        scrollToBottom();
        chatInput.focus();
    });

    chatCloseBtn.addEventListener("click", closeChat);
    chatMinimizeBtn.addEventListener("click", closeChat);

    function closeChat() {
        chatOpen = false;
        chatContainer.classList.remove("active");
        chatBubble.classList.add("active");
    }

    chatKeyToggleBtn.addEventListener("click", () => {
        const isOpening = !chatKeyPanel.classList.contains("active");
        chatKeyPanel.classList.toggle("active");
        if (isOpening) {
            apiKeyInput.value = "";
            apiKeyInput.type = "text";
            apiKeyInput.placeholder = apiKey ? `Paste new key to replace (${currentProvider})...` : "Paste OpenAI, Groq, Claude, or Gemini Key...";
            apiKeyInput.focus();
        }
    });

    apiKeySaveBtn.addEventListener("click", () => {
        const value = apiKeyInput.value.trim();
        if (!value || value === KEY_MASK) {
            addSystemMessage("Please paste a valid API key.");
            return;
        }
        
        apiKey = value;
        currentProvider = detectProvider(apiKey);
        
        if (currentProvider === "UNKNOWN") {
            addSystemMessage("Warning: Provider not recognized from key format. Assuming OpenAI-compatible format.");
            currentProvider = "OPENAI_COMPATIBLE";
        }
        
        localStorage.setItem("AI_API_KEY", apiKey);
        updateApiKeyUI();
        chatKeyPanel.classList.remove("active");
        addSystemMessage(`API Key securely saved. Detected Provider: **${currentProvider}**`);
    });

    apiKeyDeleteBtn.addEventListener("click", () => {
        apiKey = "";
        currentProvider = "UNKNOWN";
        localStorage.removeItem("AI_API_KEY");
        localStorage.removeItem("GEMINI_API_KEY");
        apiKeyInput.value = "";
        updateApiKeyUI();
        addSystemMessage("API Key cleared.");
    });

    chatSendBtn.addEventListener("click", handleUserMessageSend);

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserMessageSend();
        }
    });

    // === Core Chatbot Functions ===

    function detectProvider(key) {
        if (key.startsWith("sk-ant-")) return "ANTHROPIC";
        if (key.startsWith("sk-proj-") || key.startsWith("sk-")) return "OPENAI";
        if (key.startsWith("gsk_")) return "GROQ";
        if (key.startsWith("AIza")) return "GEMINI";
        return "UNKNOWN";
    }

    function updateApiKeyUI() {
        if (apiKey) {
            apiKeyInput.value = KEY_MASK;
            apiKeyInput.type = "password";
            apiKeyStatus.className = "key-status-indicator secured";
            apiKeyStatus.textContent = `SECURED (${currentProvider})`;
            apiKeyMissingWarning.classList.remove("visible");
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
        } else {
            apiKeyInput.value = "";
            apiKeyInput.type = "text";
            apiKeyStatus.className = "key-status-indicator inactive";
            apiKeyStatus.textContent = "NO_KEY_SET";
            apiKeyMissingWarning.classList.add("visible");
            chatInput.disabled = true;
            chatSendBtn.disabled = true;
        }
    }

    function appendMessage(role, text) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-message-bubble ${role}`;
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        msgDiv.innerHTML = `
            <div class="message-meta text-mono">
                <span class="message-sender">${role === "user" ? "INVESTOR" : "SPIDER_AI"}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-text">${role === "user" ? escapeHTML(text) : formatMarkdown(text)}</div>
        `;
        
        chatMessagesViewport.appendChild(msgDiv);
        scrollToBottom();
    }

    function addSystemMessage(text) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "chat-system-alert text-mono";
        // Let it render markdown strictly for basic formatting like bold
        alertDiv.innerHTML = `[SYSTEM] ${formatMarkdown(text)}`;
        chatMessagesViewport.appendChild(alertDiv);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "chat-message-bubble model typing-indicator-bubble";
        indicator.id = "chat-typing-indicator";
        indicator.innerHTML = `
            <div class="message-meta text-mono">
                <span class="message-sender">SPIDER_AI</span>
                <span class="message-status text-cyan">SCANNING_GEOMETRY...</span>
            </div>
            <div class="typing-loader">
                <span class="loader-dot"></span>
                <span class="loader-dot"></span>
                <span class="loader-dot"></span>
            </div>
        `;
        chatMessagesViewport.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById("chat-typing-indicator");
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessagesViewport.scrollTop = chatMessagesViewport.scrollHeight;
        });
    }

    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function formatMarkdown(text) {
        if (!text) return "";
        let html = escapeHTML(text);
        html = html.replace(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/g, (match, p1) => `<pre class="chat-code-block text-mono"><code>${p1.trim()}</code></pre>`);
        html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code text-mono">$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        html = html.split('\n').map(line => {
            let trimmed = line.trim();
            if (trimmed.startsWith('&amp;bull; ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return `<li class="chat-list-item">${trimmed.replace(/^(&amp;bull;|\*|-)\s+/, '')}</li>`;
            }
            return line;
        }).join('\n');

        html = html.replace(/((?:<li class="chat-list-item">.*?<\/li>\n?)+)/g, '<ul class="chat-list">$1</ul>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function getScannerContext() {
        try {
            const titleEl = document.getElementById("chart-title");
            if (!titleEl || !titleEl.innerText) return null;
            
            return {
                symbol: titleEl.innerText,
                pattern: document.getElementById("chart-pattern").innerText.replace("Pattern", "").trim(),
                confidence: document.getElementById("chart-confidence").innerText,
                time: document.getElementById("chart-time-val").innerText,
                entry: document.getElementById("chart-entry").innerText,
                target: document.getElementById("chart-target").innerText,
                stop: document.getElementById("chart-stop").innerText,
                rr: document.getElementById("chart-rr").innerText
            };
        } catch (e) {
            console.error("Failed to extract active scanner context: ", e);
            return null;
        }
    }

    function updateSuggestionChips() {
        const ctx = getScannerContext();
        if (!ctx) return;

        suggestionChipsContainer.innerHTML = `
            <button class="suggestion-chip" data-prompt="Analyze the active ${ctx.symbol} ${ctx.pattern} setup. What is the likelihood of target hitting?">Analyze ${ctx.symbol}</button>
            <button class="suggestion-chip" data-prompt="Explain the geometrical mechanics of a ${ctx.pattern} pattern and how it establishes target breakouts.">${ctx.pattern} Pattern</button>
            <button class="suggestion-chip" data-prompt="The risk/reward for ${ctx.symbol} is listed as ${ctx.rr}. Review the entry ${ctx.entry}, target ${ctx.target}, and stop-loss ${ctx.stop} for validation.">Verify R/R</button>
            <button class="suggestion-chip" data-prompt="Does this ${ctx.pattern} scanner signal fully adhere to SEBI Registered Research Analyst advisory limits?">SEBI Check</button>
        `;

        const chips = suggestionChipsContainer.querySelectorAll(".suggestion-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                if (isSending) return;
                chatInput.value = chip.dataset.prompt;
                handleUserMessageSend();
            });
        });
    }

    const scannerTitleEl = document.getElementById("chart-title");
    if (scannerTitleEl) {
        new MutationObserver(updateSuggestionChips).observe(scannerTitleEl, { childList: true, characterData: true, subtree: true });
        updateSuggestionChips();
    }

    // === Multi-Provider API Dispatch ===

    async function handleUserMessageSend() {
        const userText = chatInput.value.trim();
        if (!userText || isSending) return;

        if (!apiKey) {
            chatKeyPanel.classList.add("active");
            return;
        }

        isSending = true;
        chatSendBtn.disabled = true;

        appendMessage("user", userText);
        chatInput.value = ""; 
        
        chatHistory.push({ role: "user", content: userText });
        appendTypingIndicator();

        const ctx = getScannerContext();
        let systemInstructions = `You are a high-performance, professional SEBI-compliant Stock Market Technical Analyst assistant integrated inside the 'Power Bull — Spider AI Stock Pattern Scanner' terminal.
Your task is to analyze chart pattern breakouts and explain trading setups scientifically. Keep your tone informative, authoritative, and helpful. Use markdown, lists, and bold text for clarity.

REGULATORY GUARDRAIL: You are operating inside a SEBI Registered Research Analyst dashboard (Registration NO: INH200001483). Under SEBI guidelines, always emphasize that your analyses are strictly for educational scanner pattern validation, visual chart studies, and research support. Do not guarantee any specific returns, and do not provide direct buy/sell financial recommendations. Always add a tiny standard SEBI compliance disclaimer at the bottom of highly specific trade answers.`;

        if (ctx) {
            systemInstructions += `\n\nCURRENTLY SELECTED STOCK SCAN DETAIL ON USER'S SCREEN:
- Symbol: ${ctx.symbol}
- Detected Pattern: ${ctx.pattern}
- Neural Scanner Confidence: ${ctx.confidence}
- Generation Time: ${ctx.time}
- Current Ingested Entry: ${ctx.entry}
- Visual Target Price: ${ctx.target}
- Audited Stop Loss: ${ctx.stop}
- Calculated Risk/Reward (R/R): ${ctx.rr}

When the user asks to analyze the current setup, verify or discuss, actively reference this stock symbol (${ctx.symbol}), its ${ctx.pattern} pattern, and these exact price boundary figures to make the response deeply integrated and relevant to what they are looking at on the dashboard.`;
        }

        try {
            let aiResponseText = "";

            if (currentProvider === "OPENAI" || currentProvider === "GROQ" || currentProvider === "OPENAI_COMPATIBLE") {
                aiResponseText = await callOpenAICompatible(systemInstructions);
            } else if (currentProvider === "GEMINI") {
                aiResponseText = await callGemini(systemInstructions);
            } else if (currentProvider === "ANTHROPIC") {
                aiResponseText = await callAnthropic(systemInstructions);
            }

            if (!aiResponseText) throw new Error("Empty response from AI provider.");

            appendMessage("model", aiResponseText);
            chatHistory.push({ role: "assistant", content: aiResponseText });

        } catch (error) {
            console.error("AI API connection error:", error);
            chatHistory.pop(); // Remove user msg from history
            
            let userFriendlyError = error.message || "Failed to establish secure communications with AI nodes.";
            
            // Helpful hints for CORS or invalid keys
            if (userFriendlyError.includes("Failed to fetch") && currentProvider === "ANTHROPIC") {
                userFriendlyError = "Anthropic API blocked the browser request (CORS error). Claude requires a backend proxy to run on web apps securely.";
            } else if (userFriendlyError.includes("API key not valid") || userFriendlyError.includes("401") || userFriendlyError.includes("invalid_api_key")) {
                userFriendlyError = "Invalid API Key. Please click the lock icon and paste a valid key for your provider.";
                chatKeyPanel.classList.add("active");
            } else if (userFriendlyError.includes("Failed to fetch")) {
                userFriendlyError = "Network error or CORS block. Ensure you are connected to the internet and the API supports client-side calls.";
            }
            
            appendMessage("model", `**Connection Error (${currentProvider}):** ${userFriendlyError}`);
        } finally {
            removeTypingIndicator();
            isSending = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // --- Provider Specific Adapters ---

    async function callOpenAICompatible(systemPrompt) {
        const isGroq = currentProvider === "GROQ";
        const endpoint = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
        const model = isGroq ? "llama-3.1-8b-instant" : "gpt-4o-mini"; // Default models
        
        const messages = [{ role: "system", content: systemPrompt }, ...chatHistory];
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({ model, messages, temperature: 0.3 })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content;
    }

    async function callAnthropic(systemPrompt) {
        // Warning: Anthropic officially blocks browser fetch requests via CORS.
        const endpoint = "https://api.anthropic.com/v1/messages";
        
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true" // Required if trying from browser
            },
            body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 1024,
                system: systemPrompt,
                messages: chatHistory
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data.content?.[0]?.text;
    }

    async function callGemini(systemPrompt) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        // Map generic history to Gemini's specific format
        const contents = chatHistory.map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        const payload = {
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        if (data.candidates?.[0]?.finishReason === "SAFETY") {
            return "The response was blocked by Google Gemini's safety filters.";
        }
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
});
