// document.addEventListener("DOMContentLoaded", () => {
//     const chatMessages = document.getElementById("chat-messages")
//     const userInput = document.getElementById("user-input")
//     const sendButton = document.getElementById("send-button")
//     const suggestionChips = document.querySelectorAll(".suggestion-chip")
//     const scrollToBottomBtn = document.getElementById("scroll-to-bottom")
  
//     // Initial scroll to bottom
//     scrollToBottom()
  
//     // Function to scroll to the bottom of the chat
//     function scrollToBottom() {
//       chatMessages.scrollTop = chatMessages.scrollHeight
//     }
  
//     // Show/hide scroll to bottom button based on scroll position
//     chatMessages.addEventListener("scroll", () => {
//       // Calculate if we're near the bottom (within 100px)
//       const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100
  
//       if (isNearBottom) {
//         scrollToBottomBtn.classList.add("hidden")
//       } else {
//         scrollToBottomBtn.classList.remove("hidden")
//       }
//     })
  
//     // Scroll to bottom when button is clicked
//     scrollToBottomBtn.addEventListener("click", scrollToBottom)
  
//     // Function to add a message to the chat
//     function addMessage(message, isUser = false) {
//       const messageDiv = document.createElement("div")
//       messageDiv.classList.add("message")
//       messageDiv.classList.add(isUser ? "user" : "bot")
  
//       const messageContent = document.createElement("div")
//       messageContent.classList.add("message-content")
  
//       const messageParagraph = document.createElement("p")
//       messageParagraph.textContent = message
  
//       messageContent.appendChild(messageParagraph)
//       messageDiv.appendChild(messageContent)
//       chatMessages.appendChild(messageDiv)
  
//       // Scroll to the bottom of the chat
//       scrollToBottom()
//     }
  
//     // Function to show typing indicator
//     function showTypingIndicator() {
//       const indicatorDiv = document.createElement("div")
//       indicatorDiv.classList.add("message", "bot")
//       indicatorDiv.id = "typing-indicator"
  
//       const indicatorContent = document.createElement("div")
//       indicatorContent.classList.add("typing-indicator")
  
//       for (let i = 0; i < 3; i++) {
//         const dot = document.createElement("span")
//         indicatorContent.appendChild(dot)
//       }
  
//       indicatorDiv.appendChild(indicatorContent)
//       chatMessages.appendChild(indicatorDiv)
//       scrollToBottom()
//     }
  
//     // Function to remove typing indicator
//     function removeTypingIndicator() {
//       const indicator = document.getElementById("typing-indicator")
//       if (indicator) {
//         indicator.remove()
//       }
//     }
  
//     // Function to send message to backend and get response
//     async function sendMessageToBackend(message) {
//       try {
//         showTypingIndicator()
  
//         // Simulate API call delay (replace with actual API call)
//         const response = await fetch("/api/chat", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ message: message }),
//         })
  
//         if (!response.ok) {
//           throw new Error("Network response was not ok")
//         }
  
//         const data = await response.json()
//         removeTypingIndicator()
  
//         // Add bot response to chat
//         addMessage(data.response, false)
//       } catch (error) {
//         console.error("Error:", error)
//         removeTypingIndicator()
  
//         // Show error message if API call fails
//         addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", false)
//       }
//     }
  
//     // Function to handle sending a message
//     function handleSendMessage() {
//       const message = userInput.value.trim()
  
//       if (message) {
//         // Add user message to chat
//         addMessage(message, true)
  
//         // Clear input field
//         userInput.value = ""
  
//         // Get response from backend
//         sendMessageToBackend(message)
//       }
//     }
  
//     // Event listener for send button
//     sendButton.addEventListener("click", handleSendMessage)
  
//     // Event listener for Enter key
//     userInput.addEventListener("keypress", (e) => {
//       if (e.key === "Enter") {
//         handleSendMessage()
//       }
//     })
  
//     // Event listeners for suggestion chips
//     suggestionChips.forEach((chip) => {
//       chip.addEventListener("click", function () {
//         const message = this.textContent
//         userInput.value = message
//         handleSendMessage()
//       })
//     })
  
//     // Focus input field on page load
//     userInput.focus()
  
//     // For demo purposes - simulate backend responses
//     // Remove this in production and use the actual backend
//     const backendUrl = "/api/chat"
  
//     // Override fetch for demo purposes
//     window.fetch = (url, options) =>
//       new Promise((resolve) => {
//         setTimeout(() => {
//           if (url === backendUrl) {
//             const requestData = JSON.parse(options.body)
//             const userMessage = requestData.message.toLowerCase()
  
//             let botResponse = "I'm not sure how to respond to that. Could you ask something about travel?"
  
//             if (userMessage.includes("paris")) {
//               botResponse =
//                 "The best time to visit Paris is from April to June or October to early November when the weather is mild and the crowds are smaller. You'll enjoy pleasant temperatures for exploring the city's beautiful streets and attractions."
//             } else if (userMessage.includes("tokyo")) {
//               botResponse =
//                 "Tokyo offers countless attractions! You can visit the historic Senso-ji Temple, experience the bustling Shibuya Crossing, explore the pop culture district of Akihabara, enjoy views from Tokyo Skytree, and relax in Shinjuku Gyoen National Garden."
//             } else if (userMessage.includes("budget") || userMessage.includes("tips")) {
//               botResponse =
//                 "For budget travel: 1) Book flights 2-3 months in advance, 2) Stay in hostels or use home-sharing services, 3) Eat where locals eat, 4) Use public transportation, 5) Look for free attractions and walking tours, and 6) Travel during shoulder seasons for better deals."
//             } else if (userMessage.includes("italy") || userMessage.includes("cuisine")) {
//               botResponse =
//                 "Italian cuisine varies by region! In Rome, try Carbonara and Cacio e Pepe. In Naples, authentic pizza is a must. Northern regions offer risotto and polenta dishes. Don't miss gelato, espresso, and local wines wherever you go!"
//             } else if (userMessage.includes("hello") || userMessage.includes("hi")) {
//               botResponse =
//                 "Hello! I'm your TravelBuddy. Where would you like to travel to? I can help with destination information, travel tips, or itinerary planning."
//             }
  
//             resolve({
//               ok: true,
//               json: () => Promise.resolve({ response: botResponse }),
//             })
//           }
//         }, 1500) // Simulate network delay
//       })
  
//     // Add some sample messages for demonstration
//     setTimeout(() => {
//       addMessage("Can you tell me about the best time to visit Japan?", true)
//       setTimeout(() => {
//         addMessage(
//           "The best time to visit Japan depends on what you want to experience. Spring (March to May) is popular for cherry blossoms, while autumn (September to November) offers beautiful fall foliage. Summer can be hot and humid but good for festivals, and winter is perfect for skiing and hot springs. If you want to avoid crowds, consider visiting during the shoulder seasons of late May-June or late September-October.",
//           false,
//         )
//       }, 1500)
//     }, 1000)
//   })
  
  

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
      messageParagraph.textContent = message;

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