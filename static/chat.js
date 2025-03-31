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
    const audioModal = document.getElementById("audio-modal");
    const waveContainer = document.getElementById("wave-container");
    const recordingTime = document.getElementById("recording-time");
    const stopRecordingButton = document.getElementById("stop-recording");
    const saveRecordingButton = document.getElementById("save-recording");

    let mediaStream = null;
    let currentFiles = [];
    
    // Audio recording variables
    let audioRecorder = null;
    let audioChunks = [];
    let recordingStartTime = 0;
    let recordingTimer = null;
    let audioBlob = null;
    let isRecording = false;
    let audioContext = null;
    let audioAnalyser = null;
    let waveformBars = [];

    // Initialize footer year
    document.getElementById("current-year").textContent = new Date().getFullYear();

    // Create waveform bars for audio visualization
    function createWaveform() {
        waveContainer.innerHTML = '';
        waveformBars = [];
        // Create 20 bars for the waveform
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement("div");
            bar.className = "wave-bar";
            // Random initial height between 10px and 60px
            bar.style.height = Math.floor(Math.random() * 50 + 10) + "px";
            waveContainer.appendChild(bar);
            waveformBars.push(bar);
        }
    }

    // Update waveform visualization during recording
    function updateWaveform(audioLevel) {
        if (!isRecording) return;
        
        waveformBars.forEach(bar => {
            // Get a random value influenced by the audio level
            const randomHeight = Math.floor(audioLevel * 100) + Math.floor(Math.random() * 20);
            // Clamp the height between 5px and 80px
            const height = Math.max(5, Math.min(80, randomHeight));
            bar.style.height = height + "px";
        });
    }

    // Format recording time (mm:ss)
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update recording timer
    function updateRecordingTime() {
        if (!recordingStartTime) return;
        
        const elapsedTime = Date.now() - recordingStartTime;
        recordingTime.textContent = formatTime(elapsedTime);
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
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            };
            
            // Start recording
            audioRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();
            
            // Show recording state
            microphoneButton.classList.add("recording");
            audioModal.classList.remove("hidden");
            
            // Create and start visualization
            createWaveform();
            recordingTimer = setInterval(updateRecordingTime, 1000);
            
            // Start updating the waveform
            requestAnimationFrame(analyzeAudio);
            
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
        requestAnimationFrame(analyzeAudio);
    }
    
    // Stop recording
    function stopRecording() {
        if (!audioRecorder || !isRecording) return;
        
        audioRecorder.stop();
        isRecording = false;
        
        // Clean up
        clearInterval(recordingTimer);
        recordingTimer = null;
        recordingStartTime = 0;
        
        // Update UI
        microphoneButton.classList.remove("recording");
    }
    
    // Transcribe audio (placeholder - would use a real service in production)
    async function transcribeAudio(blob) {
        // This is a placeholder for actual transcription
        // In a real app, you'd send the audio to a server or API
        // For now, we'll simulate a simple transcription

        // Create a loading message
        userInput.value = "Transcribing...";
        userInput.disabled = true;
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Sample simulated response
        // In production, replace with actual API call 
        const sampleResponses = [
            "I'd like to know about the best beaches in Thailand.",
            "What are some budget-friendly hotels in Paris?",
            "Tell me about the local cuisine in Italy.",
            "What's the best time to visit Tokyo?",
            "I need recommendations for a family trip to Orlando."
        ];
        
        const transcribedText = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        
        // Update UI with transcribed text
        userInput.value = transcribedText;
        userInput.disabled = false;
        userInput.focus();
    }
    
    // Save recording and transcribe
    function saveRecording() {
        if (!audioBlob) return;
        
        // Close modal
        audioModal.classList.add("hidden");
        
        // Transcribe audio
        transcribeAudio(audioBlob);
        
        // Clean up recording resources
        if (audioContext) {
            audioContext.close().catch(console.error);
            audioContext = null;
            audioAnalyser = null;
        }
    }
    
    // Cancel recording
    function cancelRecording() {
        stopRecording();
        audioModal.classList.add("hidden");
        
        // Clean up
        audioBlob = null;
        audioChunks = [];
        
        if (audioContext) {
            audioContext.close().catch(console.error);
            audioContext = null;
            audioAnalyser = null;
        }
    }

    // Add message to chat
    function addMessage(text, isUser = false, files = []) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isUser ? "user" : "bot"}`;
        
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

    // Simulate bot response
    async function getBotResponse(userMessage) {
        // In a real app, this would call an API
        // For now, we'll just simulate a response
        
        showTypingIndicator();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        removeTypingIndicator();
        
        // Simple responses based on keywords
        if (userMessage.toLowerCase().includes("paris")) {
            return "Paris is beautiful in the spring! The best time to visit is April to June or September to October when the weather is pleasant and crowds are smaller.";
        } else if (userMessage.toLowerCase().includes("tokyo")) {
            return "Tokyo is fascinating any time of year! For cherry blossoms, visit in late March to early April. For autumn colors, go in November. Summer can be very hot and humid.";
        } else if (userMessage.toLowerCase().includes("budget") || userMessage.toLowerCase().includes("cheap")) {
            return "For budget travel, consider visiting during shoulder seasons, staying in hostels or vacation rentals, using public transportation, and eating where locals eat. Many cities also offer free walking tours!";
        } else if (userMessage.toLowerCase().includes("food") || userMessage.toLowerCase().includes("cuisine") || userMessage.toLowerCase().includes("italy")) {
            return "Italian cuisine varies by region! In the north, expect rich dishes with butter and cheese. Central Italy features simpler pasta dishes and the south offers seafood, olive oil, and tomato-based sauces. Don't miss trying local specialties wherever you go!";
        } else if (userMessage.toLowerCase().includes("beach") || userMessage.toLowerCase().includes("thailand")) {
            return "Thailand has some of the world's most beautiful beaches! The best time to visit is during the dry season from November to April. Popular beach destinations include Phuket, Koh Samui, and Krabi.";
        } else {
            return "That sounds like an interesting destination! When are you planning to travel? I can help with specific recommendations for attractions, accommodations, and local tips.";
        }
    }

    // Handle sending a message
    async function sendMessage() {
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
        const response = await getBotResponse(message);
        addMessage(response, false);
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
            audioModal.classList.remove("hidden");
        } else {
            startRecording();
        }
    });
    
    stopRecordingButton.addEventListener("click", cancelRecording);
    
    saveRecordingButton.addEventListener("click", saveRecording);

    // Initialize
    createWaveform();
});