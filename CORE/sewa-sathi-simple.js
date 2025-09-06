// Sewa Sathi Simple AI Assistant
class SewaSathiSimple {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isOpen = false;
        this.settings = {
            voiceCommands: true,
            tts: true,
            speechRate: 1.0,
            darkMode: false,
            highContrast: false,
            fontSize: 100
        };
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadSettings();
    }

    setupElements() {
        this.circle = document.getElementById('sewa-sathi-circle');
        this.messenger = document.getElementById('sewa-sathi-messenger');
        this.closeBtn = document.getElementById('messenger-close');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-message-btn');
        this.voiceBtn = document.getElementById('voice-input-btn');
        this.voiceStatus = document.getElementById('voice-status');
        this.chatMessages = document.getElementById('chat-messages');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.settingsClose = document.getElementById('settings-close');
    }

    setupEventListeners() {
        // Circle button click
        this.circle.addEventListener('click', () => {
            this.toggleMessenger();
        });

        // Close messenger
        this.closeBtn.addEventListener('click', () => {
            this.closeMessenger();
        });

        // Send message
        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in input
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Voice input
        this.voiceBtn.addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Settings
        this.settingsBtn.addEventListener('click', () => {
            this.toggleSettings();
        });

        this.settingsClose.addEventListener('click', () => {
            this.closeSettings();
        });

        // Settings controls
        this.setupSettingsControls();
    }

    setupSettingsControls() {
        // Dark mode
        const darkModeSetting = document.getElementById('dark-mode-setting');
        if (darkModeSetting) {
            darkModeSetting.addEventListener('change', (e) => {
                this.settings.darkMode = e.target.checked;
                this.applySettings();
                this.saveSettings();
            });
        }

        // High contrast
        const highContrastSetting = document.getElementById('high-contrast-setting');
        if (highContrastSetting) {
            highContrastSetting.addEventListener('change', (e) => {
                this.settings.highContrast = e.target.checked;
                this.applySettings();
                this.saveSettings();
            });
        }

        // Font size
        const fontDecrease = document.getElementById('font-decrease');
        const fontIncrease = document.getElementById('font-increase');
        const fontDisplay = document.getElementById('font-size-display');

        if (fontDecrease) {
            fontDecrease.addEventListener('click', () => {
                this.settings.fontSize = Math.max(50, this.settings.fontSize - 10);
                this.updateFontSize();
                this.saveSettings();
            });
        }

        if (fontIncrease) {
            fontIncrease.addEventListener('click', () => {
                this.settings.fontSize = Math.min(200, this.settings.fontSize + 10);
                this.updateFontSize();
                this.saveSettings();
            });
        }

        // Voice commands
        const voiceCommandsSetting = document.getElementById('voice-commands-setting');
        if (voiceCommandsSetting) {
            voiceCommandsSetting.addEventListener('change', (e) => {
                this.settings.voiceCommands = e.target.checked;
                this.saveSettings();
            });
        }

        // TTS
        const ttsSetting = document.getElementById('tts-setting');
        if (ttsSetting) {
            ttsSetting.addEventListener('change', (e) => {
                this.settings.tts = e.target.checked;
                this.saveSettings();
            });
        }

        // Speech rate
        const speechRate = document.getElementById('speech-rate');
        const speechRateValue = document.getElementById('speech-rate-value');
        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                this.settings.speechRate = parseFloat(e.target.value);
                if (speechRateValue) {
                    speechRateValue.textContent = e.target.value + 'x';
                }
                this.saveSettings();
            });
        }

        // Color blind support
        const colorblindSetting = document.getElementById('colorblind-setting');
        if (colorblindSetting) {
            colorblindSetting.addEventListener('change', (e) => {
                this.applyColorblindFilter(e.target.value);
                this.saveSettings();
            });
        }
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceStatus.style.display = 'flex';
                this.voiceBtn.style.background = '#ef4444';
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.sendMessage();
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceStatus.style.display = 'none';
                this.voiceBtn.style.background = '';
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.voiceStatus.style.display = 'none';
                this.voiceBtn.style.background = '';
            };
        }
    }

    toggleMessenger() {
        if (this.isOpen) {
            this.closeMessenger();
        } else {
            this.openMessenger();
        }
    }

    openMessenger() {
        this.messenger.classList.add('active');
        this.isOpen = true;
        this.messageInput.focus();
        this.speak('Sewa Sathi messenger opened. How can I help you?');
    }

    closeMessenger() {
        this.messenger.classList.remove('active');
        this.isOpen = false;
        if (this.isListening) {
            this.recognition.stop();
        }
    }

    toggleSettings() {
        this.settingsPanel.classList.toggle('active');
        if (this.settingsPanel.classList.contains('active')) {
            this.speak('Settings panel opened');
        }
    }

    closeSettings() {
        this.settingsPanel.classList.remove('active');
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.speak('Voice recognition not supported in this browser');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Call AI API
            const response = await this.callAI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            this.speak(response);
        } catch (error) {
            this.hideTypingIndicator();
            const errorMessage = 'Sorry, I encountered an error. Please try again.';
            this.addMessage(errorMessage, 'ai');
            this.speak(errorMessage);
        }
    }

    async callAI(message) {
        // Simulate API call with predefined responses
        const responses = {
            'hello': 'Hello! I\'m Sewa Sathi, your AI accessibility assistant. How can I help you today?',
            'help': 'I can help you with accessibility features, navigation, emergency services, and answering questions about our website.',
            'emergency': 'For emergency assistance, please call 100 for police, 101 for fire, or 102 for ambulance. I can also help you navigate to emergency services on this website.',
            'accessibility': 'Our website has many accessibility features including voice commands, text-to-speech, high contrast mode, font size adjustment, and screen reader support.',
            'navigation': 'I can help you navigate to different sections of the website. Just tell me where you\'d like to go!',
            'settings': 'You can access settings by clicking the gear icon in the accessibility controls. There you can adjust visual, audio, and interaction settings.',
            'voice': 'Voice commands are available! You can speak to me naturally, and I\'ll understand and help you.',
            'dark mode': 'I can help you enable dark mode. Look for the moon icon in the accessibility controls, or use the settings panel.',
            'font size': 'You can adjust font size using the A+ and A- buttons in the accessibility controls, or through the settings panel.',
            'contrast': 'High contrast mode can be enabled using the contrast button in the accessibility controls or through settings.',
            'screen reader': 'Our website is optimized for screen readers with proper ARIA labels, headings, and semantic HTML.',
            'keyboard': 'You can navigate this website entirely with your keyboard. Use Tab to move between elements and Enter to activate them.',
            'color blind': 'We have color blind support in the settings panel. You can simulate different types of color blindness to test the interface.',
            'gesture': 'Gesture control can be enabled in the settings panel for hands-free navigation.',
            'haptic': 'Haptic feedback can be enabled in the settings panel for tactile feedback on touch devices.'
        };

        // Simple keyword matching
        const lowerMessage = message.toLowerCase();
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }

        // Default response
        return 'I understand you\'re asking about accessibility. I can help you with navigation, emergency services, settings, and general questions about our website. What would you like to know?';
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${sender}-bubble`;
        bubble.innerHTML = `<p>${message}</p>`;
        
        messageDiv.appendChild(bubble);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-bubble ai-bubble">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    speak(text) {
        if (!this.settings.tts || !this.synth) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.speechRate;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to use a female voice if available
        const voices = this.synth.getVoices();
        const femaleVoice = voices.find(voice => 
            voice.name.includes('Female') || 
            voice.name.includes('female') ||
            voice.name.includes('Samantha') ||
            voice.name.includes('Karen')
        );
        
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        this.synth.speak(utterance);
    }

    applySettings() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Apply high contrast
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }

        // Update settings UI
        this.updateSettingsUI();
    }

    updateSettingsUI() {
        const darkModeSetting = document.getElementById('dark-mode-setting');
        const highContrastSetting = document.getElementById('high-contrast-setting');
        const voiceCommandsSetting = document.getElementById('voice-commands-setting');
        const ttsSetting = document.getElementById('tts-setting');
        const speechRate = document.getElementById('speech-rate');
        const speechRateValue = document.getElementById('speech-rate-value');

        if (darkModeSetting) darkModeSetting.checked = this.settings.darkMode;
        if (highContrastSetting) highContrastSetting.checked = this.settings.highContrast;
        if (voiceCommandsSetting) voiceCommandsSetting.checked = this.settings.voiceCommands;
        if (ttsSetting) ttsSetting.checked = this.settings.tts;
        if (speechRate) speechRate.value = this.settings.speechRate;
        if (speechRateValue) speechRateValue.textContent = this.settings.speechRate + 'x';
    }

    updateFontSize() {
        document.documentElement.style.fontSize = this.settings.fontSize + '%';
        const fontDisplay = document.getElementById('font-size-display');
        if (fontDisplay) {
            fontDisplay.textContent = this.settings.fontSize + '%';
        }
    }

    applyColorblindFilter(type) {
        // Remove existing filters
        document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
        
        if (type !== 'none') {
            document.body.classList.add(type);
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('sewa-sathi-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applySettings();
        this.updateFontSize();
    }

    saveSettings() {
        localStorage.setItem('sewa-sathi-settings', JSON.stringify(this.settings));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sewaSathiSimple = new SewaSathiSimple();
});

// Add CSS for typing indicator
const style = document.createElement('style');
style.textContent = `
    .typing-indicator .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    
    .typing-indicator .typing-dots span {
        width: 8px;
        height: 8px;
        background: currentColor;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-indicator .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
        }
        30% {
            transform: translateY(-10px);
            opacity: 1;
        }
    }
    
    .high-contrast {
        filter: contrast(150%) brightness(120%);
    }
    
    .protanopia {
        filter: url(#protanopia);
    }
    
    .deuteranopia {
        filter: url(#deuteranopia);
    }
    
    .tritanopia {
        filter: url(#tritanopia);
    }
`;
document.head.appendChild(style);

