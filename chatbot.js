/**
 * Power Bull — Spider AI Chatbot Integration
 * Core Logic, Gemini REST API Connector, and UI State Controller
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
    let apiKey = localStorage.getItem("GEMINI_API_KEY") || "";
    let chatHistory = []; // Stores history in {"role": "user"|"model", "parts": [{"text": "..."}]} format

    // === Initialize API Key Status UI ===
    updateApiKeyUI();

    // === Event Listeners ===

    // Toggle Chat window visibility
    chatBubble.addEventListener("click", () => {
        chatOpen = true;
        chatContainer.classList.add("active");
        chatBubble.classList.remove("active"); // Hide bubble when chat is open
        scrollToBottom();
        chatInput.focus();
    });

    // Close/Hide Chat window
    chatCloseBtn.addEventListener("click", closeChat);
    chatMinimizeBtn.addEventListener("click", closeChat);

    function closeChat() {
        chatOpen = false;
        chatContainer.classList.remove("active");
        chatBubble.classList.add("active");
    }

    // Toggle API Key settings panel
    chatKeyToggleBtn.addEventListener("click", () => {
        chatKeyPanel.classList.toggle("active");
    });

    // Save API key
    apiKeySaveBtn.addEventListener("click", () => {
        const value = apiKeyInput.value.trim();
        if (value) {
            apiKey = value;
            localStorage.setItem("GEMINI_API_KEY", apiKey);
            updateApiKeyUI();
            chatKeyPanel.classList.remove("active");
            addSystemMessage("API Key saved securely in localStorage.");
        }
    });

    // Delete API key
    apiKeyDeleteBtn.addEventListener("click", () => {
        apiKey = "";
        localStorage.removeItem("GEMINI_API_KEY");
        apiKeyInput.value = "";
        updateApiKeyUI();
        addSystemMessage("API Key cleared.");
    });

    // Send message on click
    chatSendBtn.addEventListener("click", handleUserMessageSend);

    // Send message on Enter key press (without shift)
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleUserMessageSend();
        }
    });

    // === Core Chatbot Functions ===

    // Update API Key state UI and warnings
    function updateApiKeyUI() {
        if (apiKey) {
            apiKeyInput.value = "••••••••••••••••••••••••••••••••";
            apiKeyStatus.className = "key-status-indicator secured";
            apiKeyStatus.textContent = "KEY_SECURED";
            apiKeyMissingWarning.classList.remove("visible");
            chatInput.disabled = false;
            chatSendBtn.disabled = false;
        } else {
            apiKeyInput.value = "";
            apiKeyStatus.className = "key-status-indicator inactive";
            apiKeyStatus.textContent = "NO_KEY_SET";
            apiKeyMissingWarning.classList.add("visible");
            chatInput.disabled = true;
            chatSendBtn.disabled = true;
        }
    }

    // Add a message bubble to the chat viewport
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

    // Appends simple informational system alerts
    function addSystemMessage(text) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "chat-system-alert text-mono";
        alertDiv.textContent = `[SYSTEM] ${text}`;
        chatMessagesViewport.appendChild(alertDiv);
        scrollToBottom();
    }

    // Appends dynamic loading placeholder
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

    // Removes dynamic loading placeholder
    function removeTypingIndicator() {
        const indicator = document.getElementById("chat-typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }

    // Scroll chat window to bottom
    function scrollToBottom() {
        chatMessagesViewport.scrollTop = chatMessagesViewport.scrollHeight;
    }

    // Helper: Escape raw HTML tags to prevent XSS
    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Helper: Formats basic markdown to present structured answers
    function formatMarkdown(text) {
        if (!text) return "";
        let html = text;
        
        // Escape standard HTML first to prevent code injection
        html = escapeHTML(html);
        
        // Unescape specifically backticks/markdown triggers we formatted
        // Re-compile code blocks: ```lang ... ```
        html = html.replace(/```(?:[a-zA-Z]+)?\n([\s\S]*?)```/g, (match, p1) => {
            return `<pre class="chat-code-block text-mono"><code>${p1.trim()}</code></pre>`;
        });
        
        // Re-compile inline code: `code`
        html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code text-mono">$1</code>');
        
        // Re-compile bold text: **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Re-compile italic text: *text*
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Handle list bullet items (* item or - item)
        html = html.split('\n').map(line => {
            let trimmed = line.trim();
            if (trimmed.startsWith('&amp;bull; ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                // Strip the bullet marker
                let content = trimmed.replace(/^(&amp;bull;|\*|-)\s+/, '');
                return `<li class="chat-list-item">${content}</li>`;
            }
            return line;
        }).join('\n');

        // Wrap list items in <ul>
        // This is a simple parser, we'll replace sequential <li> items with grouped tags
        html = html.replace(/((?:<li class="chat-list-item">.*?<\/li>\n?)+)/g, '<ul class="chat-list">$1</ul>');

        // Render remaining single newlines as line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }

    // === Dynamic Stock Context Grabber ===
    function getScannerContext() {
        try {
            const titleEl = document.getElementById("chart-title");
            if (!titleEl || !titleEl.innerText) {
                return null;
            }
            
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

    // Update Suggestion Chips text based on Selected Stock
    function updateSuggestionChips() {
        const ctx = getScannerContext();
        if (!ctx) return;

        suggestionChipsContainer.innerHTML = `
            <button class="suggestion-chip" data-prompt="Analyze the active ${ctx.symbol} ${ctx.pattern} setup. What is the likelihood of target hitting?">
                Analyze ${ctx.symbol} ${ctx.pattern} Setup
            </button>
            <button class="suggestion-chip" data-prompt="Explain the geometrical mechanics of a ${ctx.pattern} pattern and how it establishes target breakouts.">
                Explain ${ctx.pattern} Pattern
            </button>
            <button class="suggestion-chip" data-prompt="The risk/reward for ${ctx.symbol} is listed as ${ctx.rr}. Review the entry ${ctx.entry}, target ${ctx.target}, and stop-loss ${ctx.stop} for validation.">
                Verify R/R Parameters
            </button>
            <button class="suggestion-chip" data-prompt="Does this ${ctx.pattern} scanner signal fully adhere to SEBI Registered Research Analyst advisory limits?">
                SEBI Advisory Check
            </button>
        `;

        // Re-attach listeners to suggestion chips
        const chips = suggestionChipsContainer.querySelectorAll(".suggestion-chip");
        chips.forEach(chip => {
            chip.addEventListener("click", () => {
                const promptText = chip.dataset.prompt;
                chatInput.value = promptText;
                handleUserMessageSend();
            });
        });
    }

    // === Mutation Observer for Scanner Changes ===
    // This allows the chatbot suggestions to auto-sync when the dashboard active card shifts
    const scannerTitleEl = document.getElementById("chart-title");
    if (scannerTitleEl) {
        const observer = new MutationObserver(() => {
            updateSuggestionChips();
        });
        observer.observe(scannerTitleEl, { childList: true, characterData: true, subtree: true });
        // Run once initially
        updateSuggestionChips();
    }

    // === Sending & Receiving Messages (Gemini API Core) ===

    async function handleUserMessageSend() {
        const userText = chatInput.value.trim();
        if (!userText) return;

        // Ensure key is present
        if (!apiKey) {
            chatKeyPanel.classList.add("active");
            return;
        }

        // Display user message in chat UI
        appendMessage("user", userText);
        chatInput.value = ""; // Clear input field

        // Push to local chat history for Gemini model conversation context
        chatHistory.push({
            "role": "user",
            "parts": [{"text": userText}]
        });

        // Show typing indicator loading states
        appendTypingIndicator();

        // Query active context from the pattern scanner
        const ctx = getScannerContext();
        
        // System instructions detailing the expert bot profile and real-time dashboard data context
        let systemInstructions = `You are a high-performance, professional SEBI-compliant Stock Market Technical Analyst assistant integrated inside the 'Power Bull — Spider AI Stock Pattern Scanner' terminal.
Your task is to analyze chart pattern breakouts (e.g., Cup & Handles, Double Bottoms, Bull Flags, Ascending Triangles) and explain trading setups scientifically.
Keep your tone informative, authoritative, and helpful. Use markdown, lists, and bold text for clarity.

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
            // REST endpoint to Gemini 1.5 Flash
            const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            
            const payload = {
                "contents": chatHistory,
                "systemInstruction": {
                    "parts": [
                        {"text": systemInstructions}
                    ]
                },
                "generationConfig": {
                    "temperature": 0.3,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 1024
                }
            };

            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
            }

            const resData = await response.json();
            removeTypingIndicator();

            const aiResponseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiResponseText) {
                // Display response
                appendMessage("model", aiResponseText);
                
                // Add to history
                chatHistory.push({
                    "role": "model",
                    "parts": [{"text": aiResponseText}]
                });
            } else {
                throw new Error("Empty candidate response returned from Gemini.");
            }

        } catch (error) {
            console.error("Gemini Chatbot API connection error:", error);
            removeTypingIndicator();
            
            // Pop the last user message from history since the turn failed
            chatHistory.pop();
            
            let userFriendlyError = "Failed to establish secure communications with Gemini nodes. Please verify your internet connection or check if your API Key is correct.";
            if (error.message.includes("API key not valid")) {
                userFriendlyError = "Invalid API Key. Please open the settings panel in the top-right header (API Key icon) and supply a functional Google AI Studio key.";
                chatKeyPanel.classList.add("active");
            }
            
            appendMessage("model", `Error: ${userFriendlyError}`);
        }
    }
});
