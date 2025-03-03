document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const scrollToBottomBtn = document.getElementById("scroll-to-bottom");

    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("current-year").textContent = new Date().getFullYear();
    });
    
    scrollToBottom();
  
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    chatMessages.addEventListener("scroll", () => {
        const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;
  
        if (isNearBottom) {
            scrollToBottomBtn.classList.add("hidden");
        } else {
            scrollToBottomBtn.classList.remove("hidden");
        }
    });
  
    scrollToBottomBtn.addEventListener("click", scrollToBottom);
  
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add(isUser ? "user" : "bot");
  
        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
  
        const messageParagraph = document.createElement("p");
        // messageParagraph.textContent = message;
        messageParagraph.innerHTML = message.replace(/\n/g, '<br>').replace(/- /g, '• ');
  
        messageContent.appendChild(messageParagraph);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
  
        scrollToBottom();
    }
  
    function showTypingIndicator() {
        const indicatorDiv = document.createElement("div");
        indicatorDiv.classList.add("message", "bot");
        indicatorDiv.id = "typing-indicator";
  
        const indicatorContent = document.createElement("div");
        indicatorContent.classList.add("typing-indicator");
  
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("span");
            indicatorContent.appendChild(dot);
        }
  
        indicatorDiv.appendChild(indicatorContent);
        chatMessages.appendChild(indicatorDiv);
        scrollToBottom();
    }
  
    function removeTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.remove();
        }
    }
  
    async function sendMessageToBackend(message) {
        try {
            showTypingIndicator();
  
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            });
  
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
  
            const data = await response.json();
            removeTypingIndicator();
  
            addMessage(data.response, false);
        } catch (error) {
            console.error("Error:", error);
            removeTypingIndicator();
  
            addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", false);
        }
    }
  
    function handleSendMessage() {
        const message = userInput.value.trim();
  
        if (message) {
            addMessage(message, true);
  
            userInput.value = "";
  
            sendMessageToBackend(message);
        }
    }
  
    sendButton.addEventListener("click", handleSendMessage);
  
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });
  
    suggestionChips.forEach((chip) => {
        chip.addEventListener("click", function () {
            const message = this.textContent;
            userInput.value = message;
            handleSendMessage();
        });
    });
  
    userInput.focus();
  
  });