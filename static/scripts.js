document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const suggestionChips = document.querySelectorAll(".suggestion-chip");
  const scrollToBottomBtn = document.getElementById("scroll-to-bottom");

  // Initial scroll to bottom
  scrollToBottom();

  // Function to scroll to the bottom of the chat
  function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show/hide scroll to bottom button based on scroll position
  chatMessages.addEventListener("scroll", () => {
      // Calculate if we're near the bottom (within 100px)
      const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;

      if (isNearBottom) {
          scrollToBottomBtn.classList.add("hidden");
      } else {
          scrollToBottomBtn.classList.remove("hidden");
      }
  });

  // Scroll to bottom when button is clicked
  scrollToBottomBtn.addEventListener("click", scrollToBottom);

  // Function to add a message to the chat
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

      // Scroll to the bottom of the chat
      scrollToBottom();
  }

  // Function to show typing indicator
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

  // Function to remove typing indicator
  function removeTypingIndicator() {
      const indicator = document.getElementById("typing-indicator");
      if (indicator) {
          indicator.remove();
      }
  }

  // Function to send message to backend and get response
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

          // Add bot response to chat
          addMessage(data.response, false);
      } catch (error) {
          console.error("Error:", error);
          removeTypingIndicator();

          // Show error message if API call fails
          addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", false);
      }
  }

  // Function to handle sending a message
  function handleSendMessage() {
      const message = userInput.value.trim();

      if (message) {
          // Add user message to chat
          addMessage(message, true);

          // Clear input field
          userInput.value = "";

          // Get response from backend
          sendMessageToBackend(message);
      }
  }

  // Event listener for send button
  sendButton.addEventListener("click", handleSendMessage);

  // Event listener for Enter key
  userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
          handleSendMessage();
      }
  });

  // Event listeners for suggestion chips
  suggestionChips.forEach((chip) => {
      chip.addEventListener("click", function () {
          const message = this.textContent;
          userInput.value = message;
          handleSendMessage();
      });
  });

  // Focus input field on page load
  userInput.focus();

});