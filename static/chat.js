document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const scrollToBottomBtn = document.getElementById("scroll-to-bottom");
    const cameraButton = document.getElementById("camera-button");
    const uploadButton = document.getElementById("upload-button");
    const imageUpload = document.getElementById("image-upload");
    
    // Image handling elements
    const cameraModal = document.getElementById("camera-modal");
    const cameraPreview = document.getElementById("camera-preview");
    const cameraCanvas = document.getElementById("camera-canvas");
    const captureButton = document.getElementById("capture-button");
    const closeCamera = document.getElementById("close-camera");
    const previewContainer = document.getElementById("preview-container");
    const previewItems = document.getElementById("preview-items");
    const imagePrompt = document.getElementById("image-prompt");

    let mediaStream = null;
    let currentFiles = [];

    // Initialize footer year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // Scroll handling
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatMessages.addEventListener("scroll", () => {
        const isNearBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight < 100;
        scrollToBottomBtn.classList.toggle("hidden", isNearBottom);
    });

    scrollToBottomBtn.addEventListener("click", scrollToBottom);

    // Message creation with separated media/text
    function addMessage(content, isUser = false, isImage = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.classList.add(isUser ? "user" : "bot");

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");

        if (isImage) {
            const container = document.createElement("div");
            container.className = "separated-content";
            
            // Media container
            const mediaContainer = document.createElement("div");
            mediaContainer.className = "media-container";
            
            const img = document.createElement("img");
            img.src = content.url;
            img.alt = "Uploaded image";
            img.className = "message-image";
            mediaContainer.appendChild(img);
            container.appendChild(mediaContainer);
            
            // Text container if available
            if (content.text) {
                const textContainer = document.createElement("div");
                textContainer.className = "text-container";
                textContainer.textContent = content.text;
                container.appendChild(textContainer);
            }
            
            messageContent.appendChild(container);
        } else {
            const formattedMessage = content
                .replace(/\n/g, "<br>")
                .replace(/- /g, "• ");
            messageContent.innerHTML = `<p>${formattedMessage}</p>`;
        }

        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    // Typing indicators
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
        if (indicator) indicator.remove();
    }

    // Camera handling
    async function startCamera() {
        try {
            // Clear previous previews when opening camera
            currentFiles = [];
            previewItems.innerHTML = '';
            previewContainer.classList.add("hidden");
            
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            cameraPreview.srcObject = mediaStream;
            cameraModal.classList.remove("hidden");
        } catch (error) {
            console.error("Camera error:", error);
            addMessage("Couldn't access camera. Please enable permissions.", false);
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        cameraModal.classList.add("hidden");
    }

    function capturePicture() {
        const context = cameraCanvas.getContext("2d");
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;
        context.drawImage(cameraPreview, 0, 0);

        cameraCanvas.toBlob(blob => {
            const file = new File([blob], `capture-${Date.now()}.jpg`, {
                type: "image/jpeg"
            });
            handleImageFile(file);
            stopCamera();
        }, "image/jpeg", 0.8);
    }

    // File validation and handling
    function validateFile(file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxSize = 5 * 1024 * 1024;

        if (!validTypes.includes(file.type)) {
            addMessage("Only JPG, PNG, and WEBP files are allowed", false);
            return false;
        }

        if (file.size > maxSize) {
            addMessage("Image size must be less than 5MB", false);
            return false;
        }

        return true;
    }

    function handleImageFile(file) {
        if (!validateFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewId = `preview-${Date.now()}`;
            const previewItem = document.createElement("div");
            previewItem.className = "preview-item";
            previewItem.id = previewId;
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="delete-preview" onclick="removePreview('${previewId}')">&times;</button>
            `;
            previewItems.appendChild(previewItem);
            previewContainer.classList.remove("hidden");

            currentFiles.push({
                id: previewId,
                file: file,
                url: e.target.result
            });
        };
        reader.readAsDataURL(file);
    }

    window.removePreview = (previewId) => {
        const index = currentFiles.findIndex(f => f.id === previewId);
        if (index > -1) {
            currentFiles.splice(index, 1);
            document.getElementById(previewId)?.remove();
        }
        if (currentFiles.length === 0) {
            previewContainer.classList.add("hidden");
        }
    };

    // Message sending handler
    async function handleSendMessage() {
        const text = userInput.value.trim();
        const prompt = imagePrompt.value.trim();

        if (text || currentFiles.length > 0) {
            const formData = new FormData();

            // Add visual previews
            if (text) addMessage(text, true);
            currentFiles.forEach(file => {
                addMessage({
                    url: file.url,
                    text: prompt
                }, true, true);
            });

            // Build form data
            if (text) formData.append("message", text);
            if (prompt) formData.append("prompt", prompt);
            currentFiles.forEach(file => {
                formData.append("images", file.file);
            });

            // Clear inputs
            userInput.value = "";
            imagePrompt.value = "";
            previewContainer.classList.add("hidden");
            currentFiles = [];

            try {
                showTypingIndicator();
                const response = await fetch("/api/chat", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) throw new Error("API response error");
                const data = await response.json();
                
                removeTypingIndicator();
                addMessage(data.response, false);
            } catch (error) {
                console.error("Error:", error);
                removeTypingIndicator();
                addMessage("Sorry, I'm having trouble processing that.", false);
            }
        }
    }

    // Event listeners
    sendButton.addEventListener("click", handleSendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    suggestionChips.forEach(chip => {
        chip.addEventListener("click", function() {
            userInput.value = this.textContent;
            handleSendMessage();
        });
    });

    // Fixed upload button handler
    uploadButton.addEventListener("click", () => {
        imageUpload.click();
    });

    cameraButton.addEventListener("click", startCamera);
    captureButton.addEventListener("click", capturePicture);
    closeCamera.addEventListener("click", stopCamera);

    imageUpload.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
                if (validateFile(file)) {
                    handleImageFile(file);
                }
            });
            e.target.value = "";
        }
    });

    // Initial focus
    userInput.focus();
});