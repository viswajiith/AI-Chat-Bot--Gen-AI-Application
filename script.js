let chatHistory = [];

function updateTempValue(value) {
    document.getElementById('tempValue').textContent = value;
}

function updateTokensValue(value) {
    document.getElementById('tokensValue').textContent = value;
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function setPrompt(prompt) {
    document.getElementById('userInput').value = prompt;
}

function addMessage(content, isUser = false) {
    const chatHistoryDiv = document.getElementById('chatHistory');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `<strong>${isUser ? 'You' : 'Llama 3.2'}:</strong> ${content}`;
    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('sendBtn').disabled = show;
}

function showError(message) {
    const chatHistoryDiv = document.getElementById('chatHistory');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = `Error: ${message}`;
    chatHistoryDiv.appendChild(errorDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, true);
    chatHistory.push({role: 'user', content: message});

    // Clear input
    userInput.value = '';

    // Show loading
    showLoading(true);

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: chatHistory,
                model: document.getElementById('modelSelect').value,
                temperature: parseFloat(document.getElementById('temperature').value),
                max_tokens: parseInt(document.getElementById('maxTokens').value),
                system_prompt: document.getElementById('systemPrompt').value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            showError(data.error);
        } else {
            addMessage(data.response);
            chatHistory.push({role: 'assistant', content: data.response});
        }
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

function clearChat() {
    chatHistory = [];
    const chatHistoryDiv = document.getElementById('chatHistory');
    chatHistoryDiv.innerHTML = `
        <div class="message ai-message">
            <strong>Llama 3.2:</strong> Hello! I'm ready to help you with text generation. What would you like me to create?
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Llama 3.2 Text Generator initialized');
});
