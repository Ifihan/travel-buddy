document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.getElementById("chat-messages");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const scrollToBottomBtn = document.getElementById("scroll-to-bottom");
    const cameraButton = document.getElementById("camera-button");
    const uploadButton = document.getElementById("upload-button");
    const imageUpload = document.getElementById("image-upload");
    const microphoneButton = document.getElementById("microphone-button");
    
    // Image handling elements
    const cameraModal = document.getElementById("camera-modal");
    const cameraPreview = document.getElementById("camera-preview");
    const cameraCanvas = document.getElementById("camera-canvas");
    const captureButton = document.getElementById("capture-button");
    const closeCamera = document.getElementById("close-camera");
    const previewContainer = document.getElementById("preview-container");
    const previewItems = document.getElementById("preview-items");
    const imagePrompt = document.getElementById("image-prompt");

    // Audio recording elements
    const inputWaveform = document.getElementById("input-waveform");

    let mediaStream = null;
    let currentFiles = [];
    
    // Audio recording variables
    let audioRecorder = null;
    let audioChunks = [];
    let recordingStartTime = 0;
    let isRecording = false;
    let audioContext = null;
    let audioAnalyser = null;
    let waveformBars = [];
    let animationFrame = null;

    // Initialize footer year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // Create waveform bars for audio visualization in the input field
    function createInputWaveform() {
        inputWaveform.innerHTML = '';
        waveformBars = [];
        // Create 15 bars for the waveform
        for (let i = 0; i < 15; i++) {
            const bar = document.createElement("div");
            bar.className = "waveform-bar";
            // Random animation delay
            bar.style.animationDelay = `${Math.random() * 0.5}s`;
            inputWaveform.appendChild(bar);
            waveformBars.push(bar);
        }
    }

    // Update waveform visualization during recording
    function updateWaveform(audioLevel) {
        if (!isRecording) return;
        
        waveformBars.forEach(bar => {
            // Get a random value influenced by the audio level
            const randomHeight = Math.floor(audioLevel * 20) + Math.floor(Math.random() * 10);
            // Clamp the height between 5px and 25px
            const height = Math.max(5, Math.min(25, randomHeight));
            bar.style.height = height + "px";
        });
    }

    // Start audio recording
    async function startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up audio context and analyzer
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            audioAnalyser = audioContext.createAnalyser();
            audioAnalyser.fftSize = 256;
            source.connect(audioAnalyser);
            
            // Create recorder
            audioRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            audioRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            audioRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                transcribeAudio(audioBlob);
                
                // Clean up recording resources
                if (audioContext) {
                    audioContext.close().catch(console.error);
                    audioContext = null;
                    audioAnalyser = null;
                }
                
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            };
            
            // Start recording
            audioRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            
            // Show recording state
            microphoneButton.classList.add("recording");
            sendButton.classList.add("stop-recording");
            
            // Change send button icon to stop icon
            sendButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                    <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
            `;
            
            // Hide input and show waveform
            userInput.style.opacity = "0";
            createInputWaveform();
            inputWaveform.classList.remove("hidden");
            
            // Start updating the waveform
            analyzeAudio();
            
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    }
    
    // Analyze audio for visualization
    function analyzeAudio() {
        if (!isRecording || !audioAnalyser) return;
        
        const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
        audioAnalyser.getByteFrequencyData(dataArray);
        
        // Calculate an average volume level from the frequency data
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length / 255; // Normalize to 0-1
        
        updateWaveform(average);
        
        // Continue the animation loop
        animationFrame = requestAnimationFrame(analyzeAudio);
    }
    
    // Stop recording
    function stopRecording() {
        if (!audioRecorder || !isRecording) return;
        
        audioRecorder.stop();
        isRecording = false;
        
        // Update UI
        microphoneButton.classList.remove("recording");
        sendButton.classList.remove("stop-recording");
        
        // Change send button icon back to send icon
        sendButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
                <path d="m22 2-7 20-4-9-9-4Z"></path>
                <path d="M22 2 11 13"></path>
            </svg>
        `;
        
        // Hide waveform and show input
        inputWaveform.classList.add("hidden");
        userInput.style.opacity = "1";
    }
    
    async function transcribeAudio(blob) {
        userInput.value = "Transcribing...";
        userInput.disabled = true;
        try {
            const formData = new FormData();
            formData.append("audio", blob, "recording.webm");

            const response = await fetch("/transcribe", {
                method: "POST",
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const data = await response.json();
            const transcribedText = data.text;

            // Put transcribed text in input field instead of sending immediately
            userInput.value = transcribedText;
            userInput.disabled = false;
            userInput.focus();
            
        } catch (error) {
            console.error("Error transcribing audio:", error);
            userInput.value = "";
            userInput.disabled = false;
            // Show error message in chat instead of in input field
            addMessage("Sorry, something went wrong with the transcription.", false);
        }
    }

    // Add message to chat - Fixed to properly handle user/bot message alignment
    function addMessage(text, isUser = false, files = []) {
        const messageDiv = document.createElement("div");
        messageDiv.className = isUser ? "message user" : "message bot";
        
        const messageContent = document.createElement("div");
        messageContent.className = "message-content";
        
        if (text) {
            const paragraph = document.createElement("p");
            paragraph.textContent = text;
            messageContent.appendChild(paragraph);
        }
        
        // Add any images
        files.forEach(file => {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.className = "message-image";
            img.alt = "Uploaded image";
            messageContent.appendChild(img);
        });
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        scrollToBottom();
        
        return messageDiv;
    }

    // Add bot typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "message bot";
        typingDiv.id = "typing-indicator";
        
        const indicatorContent = document.createElement("div");
        indicatorContent.className = "typing-indicator";
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("span");
            indicatorContent.appendChild(dot);
        }
        
        typingDiv.appendChild(indicatorContent);
        chatMessages.appendChild(typingDiv);
        
        scrollToBottom();
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById("typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Fixed getBotResponse implementation to prevent duplicate messages
    function getBotResponse(userText) {
        // No longer adding user message here since it's already added in sendMessage
        // This was causing the duplication
        
        showTypingIndicator();

        const formData = new FormData();
        formData.append("message", userText);

        fetch("/api/chat", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            removeTypingIndicator();
            // Display the bot response
            addMessage(data.response, false);
            scrollToBottom();
        })
        .catch(error => {
            console.error("Error fetching bot response:", error);
            removeTypingIndicator();
            addMessage("Sorry, something went wrong.", false);
            scrollToBottom();
        });
    }

    // Handle sending a message
    function sendMessage() {
        // If recording, stop recording instead of sending
        if (isRecording) {
            stopRecording();
            return;
        }
        
        const message = userInput.value.trim();
        const files = [...currentFiles];
        
        // Don't send empty messages
        if (message === "" && files.length === 0) return;
        
        // Add user message to chat
        addMessage(message, true, files);
        
        // Clear input and files
        userInput.value = "";
        currentFiles = [];
        previewContainer.classList.add("hidden");
        previewItems.innerHTML = "";
        
        // Get bot response
        getBotResponse(message);
    }

    // Scroll to bottom of chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Check if scroll to bottom button should be visible
    function toggleScrollButton() {
        if (chatMessages.scrollTop < chatMessages.scrollHeight - chatMessages.offsetHeight - 100) {
            scrollToBottomBtn.classList.remove("hidden");
        } else {
            scrollToBottomBtn.classList.add("hidden");
        }
    }

    // Camera functions
    async function openCamera() {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = mediaStream;
            cameraModal.classList.remove("hidden");
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Could not access camera. Please check permissions.");
        }
    }

    function closeMediaStream() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }

    function captureImage() {
        const context = cameraCanvas.getContext("2d");
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;
        context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // Convert to file
        cameraCanvas.toBlob(blob => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            addImagePreview(file);
            
            // Close camera
            cameraModal.classList.add("hidden");
            closeMediaStream();
        }, "image/jpeg");
    }

    // Handle image upload
    function handleImageUpload(event) {
        const files = event.target.files;
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                addImagePreview(files[i]);
            }
        }
    }

    // Add image preview
    function addImagePreview(file) {
        currentFiles.push(file);
        
        // Create preview element
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";
        
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = "Image preview";
        
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-preview";
        deleteButton.innerHTML = "×";
        deleteButton.addEventListener("click", (e) => {
            e.preventDefault();
            const index = currentFiles.indexOf(file);
            if (index !== -1) {
                currentFiles.splice(index, 1);
            }
            previewItem.remove();
            
            if (currentFiles.length === 0) {
                previewContainer.classList.add("hidden");
            }
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(deleteButton);
        previewItems.appendChild(previewItem);
        
        // Show container
        previewContainer.classList.remove("hidden");
    }

    // Event listeners
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
    
    sendButton.addEventListener("click", sendMessage);
    
    chatMessages.addEventListener("scroll", toggleScrollButton);
    
    scrollToBottomBtn.addEventListener("click", scrollToBottom);
    
    suggestionChips.forEach(chip => {
        chip.addEventListener("click", () => {
            userInput.value = chip.textContent;
            sendMessage();
        });
    });
    
    cameraButton.addEventListener("click", openCamera);
    
    closeCamera.addEventListener("click", () => {
        cameraModal.classList.add("hidden");
        closeMediaStream();
    });
    
    captureButton.addEventListener("click", captureImage);
    
    uploadButton.addEventListener("click", () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener("change", handleImageUpload);
    
    // Microphone button events
    microphoneButton.addEventListener("click", () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });

    // Initialize
    createInputWaveform();
});