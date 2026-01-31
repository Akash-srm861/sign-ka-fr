/**
 * Practice Page JavaScript
 * Handles webcam, sign detection, and practice logic
 */

class PracticeManager {
    constructor() {
        this.currentModule = null;
        this.signs = [];
        this.currentSignIndex = 0;
        this.sessionId = null;
        this.sessionStats = {
            attempts: 0,
            correct: 0
        };
        
        this.webcamStream = null;
        this.isDetecting = false;
        this.detectionInterval = null;
        
        this.init();
    }
    
    async init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = '../index.html';
            return;
        }
        
        // Get module from URL
        const params = new URLSearchParams(window.location.search);
        this.currentModule = params.get('module');
        
        if (!this.currentModule) {
            UI.showToast('No module selected', 'error');
            setTimeout(() => window.location.href = '../index.html', 2000);
            return;
        }
        
        // Load signs
        await this.loadSigns();
        
        // Initialize UI
        this.initializeUI();
        
        // Start session
        await this.startSession();
    }
    
    async loadSigns() {
        try {
            UI.showLoading();
            const userId = Auth.getUserId();
            const response = await fetch(API_ENDPOINTS.SIGNS.BY_CATEGORY(this.currentModule) + `?user_id=${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.signs = data.signs;
                this.renderSignList();
                this.loadSign(0);
            }
            
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            console.error('Failed to load signs:', error);
            UI.showToast('Failed to load signs', 'error');
        }
    }
    
    initializeUI() {
        // Module title
        const titles = {
            'alphabets': 'ASL Alphabet',
            'numbers': 'ASL Numbers',
            'words': 'Common Words'
        };
        
        document.getElementById('module-title').textContent = titles[this.currentModule] || 'Practice';
        document.getElementById('module-description').textContent = 
            `Practice ${this.signs.length} signs`;
        
        // Event listeners
        document.getElementById('start-camera-btn').addEventListener('click', () => this.startCamera());
        document.getElementById('stop-camera-btn').addEventListener('click', () => this.stopCamera());
        document.getElementById('check-sign-btn').addEventListener('click', () => this.checkSign());
        document.getElementById('skip-sign-btn').addEventListener('click', () => this.nextSign());
        document.getElementById('end-session-btn').addEventListener('click', () => this.endSession());
        document.getElementById('help-btn').addEventListener('click', () => this.showHelp());
        
        // Chatbot
        this.initChatbot();
    }
    
    renderSignList() {
        const signList = document.getElementById('sign-list');
        signList.innerHTML = '';
        
        this.signs.forEach((sign, index) => {
            const signItem = document.createElement('div');
            signItem.className = 'sign-item';
            signItem.innerHTML = `
                <span>${sign.name}</span>
                <i class="fas fa-circle"></i>
            `;
            signItem.addEventListener('click', () => this.loadSign(index));
            signList.appendChild(signItem);
        });
    }
    
    loadSign(index) {
        if (index < 0 || index >= this.signs.length) return;
        
        this.currentSignIndex = index;
        const sign = this.signs[index];
        
        // Update UI with sign letter and real ASL image
        const targetDisplay = document.getElementById('target-sign-display');
        
        // Create image element with fallback handling
        const imageHtml = sign.imageUrl ? `
            <img src="${sign.imageUrl}" 
                 alt="ASL sign for ${sign.name}" 
                 class="sign-image"
                 onerror="this.onerror=null; this.src='${sign.imageFallbacks?.[0] || ''}'; if(!this.src) this.parentElement.innerHTML='<div class=\\'sign-demo\\'><div class=\\'hand-icon\\'>✋</div><div class=\\'sign-instruction\\'>Make the &quot;${sign.name}&quot; sign</div></div>';">
        ` : `
            <div class="sign-demo">
                <div class="hand-icon">✋</div>
                <div class="sign-instruction">Make the "${sign.name}" sign</div>
            </div>
        `;
        
        targetDisplay.innerHTML = `
            <div class="sign-display-content">
                <span class="sign-letter">${sign.name}</span>
                ${imageHtml}
            </div>
        `;
        document.getElementById('sign-hint').textContent = sign.hint;
        
        // Update sign list
        document.querySelectorAll('.sign-item').forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });
    }
    
    async startSession() {
        try {
            const data = await Auth.authenticatedRequest(
                API_ENDPOINTS.SESSION.START,
                {
                    method: 'POST',
                    body: JSON.stringify({ category: this.currentModule })
                }
            );
            
            if (data.success) {
                this.sessionId = data.session.id;
            }
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    }
    
    async endSession() {
        if (!this.sessionId) {
            window.location.href = '../index.html';
            return;
        }
        
        try {
            await Auth.authenticatedRequest(
                API_ENDPOINTS.SESSION.END(this.sessionId),
                { method: 'POST' }
            );
            
            this.stopCamera();
            UI.showToast('Session ended', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } catch (error) {
            console.error('Failed to end session:', error);
            window.location.href = '../index.html';
        }
    }
    
    async startCamera() {
        try {
            this.webcamStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            });
            
            const video = document.getElementById('webcam');
            video.srcObject = this.webcamStream;
            
            // Update UI
            document.getElementById('start-camera-btn').style.display = 'none';
            document.getElementById('stop-camera-btn').style.display = 'inline-flex';
            document.getElementById('check-sign-btn').style.display = 'inline-flex';
            
            UI.showToast('Camera started', 'success');
            
            // Start continuous detection
            this.startContinuousDetection();
        } catch (error) {
            console.error('Camera error:', error);
            UI.showToast('Failed to access camera', 'error');
        }
    }
    
    stopCamera() {
        if (this.webcamStream) {
            this.webcamStream.getTracks().forEach(track => track.stop());
            this.webcamStream = null;
        }
        
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        document.getElementById('start-camera-btn').style.display = 'inline-flex';
        document.getElementById('stop-camera-btn').style.display = 'none';
        document.getElementById('check-sign-btn').style.display = 'none';
    }
    
    startContinuousDetection() {
        // Detect every 500ms for real-time feedback and automatic validation
        this.detectionInterval = setInterval(() => {
            this.detectSign(true);
        }, 500);
    }
    
    async detectSign(showFeedback = true) {
        if (this.isDetecting) return;
        
        const video = document.getElementById('webcam');
        if (!video.srcObject || !this.signs || this.signs.length === 0) return;
        
        try {
            this.isDetecting = true;
            
            // Capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Send to API
            const currentSign = this.signs[this.currentSignIndex];
            if (!currentSign) {
                console.warn('No current sign available');
                this.isDetecting = false;
                return;
            }
            const response = await fetch(API_ENDPOINTS.DETECT.SIGN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: imageData,
                    target_sign: currentSign.name
                })
            });
            
            const data = await response.json();
            
            // Draw landmarks on canvas overlay
            this.drawLandmarks(data);
            
            if (data.success && data.hands_detected) {
                // Update detection info
                document.getElementById('hands-detected').textContent = data.num_hands || 1;
                document.getElementById('confidence').textContent = 
                    Math.round((data.classification?.confidence || 0) * 100) + '%';
                document.getElementById('prediction').textContent = 
                    data.classification?.prediction || '-';
                
                // Show feedback for both correct AND incorrect signs
                if (showFeedback && data.classification && data.classification.feedback) {
                    await this.showFeedback(
                        data.classification.is_correct,
                        data.classification.feedback
                    );
                }
            } else {
                document.getElementById('hands-detected').textContent = '0';
                document.getElementById('confidence').textContent = '0%';
                document.getElementById('prediction').textContent = '-';
            }
            
        } catch (error) {
            console.error('Detection error:', error);
        } finally {
            this.isDetecting = false;
        }
    }
    
    async checkSign() {
        await this.detectSign(true);
    }
    
    async showFeedback(isCorrect, feedbackData) {
        const overlay = document.getElementById('feedback-overlay');
        const text = overlay.querySelector('.feedback-text');
        
        overlay.className = 'feedback-overlay active ' + (isCorrect ? 'correct' : 'incorrect');
        text.textContent = feedbackData.message;
        
        // Update stats
        this.sessionStats.attempts++;
        if (isCorrect) {
            this.sessionStats.correct++;
        }
        
        this.updateSessionStats();
        
        // Record attempt
        await this.recordAttempt(isCorrect);
        
        // Auto-advance if correct
        if (isCorrect) {
            setTimeout(() => {
                overlay.classList.remove('active');
                this.nextSign();
            }, 2000);
        } else {
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 2000);
        }
    }
    
    async recordAttempt(isCorrect) {
        const currentSign = this.signs[this.currentSignIndex];
        
        try {
            await Auth.authenticatedRequest(
                API_ENDPOINTS.PROGRESS.RECORD,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        category: this.currentModule,
                        sign_name: currentSign.name,
                        correct: isCorrect,
                        session_id: this.sessionId
                    })
                }
            );
        } catch (error) {
            console.error('Failed to record attempt:', error);
        }
    }
    
    updateSessionStats() {
        document.getElementById('session-attempts').textContent = this.sessionStats.attempts;
        document.getElementById('session-correct').textContent = this.sessionStats.correct;
        
        const accuracy = this.sessionStats.attempts > 0
            ? Math.round((this.sessionStats.correct / this.sessionStats.attempts) * 100)
            : 0;
        document.getElementById('session-accuracy').textContent = accuracy + '%';
    }
    
    nextSign() {
        if (this.currentSignIndex < this.signs.length - 1) {
            this.loadSign(this.currentSignIndex + 1);
        } else {
            UI.showToast('Module completed!', 'success');
            this.endSession();
        }
    }
    
    showHelp() {
        const currentSign = this.signs[this.currentSignIndex];
        const chatPanel = document.getElementById('chatbot-panel');
        chatPanel.classList.add('active');
        
        // Send help message to chatbot
        this.sendChatMessage(`How do I sign ${currentSign.name}?`);
    }
    
    initChatbot() {
        const form = document.getElementById('chatbot-form');
        const toggleBtn = document.getElementById('toggle-chatbot');
        const floatingBtn = document.getElementById('floating-chat-btn');
        const panel = document.getElementById('chatbot-panel');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('chatbot-input');
            const message = input.value.trim();
            
            if (message) {
                await this.sendChatMessage(message);
                input.value = '';
            }
        });
        
        toggleBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });
        
        floatingBtn.addEventListener('click', () => {
            panel.classList.add('active');
        });
    }
    
    async sendChatMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user';
        userMsg.innerHTML = `<p>${message}</p>`;
        messagesContainer.appendChild(userMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        try {
            // Get user ID from Auth
            const userId = Auth.getCurrentUserId();
            
            // Send to API (will save to Supabase if user logged in)
            const response = await fetch(API_ENDPOINTS.CHATBOT.MESSAGE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    user_id: userId  // Include user_id to save history to Supabase
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Add bot response with optional image
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-message bot';
                
                let messageHtml = `<p>${data.response}</p>`;
                
                // If response includes an image (for letter signs), show it
                if (data.image && data.letter) {
                    messageHtml += `
                        <div class="chat-image">
                            <img src="${data.image}" 
                                 alt="Sign for ${data.letter}" 
                                 style="max-width: 200px; border-radius: 8px; margin-top: 10px;"
                                 onerror="this.style.display='none'">
                        </div>
                    `;
                }
                
                botMsg.innerHTML = messageHtml;
                messagesContainer.appendChild(botMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Chat error:', error);
        }
    }

    drawLandmarks(data) {
        const canvas = document.getElementById('canvas-overlay');
        const video = document.getElementById('webcam');
        
        if (!canvas || !video) return;
        
        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // If no hands detected, clear and return
        if (!data.success || !data.hands_detected || !data.landmarks) {
            return;
        }
        
        // Draw each hand's landmarks
        data.landmarks.forEach(handLandmarks => {
            // Draw connections (green lines)
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            
            // Hand connections (MediaPipe hand model)
            const connections = [
                [0,1],[1,2],[2,3],[3,4], // Thumb
                [0,5],[5,6],[6,7],[7,8], // Index
                [0,9],[9,10],[10,11],[11,12], // Middle
                [0,13],[13,14],[14,15],[15,16], // Ring
                [0,17],[17,18],[18,19],[19,20], // Pinky
                [5,9],[9,13],[13,17] // Palm
            ];
            
            connections.forEach(([start, end]) => {
                if (handLandmarks[start] && handLandmarks[end]) {
                    ctx.beginPath();
                    ctx.moveTo(
                        handLandmarks[start].x * canvas.width,
                        handLandmarks[start].y * canvas.height
                    );
                    ctx.lineTo(
                        handLandmarks[end].x * canvas.width,
                        handLandmarks[end].y * canvas.height
                    );
                    ctx.stroke();
                }
            });
            
            // Draw landmarks (green dots)
            ctx.fillStyle = '#00FF00';
            handLandmarks.forEach(landmark => {
                ctx.beginPath();
                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    5, 0, 2 * Math.PI
                );
                ctx.fill();
            });
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PracticeManager();
});
