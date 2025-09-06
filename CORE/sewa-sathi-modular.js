// Modular Sewa Sathi - Uses separate voice library and API handler
class SewaSathiModular {
    constructor() {
        this.isOpen = false;
        this.currentLanguage = 'en';
        this.isTTSEnabled = true;
        this.geminiApiKey = 'AIzaSyB6cRCzeFn030shUsVAESxXXUgZ9W1pzh8';
        this.visionAssistant = null;
        this.touchToSpeech = null;
        
        // Initialize separate components
        this.apiHandler = new APIHandler(this.geminiApiKey);
        this.voiceLibrary = new VoiceCommandLibrary({
            language: 'en-US',
            autoTouch: true,
            confidenceThreshold: 0.7
        });
        
        this.setupVoiceLibrary();
        this.init();
        this.initializeTouchToSpeech();
    }

    init() {
        this.setupEventListeners();
        this.initializeTTS();
        this.loadUserPreferences();
    }

    setupVoiceLibrary() {
        // Configure voice library callbacks
        this.voiceLibrary.on('onCommand', (data) => {
            this.handleVoiceCommand(data);
        });

        this.voiceLibrary.on('onListening', (data) => {
            this.updateVoiceStatus(data.status === 'started');
        });

        this.voiceLibrary.on('onError', (data) => {
            this.handleVoiceError(data.error);
        });

        this.voiceLibrary.on('onResult', (data) => {
            this.handleVoiceResult(data);
        });

        // Add custom commands for Sewa Sathi
        this.addCustomCommands();
    }

    addCustomCommands() {
        // Sewa Sathi specific commands
        this.voiceLibrary.addCommand('open sewa sathi', () => {
            this.openPanel();
        }, { description: 'Open Sewa Sathi assistant' });

        this.voiceLibrary.addCommand('close sewa sathi', () => {
            this.closePanel();
        }, { description: 'Close Sewa Sathi assistant' });

        this.voiceLibrary.addCommand('enable vision', () => {
            this.toggleVision();
        }, { description: 'Enable vision capabilities' });

        this.voiceLibrary.addCommand('disable vision', () => {
            this.toggleVision();
        }, { description: 'Disable vision capabilities' });

        this.voiceLibrary.addCommand('change language to (.*)', (match) => {
            const lang = match[1].toLowerCase();
            this.changeLanguage(lang === 'nepali' ? 'ne' : 'en');
        }, { description: 'Change language to English or Nepali' });

        this.voiceLibrary.addCommand('increase font size', () => {
            this.increaseFontSize();
        }, { description: 'Increase font size' });

        this.voiceLibrary.addCommand('decrease font size', () => {
            this.decreaseFontSize();
        }, { description: 'Decrease font size' });

        this.voiceLibrary.addCommand('enable high contrast', () => {
            this.toggleHighContrast();
        }, { description: 'Enable high contrast mode' });

        this.voiceLibrary.addCommand('disable high contrast', () => {
            this.toggleHighContrast();
        }, { description: 'Disable high contrast mode' });

        this.voiceLibrary.addCommand('enable dark mode', () => {
            this.toggleDarkMode();
        }, { description: 'Enable dark mode' });

        this.voiceLibrary.addCommand('disable dark mode', () => {
            this.toggleDarkMode();
        }, { description: 'Disable dark mode' });

        this.voiceLibrary.addCommand('search for (.*)', (match) => {
            this.searchFor(match[1]);
        }, { description: 'Search for specific content' });

        this.voiceLibrary.addCommand('open search', () => {
            this.openSearch();
        }, { description: 'Open search interface' });

        this.voiceLibrary.addCommand('close search', () => {
            this.closeSearch();
        }, { description: 'Close search interface' });

        this.voiceLibrary.addCommand('show progress', () => {
            this.showProgress();
        }, { description: 'Show progress indicator' });

        this.voiceLibrary.addCommand('hide progress', () => {
            this.hideProgress();
        }, { description: 'Hide progress indicator' });

        this.voiceLibrary.addCommand('mark section complete', () => {
            this.markCurrentSectionComplete();
        }, { description: 'Mark current section as completed' });

        this.voiceLibrary.addCommand('show notification (.*)', (match) => {
            this.showNotification(match[1]);
        }, { description: 'Show a custom notification' });

        this.voiceLibrary.addCommand('clear notifications', () => {
            this.clearNotifications();
        }, { description: 'Clear all notifications' });

        this.voiceLibrary.addCommand('export data', () => {
            this.exportData();
        }, { description: 'Export user data and preferences' });

        this.voiceLibrary.addCommand('import data', () => {
            this.importData();
        }, { description: 'Import user data and preferences' });

        this.voiceLibrary.addCommand('open login', () => {
            this.openLogin();
        }, { description: 'Open login panel' });

        this.voiceLibrary.addCommand('close login', () => {
            this.closeLogin();
        }, { description: 'Close login panel' });

        this.voiceLibrary.addCommand('select parent role', () => {
            this.selectParentRole();
        }, { description: 'Select parent role for login' });

        this.voiceLibrary.addCommand('select student role', () => {
            this.selectStudentRole();
        }, { description: 'Select student role for login' });

        this.voiceLibrary.addCommand('open ai assistant', () => {
            this.openAIAssistant();
        }, { description: 'Open AI accessibility assistant' });

        this.voiceLibrary.addCommand('close ai assistant', () => {
            this.closeAIAssistant();
        }, { description: 'Close AI accessibility assistant' });

        this.voiceLibrary.addCommand('scan accessibility', () => {
            this.scanAccessibility();
        }, { description: 'Run accessibility scanner' });

        this.voiceLibrary.addCommand('show heatmap', () => {
            this.showHeatmap();
        }, { description: 'Show accessibility heatmap' });

        this.voiceLibrary.addCommand('hide heatmap', () => {
            this.hideHeatmap();
        }, { description: 'Hide accessibility heatmap' });

        this.voiceLibrary.addCommand('optimize for me', () => {
            this.optimizeForUser();
        }, { description: 'AI optimize the interface for user' });
    }

