document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages")
    const userInput = document.getElementById("user-input")
    const sendButton = document.getElementById("send-button")
    const suggestionChips = document.querySelectorAll(".suggestion-chip")
    const scrollToBottomBtn = document.getElementById("scroll-to-bottom")
    const cameraButton = document.getElementById("camera-button")
    const audioButton = document.getElementById("audio-button")
    const uploadButton = document.getElementById("upload-button")
    const cameraInput = document.getElementById("camera-input")
    const audioInput = document.getElementById("audio-input")
    const imageUpload = document.getElementById("image-upload")
  
    // Set current year in footer
    document.getElementById("current-year").textContent = new Date().getFullYear()
  
    scrollToBottom()
  
    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  
    chatMessages.addEventListener("scroll", () => {
      const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100
  
      if (isNearBottom) {
        scrollToBottomBtn.classList.add("hidden")
      } else {
        scrollToBottomBtn.classList.remove("hidden")
      }
    })
  
    scrollToBottomBtn.addEventListener("click", scrollToBottom)
  
    function addMessage(message, isUser = false) {
      const messageDiv = document.createElement("div")
      messageDiv.classList.add("message")
      messageDiv.classList.add(isUser ? "user" : "bot")
  
      const messageContent = document.createElement("div")
      messageContent.classList.add("message-content")
  
      const messageParagraph = document.createElement("p")
      messageParagraph.innerHTML = message.replace(/\n/g, "<br>").replace(/- /g, "• ")
  
      messageContent.appendChild(messageParagraph)
      messageDiv.appendChild(messageContent)
      chatMessages.appendChild(messageDiv)
  
      scrollToBottom()
    }
  
    function showTypingIndicator() {
      const indicatorDiv = document.createElement("div")
      indicatorDiv.classList.add("message", "bot")
      indicatorDiv.id = "typing-indicator"
  
      const indicatorContent = document.createElement("div")
      indicatorContent.classList.add("typing-indicator")
  
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span")
        indicatorContent.appendChild(dot)
      }
  
      indicatorDiv.appendChild(indicatorContent)
      chatMessages.appendChild(indicatorDiv)
      scrollToBottom()
    }
  
    function removeTypingIndicator() {
      const indicator = document.getElementById("typing-indicator")
      if (indicator) {
        indicator.remove()
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
      const message = userInput.value.trim()
  
      if (message) {
        addMessage(message, true)
        userInput.value = ""
        sendMessageToBackend(message)
      }
    }
  
    sendButton.addEventListener("click", handleSendMessage)
  
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handleSendMessage()
      }
    })
  
    suggestionChips.forEach((chip) => {
      chip.addEventListener("click", function () {
        const message = this.textContent
        userInput.value = message
        handleSendMessage()
      })
    })
  
    // Media input handlers
    cameraButton.addEventListener("click", () => {
      cameraInput.click()
    })
  
    audioButton.addEventListener("click", () => {
      audioInput.click()
    })
  
    uploadButton.addEventListener("click", () => {
      imageUpload.click()
    })
  
    // Handle file inputs
    cameraInput.addEventListener("change", handleFileInput)
    audioInput.addEventListener("change", handleFileInput)
    imageUpload.addEventListener("change", handleFileInput)
  
    function handleFileInput(e) {
      if (e.target.files.length > 0) {
        const file = e.target.files[0]
        const fileType = file.type.split("/")[0]
  
        // Here you would typically upload the file to your server
        // For now, just show a message that the file was received
        addMessage(`I've received your ${fileType} file: ${file.name}`, true)
  
        // You could implement file upload logic here
        // For demonstration, just show a response
        setTimeout(() => {
          if (fileType === "image") {
            addMessage("I can see the image you've shared. How can I help with this?", false)
          } else if (fileType === "audio") {
            addMessage("I've received your audio. Let me process what you're saying.", false)
          }
        }, 1000)
  
        // Reset the file input
        e.target.value = ""
      }
    }
  
    // Focus the input field when the page loads
    userInput.focus()
})