    setupEventListeners() {
        // Toggle panel
        document.getElementById('sewa-sathi-toggle').addEventListener('click', () => {
            this.togglePanel();
        });

        // Close panel
        document.getElementById('sewa-sathi-close').addEventListener('click', () => {
            this.closePanel();
        });

        // Language toggle
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Voice toggle
        document.getElementById('voice-toggle').addEventListener('click', () => {
            this.toggleVoice();
        });

        // TTS toggle
        document.getElementById('tts-toggle').addEventListener('click', () => {
            this.toggleTTS();
        });

        // Vision toggle
        document.getElementById('vision-toggle').addEventListener('click', () => {
            this.toggleVision();
        });

        // Send message
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendMessage();
        });

        // Chat input enter key
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.action);
            });
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.sewa-sathi') && this.isOpen) {
                this.closePanel();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    }

    initializeTTS() {
        if (!window.speechSynthesis) {
            console.warn('Text-to-speech not supported');
            return;
        }

        this.synthesis = window.speechSynthesis;
        this.loadVoices();
        this.synthesis.onvoiceschanged = () => this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        this.englishVoice = this.voices.find(voice => 
            voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        this.nepaliVoice = this.voices.find(voice => 
            voice.lang.startsWith('ne') || voice.lang.includes('nepal')
        ) || this.englishVoice;
    }

    // Voice command handling
    handleVoiceCommand(data) {
        if (data.command) {
            // Command was handled by voice library
            this.addMessage(`Executed: ${data.transcript}`, 'ai');
        } else {
            // Unknown command - send to AI
            this.processUnknownCommand(data.transcript);
        }
    }

    async processUnknownCommand(transcript) {
        this.addMessage(transcript, 'user');
        
        try {
            const response = await this.apiHandler.generateContent(
                this.buildPrompt(transcript)
            );
            
            this.addMessage(response.text, 'ai');
            this.speak(response.text);
        } catch (error) {
            console.error('AI processing error:', error);
            this.addMessage('Sorry, I encountered an error processing your request.', 'ai');
        }
    }

    handleVoiceResult(data) {
        // Update UI with interim results if needed
        if (data.interim) {
            // Could show interim results in chat
        }
    }

    handleVoiceError(error) {
        console.error('Voice recognition error:', error);
        this.addMessage('Voice recognition error. Please try again.', 'ai');
    }

    updateVoiceStatus(isListening) {
        const status = document.getElementById('voice-status');
        if (status) {
            status.textContent = isListening ? 'Voice On' : 'Voice Off';
        }
    }

    // Panel management
    togglePanel() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('sewa-sathi-panel');
        const toggle = document.getElementById('sewa-sathi-toggle');
        
        if (this.isOpen) {
            panel.classList.add('active');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            document.getElementById('chat-input').focus();
            this.speak("Sewa Sathi is ready! You can speak naturally or type your message.");
        } else {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    closePanel() {
        this.isOpen = false;
        const panel = document.getElementById('sewa-sathi-panel');
        const toggle = document.getElementById('sewa-sathi-toggle');
        
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
    }

    // Voice control
    toggleVoice() {
        if (this.voiceLibrary.isEnabled) {
            this.voiceLibrary.disable();
            this.updateVoiceUI(false);
        } else {
            this.voiceLibrary.enable();
            this.voiceLibrary.startListening();
            this.updateVoiceUI(true);
        }
    }

    updateVoiceUI(enabled) {
        const btn = document.getElementById('voice-toggle');
        const status = document.getElementById('voice-status');
        
        if (enabled) {
            btn.classList.add('active');
            status.textContent = 'Voice On';
        } else {
            btn.classList.remove('active');
            status.textContent = 'Voice Off';
        }
    }

    // TTS control
    toggleTTS() {
        this.isTTSEnabled = !this.isTTSEnabled;
        const btn = document.getElementById('tts-toggle');
        const status = document.getElementById('tts-status');
        
        if (this.isTTSEnabled) {
            btn.classList.add('active');
            status.textContent = 'TTS On';
        } else {
            btn.classList.remove('active');
            status.textContent = 'TTS Off';
        }
    }

    // Vision control
    async toggleVision() {
        if (!this.visionAssistant) {
            try {
                this.visionAssistant = new VisionAssistant(this);
                await this.visionAssistant.init();
                this.visionAssistant.startVision();
                this.updateVisionUI(true);
                this.speak("Vision capabilities enabled");
            } catch (error) {
                console.error('Failed to initialize vision:', error);
                this.addMessage("Failed to enable vision capabilities", 'ai');
            }
        } else {
            this.visionAssistant.toggleVision();
            const isActive = this.visionAssistant.isDetecting;
            this.updateVisionUI(isActive);
            this.speak(isActive ? "Vision enabled" : "Vision disabled");
        }
    }

    updateVisionUI(isActive) {
        const btn = document.getElementById('vision-toggle');
        const status = document.getElementById('vision-status');
        
        if (isActive) {
            btn.classList.add('active');
            status.textContent = 'Vision On';
        } else {
            btn.classList.remove('active');
            status.textContent = 'Vision Off';
        }
    }

    // Language management
    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.voiceLibrary.setLanguage(lang === 'en' ? 'en-US' : 'ne-NP');
        this.updateUI();
        this.speak("Language changed to " + (lang === 'en' ? 'English' : 'Nepali'));
    }

    // Accessibility controls
    increaseFontSize() {
        // Access the main accessibility manager
        if (window.accessibilityManager) {
            window.accessibilityManager.increaseFontSize();
        }
    }

    decreaseFontSize() {
        if (window.accessibilityManager) {
            window.accessibilityManager.decreaseFontSize();
        }
    }

    toggleHighContrast() {
        if (window.accessibilityManager) {
            window.accessibilityManager.toggleHighContrast();
        }
    }

    toggleDarkMode() {
        if (window.accessibilityManager) {
            window.accessibilityManager.toggleDarkMode();
        }
    }

    searchFor(query) {
        if (window.accessibilityManager) {
            window.accessibilityManager.toggleSearch();
            window.accessibilityManager.searchInput.value = query;
            window.accessibilityManager.handleSearchInput(query);
        }
    }

    openSearch() {
        if (window.accessibilityManager) {
            window.accessibilityManager.toggleSearch();
        }
    }

    closeSearch() {
        if (window.accessibilityManager) {
            window.accessibilityManager.hideSearch();
        }
    }

    showProgress() {
        if (window.accessibilityManager) {
            window.accessibilityManager.showProgressIndicator();
        }
    }

    hideProgress() {
        if (window.accessibilityManager) {
            window.accessibilityManager.hideProgressIndicator();
        }
    }

    markCurrentSectionComplete() {
        if (window.accessibilityManager) {
            const currentSection = window.accessibilityManager.userProgress.currentSection;
            window.accessibilityManager.markSectionCompleted(currentSection);
        }
    }

    showNotification(message) {
        if (window.accessibilityManager) {
            window.accessibilityManager.showInfoNotification('Voice Command', message);
        }
    }

    clearNotifications() {
        if (window.accessibilityManager) {
            window.accessibilityManager.clearAllNotifications();
        }
    }

    exportData() {
        if (window.accessibilityManager) {
            window.accessibilityManager.exportUserData();
        }
    }

    importData() {
        if (window.accessibilityManager) {
            document.getElementById('import-file').click();
        }
    }

    openLogin() {
        if (window.accessibilityManager) {
            window.accessibilityManager.showLoginPanel();
        }
    }

    closeLogin() {
        if (window.accessibilityManager) {
            window.accessibilityManager.hideLoginPanel();
        }
    }

    selectParentRole() {
        if (window.accessibilityManager) {
            window.accessibilityManager.selectRole('parent');
        }
    }

    selectStudentRole() {
        if (window.accessibilityManager) {
            window.accessibilityManager.selectRole('student');
        }
    }

    openAIAssistant() {
        const aiAssistant = document.getElementById('ai-assistant');
        if (aiAssistant) {
            aiAssistant.classList.add('active');
        }
    }

    closeAIAssistant() {
        const aiAssistant = document.getElementById('ai-assistant');
        if (aiAssistant) {
            aiAssistant.classList.remove('active');
        }
    }

    scanAccessibility() {
        const scannerToggle = document.getElementById('scanner-toggle');
        if (scannerToggle) {
            scannerToggle.click();
        }
    }

    showHeatmap() {
        const heatmapToggle = document.getElementById('heatmap-toggle');
        if (heatmapToggle) {
            heatmapToggle.click();
        }
    }

    hideHeatmap() {
        const heatmap = document.getElementById('accessibility-heatmap');
        if (heatmap && heatmap.classList.contains('active')) {
            const heatmapToggle = document.getElementById('heatmap-toggle');
            if (heatmapToggle) {
                heatmapToggle.click();
            }
        }
    }

    optimizeForUser() {
        if (window.accessibilityManager) {
            window.accessibilityManager.optimizeForUser();
        }
    }

    // Message handling
    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            this.processUnknownCommand(message);
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'message-text';
        textSpan.textContent = text;
        
        contentDiv.appendChild(textSpan);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    speak(text) {
        if (!this.isTTSEnabled || !this.synthesis) return;

        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        if (this.currentLanguage === 'ne' && this.nepaliVoice) {
            utterance.voice = this.nepaliVoice;
        } else if (this.englishVoice) {
            utterance.voice = this.englishVoice;
        }

        this.synthesis.speak(utterance);
    }

    // AI prompt building
    buildPrompt(message) {
        const context = this.getPageContext();
        const language = this.currentLanguage === 'en' ? 'English' : 'Nepali';
        
        return `You are Sewa Sathi, an empathetic AI accessibility assistant. Respond in ${language}.

USER CONTEXT:
- Language: ${language}
- Current page: Accessible website
- Page content: ${context}

USER MESSAGE: "${message}"

RESPONSE GUIDELINES:
1. Be conversational, empathetic, and helpful
2. Understand ANY type of request - navigation, questions, help, general conversation
3. Provide actionable guidance when possible
4. Focus on accessibility and user empowerment
5. Keep responses natural and conversational
6. If responding in Nepali, use proper Devanagari script
7. Always be encouraging and supportive

Respond naturally as Sewa Sathi:`;
    }

    getPageContext() {
        const title = document.title;
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent).join(', ');
        const sections = Array.from(document.querySelectorAll('section')).map(s => s.id).filter(Boolean).join(', ');
        
        return `Title: ${title}
Main headings: ${headings}
Sections: ${sections}`;
    }

    // Quick actions
    handleQuickAction(action) {
        switch (action) {
            case 'navigate':
                this.navigatePage();
                break;
            case 'read':
                this.readContent();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'settings':
                this.openAccessibilitySettings();
                break;
        }
    }

    navigatePage() {
        const sections = document.querySelectorAll('section[id]');
        const sectionNames = Array.from(sections).map(s => ({
            id: s.id,
            title: s.querySelector('h1, h2, h3')?.textContent || s.id
        }));

        const message = this.currentLanguage === 'en' 
            ? `Available sections: ${sectionNames.map(s => s.title).join(', ')}. Use voice commands like "go to features" or "navigate to contact" to jump to specific sections.`
            : `उपलब्ध खण्डहरू: ${sectionNames.map(s => s.title).join(', ')}। विशिष्ट खण्डहरूमा जान "go to features" वा "navigate to contact" जस्ता आवाज आदेशहरू प्रयोग गर्नुहोस्।`;

        this.addMessage(message, 'ai');
        this.speak(message);
    }

    readContent() {
        const focusedElement = document.activeElement;
        let content = '';
        
        if (focusedElement && focusedElement.textContent) {
            content = focusedElement.textContent;
        } else {
            const mainContent = document.querySelector('main');
            content = mainContent ? mainContent.textContent.substring(0, 500) + '...' : 'No content found';
        }

        const message = this.currentLanguage === 'en' 
            ? `Reading content: ${content}`
            : `सामग्री पढ्दैछु: ${content}`;

        this.addMessage(message, 'ai');
        this.speak(content);
    }

    showHelp() {
        const helpMessage = this.currentLanguage === 'en' 
            ? `I can help you with:
• Navigation: Say "go to features" or "navigate to contact"
• Reading: Say "read this page" or "speak content"
• Voice commands: Enable voice mode and speak naturally
• Touch control: I can guide you through touch interactions
• Vision: Enable vision mode for object detection
• Accessibility: Ask about any accessibility features
• Language: Say "change language to Nepali" anytime`
            : `म तपाईंलाई यसरी मद्दत गर्न सक्छु:
• नेविगेसन: "go to features" वा "navigate to contact" भन्नुहोस्
• पढाइ: "read this page" वा "speak content" भन्नुहोस्
• आवाज आदेश: आवाज मोड सक्षम गर्नुहोस् र प्राकृतिक रूपमा बोल्नुहोस्
• टच नियन्त्रण: म तपाईंलाई टच अन्तरक्रिया मार्फत मार्गदर्शन गर्न सक्छु
• दृष्टि: वस्तु पहिचानका लागि दृष्टि मोड सक्षम गर्नुहोस्
• सुलभता: कुनै पनि सुलभता सुविधाहरूको बारेमा सोध्नुहोस्
• भाषा: कहिले पनि "change language to English" भन्नुहोस्`;

        this.addMessage(helpMessage, 'ai');
        this.speak(helpMessage);
    }

    openAccessibilitySettings() {
        const controls = document.querySelector('.accessibility-controls');
        if (controls) {
            controls.scrollIntoView({ behavior: 'smooth' });
            const firstButton = controls.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }

        const message = this.currentLanguage === 'en' 
            ? "Accessibility settings are now in focus. Use voice commands like 'increase font size' or 'enable high contrast' to adjust settings."
            : "सुलभता सेटिङहरू अब फोकसमा छन्। सेटिङहरू समायोजन गर्न 'increase font size' वा 'enable high contrast' जस्ता आवाज आदेशहरू प्रयोग गर्नुहोस्।";

        this.addMessage(message, 'ai');
        this.speak(message);
    }

    // UI updates
    updateUI() {
        // Update all elements with data attributes
        document.querySelectorAll('[data-en], [data-ne]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
    }

    // Settings management
    saveSettings() {
        const settings = {
            language: this.currentLanguage,
            ttsEnabled: this.isTTSEnabled,
            voiceEnabled: this.voiceLibrary.isEnabled,
            visionEnabled: this.visionAssistant ? this.visionAssistant.isDetecting : false
        };
        localStorage.setItem('sewa-sathi-settings', JSON.stringify(settings));
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('sewa-sathi-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.currentLanguage = settings.language || 'en';
                this.isTTSEnabled = settings.ttsEnabled !== false;
                
                if (settings.voiceEnabled) {
                    this.voiceLibrary.enable();
                }
                
                this.updateUI();
            } catch (e) {
                console.warn('Could not load Sewa Sathi settings:', e);
            }
        }
    }

    // Touch-to-Speech methods
    initializeTouchToSpeech() {
        // Wait for touch-to-speech to be available
        setTimeout(() => {
            if (window.touchToSpeech) {
                this.touchToSpeech = window.touchToSpeech;
            }
        }, 1000);
    }

    enableTouchToSpeech() {
        if (this.touchToSpeech) {
            this.touchToSpeech.enable();
            this.addMessage('Touch-to-speech enabled! Touch any text to hear it spoken aloud.', 'ai');
            this.speak('Touch-to-speech enabled! Touch any text to hear it spoken aloud.');
        } else {
            this.addMessage('Touch-to-speech is not available. Please refresh the page.', 'ai');
        }
    }

    disableTouchToSpeech() {
        if (this.touchToSpeech) {
            this.touchToSpeech.disable();
            this.addMessage('Touch-to-speech disabled.', 'ai');
            this.speak('Touch-to-speech disabled.');
        }
    }

    enableHearingImpairmentMode() {
        if (window.emergencyServices) {
            window.emergencyServices.enableHearingImpairmentMode();
        }
        
        if (this.touchToSpeech) {
            this.touchToSpeech.enable();
        }
        
        this.addMessage('Hearing impairment mode enabled! Touch-to-speech is now active and visual indicators have been added.', 'ai');
        this.speak('Hearing impairment mode enabled! Touch-to-speech is now active and visual indicators have been added.');
    }
}

// Initialize modular Sewa Sathi when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sewaSathiModular = new SewaSathiModular();
    
    // Announce that Sewa Sathi is ready
    setTimeout(() => {
        if (window.sewaSathiModular) {
            window.sewaSathiModular.addMessage("Sewa Sathi is ready! I now have advanced voice commands with auto-touch capabilities. Try saying 'help' to see what I can do!", 'ai');
        }
    }, 2000);
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SewaSathiModular;
}
