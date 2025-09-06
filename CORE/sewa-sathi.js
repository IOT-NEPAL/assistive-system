// Sewa Sathi AI Assistant - Focused Chatbot with Enhanced Speech Features
class SewaSathi {
    constructor() {
        this.isOpen = false;
        this.currentLanguage = 'en';
        this.isVoiceEnabled = false;
        this.isTTSEnabled = true;
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.geminiApiKey = 'AIzaSyB6cRCzeFn030shUsVAESxXXUgZ9W1pzh8'; // Gemini API Key
        this.conversationHistory = [];
        this.isThinking = false;
        this.isBlindUser = false;
        this.autoTTSEnabled = false;
        this.autoSTTEnabled = false;
        
        // Language translations
        this.translations = {
            en: {
                welcome: "Hello! I'm Sewa Sathi, your AI accessibility assistant. How can I help you today?",
                listening: "Listening... Speak your command",
                voiceOff: "Voice Off",
                voiceOn: "Voice On",
                ttsOn: "TTS On",
                ttsOff: "TTS Off",
                aiReady: "AI Ready",
                aiThinking: "AI Thinking...",
                quickActions: "Quick Actions",
                navigatePage: "Navigate Page",
                readContent: "Read Content",
                getHelp: "Get Help",
                accessibilitySettings: "Accessibility Settings",
                typeMessage: "Type your message or use voice...",
                sendMessage: "Send message",
                closeAssistant: "Close Sewa Sathi",
                openAssistant: "Open Sewa Sathi AI Assistant",
                language: "Language:",
                english: "English",
                nepali: "नेपाली (Nepali)",
                stop: "Stop",
                error: "Error occurred. Please try again.",
                noApiKey: "Please set your Gemini API key in settings.",
                voiceNotSupported: "Voice recognition not supported in this browser.",
                ttsNotSupported: "Text-to-speech not supported in this browser.",
                visionOn: "Vision On",
                visionOff: "Vision Off",
                visionEnabled: "Vision capabilities enabled",
                visionDisabled: "Vision capabilities disabled"
            },
            ne: {
                welcome: "नमस्ते! म सेवा साथी हुँ, तपाईंको AI सुलभता सहायक। आज म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
                listening: "सुन्दैछु... आफ्नो आदेश बोल्नुहोस्",
                voiceOff: "आवाज बन्द",
                voiceOn: "आवाज चालू",
                ttsOn: "TTS चालू",
                ttsOff: "TTS बन्द",
                aiReady: "AI तयार",
                aiThinking: "AI सोच्दैछ...",
                quickActions: "द्रुत कार्यहरू",
                navigatePage: "पृष्ठ नेविगेट गर्नुहोस्",
                readContent: "सामग्री पढ्नुहोस्",
                getHelp: "मद्दत पाउनुहोस्",
                accessibilitySettings: "सुलभता सेटिङहरू",
                typeMessage: "आफ्नो सन्देश टाइप गर्नुहोस् वा आवाज प्रयोग गर्नुहोस्...",
                sendMessage: "सन्देश पठाउनुहोस्",
                closeAssistant: "सेवा साथी बन्द गर्नुहोस्",
                openAssistant: "सेवा साथी AI सहायक खोल्नुहोस्",
                language: "भाषा:",
                english: "English",
                nepali: "नेपाली (Nepali)",
                stop: "रोक्नुहोस्",
                error: "त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।",
                noApiKey: "कृपया सेटिङहरूमा आफ्नो Gemini API कुञ्जी सेट गर्नुहोस्।",
                voiceNotSupported: "यो ब्राउजरमा आवाज पहिचान समर्थित छैन।",
                ttsNotSupported: "यो ब्राउजरमा पाठ-देखि-आवाज समर्थित छैन।",
                visionOn: "दृष्टि चालू",
                visionOff: "दृष्टि बन्द",
                visionEnabled: "दृष्टि सुविधा सक्षम भयो",
                visionDisabled: "दृष्टि सुविधा अक्षम भयो"
            }
        };
        
        this.init();
    }

    init() {
        this.detectBlindUser();
        this.detectDeafUser();
        this.setupEventListeners();
        this.initializeVoiceRecognition();
        this.initializeTTS();
        this.loadSettings();
        this.updateUI();
        this.setupAutoFeatures();
    }

    detectBlindUser() {
        // Check if user has selected visual impairment in accessibility settings
        const savedDisability = localStorage.getItem('accessibility-disability-type');
        this.isBlindUser = savedDisability === 'visual';
        
        // Also check for screen reader usage
        if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
            // Check if user prefers screen reader announcements
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) {
                this.isBlindUser = true;
            }
        }
    }

    detectDeafUser() {
        // Check if user has selected hearing impairment in accessibility settings
        const savedDisability = localStorage.getItem('accessibility-disability-type');
        this.isDeafUser = savedDisability === 'hearing';
        
        // Auto-enable enhanced TTS for deaf users
        if (this.isDeafUser) {
            this.isTTSEnabled = true;
            this.ttsSettings.rate = 0.7; // Slower for better comprehension
            this.ttsSettings.volume = 0.9; // Louder
        }
    }

    setupAutoFeatures() {
        if (this.isBlindUser) {
            // Automatically enable TTS and STT for blind users
            this.autoTTSEnabled = true;
            this.autoSTTEnabled = true;
            this.isTTSEnabled = true;
            this.isVoiceEnabled = true;
            
            // Update UI to reflect auto-enabled features
            this.updateAutoFeaturesUI();
            
            // Announce auto-enabled features
            setTimeout(() => {
                this.speak("Sewa Sathi is now configured for your accessibility needs. Text-to-speech and speech-to-text are automatically enabled.");
            }, 1000);
        }
    }

    updateAutoFeaturesUI() {
        // Update TTS button
        const ttsBtn = document.getElementById('tts-toggle');
        const ttsStatus = document.getElementById('tts-status');
        if (ttsBtn && ttsStatus) {
            ttsBtn.classList.add('active');
            ttsStatus.textContent = this.t('ttsOn');
        }

        // Update Voice button
        const voiceBtn = document.getElementById('voice-toggle');
        const voiceStatus = document.getElementById('voice-status');
        if (voiceBtn && voiceStatus) {
            voiceBtn.classList.add('active');
            voiceStatus.textContent = this.t('voiceOn');
        }
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

        // Enhanced voice controls for blind users
        if (this.isBlindUser) {
            // Add continuous listening for blind users
            this.setupContinuousListening();
        }

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

        // Voice overlay removed - using chat interface for voice commands

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

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true; // Enable interim results for better UX
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'ne-NP';
            this.recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus('listening');
                this.showListeningIndicator();
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Show interim results for better feedback
                if (interimTranscript) {
                    this.showInterimResult(interimTranscript);
                }

                if (finalTranscript) {
                    this.processVoiceCommand(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.stopListening();
                this.hideListeningIndicator();
                
                let errorMessage = this.t('voiceNotSupported');
                if (event.error === 'no-speech') {
                    errorMessage = this.currentLanguage === 'en' 
                        ? "No speech detected. Please try again."
                        : "कुनै आवाज पहिचान भएन। कृपया फेरि प्रयास गर्नुहोस्।";
                } else if (event.error === 'network') {
                    errorMessage = this.currentLanguage === 'en'
                        ? "Network error. Please check your connection."
                        : "नेटवर्क त्रुटि। कृपया आफ्नो जडान जाँच गर्नुहोस्।";
                }
                
                this.showError(errorMessage);
            };

            this.recognition.onend = () => {
                this.stopListening();
                this.hideListeningIndicator();
            };
        } else {
            console.warn('Voice recognition not supported');
        }
    }

    showListeningIndicator() {
        // Create visual indicator for listening
        const indicator = document.createElement('div');
        indicator.id = 'listening-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 102, 204, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            animation: pulse 1s infinite;
            box-shadow: 0 4px 20px rgba(0, 102, 204, 0.3);
        `;
        indicator.textContent = this.t('listening');
        document.body.appendChild(indicator);
    }

    hideListeningIndicator() {
        const indicator = document.getElementById('listening-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    showInterimResult(text) {
        // Show interim speech recognition results
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.placeholder = `Listening: ${text}`;
        }
    }

    initializeTTS() {
        if (!this.synthesis) {
            console.warn('Text-to-speech not supported');
            return;
        }

        // Set up TTS voices
        this.loadVoices();
        this.synthesis.onvoiceschanged = () => this.loadVoices();
        
        // Enhanced TTS settings for better accessibility
        this.ttsSettings = {
            rate: 0.9,
            pitch: 1.0,
            volume: 0.8,
            lang: 'en-US'
        };
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Find the best voices for each language
        this.englishVoice = this.voices.find(voice => 
            voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
        ) || this.voices.find(voice => voice.lang.startsWith('en'));
        
        this.nepaliVoice = this.voices.find(voice => 
            voice.lang.startsWith('ne') || voice.lang.includes('nepal') || voice.lang.includes('hi')
        ) || this.englishVoice; // Fallback to English if Nepali not available

        // For blind users, prefer more natural voices
        if (this.isBlindUser) {
            this.englishVoice = this.voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Natural')
            ) || this.englishVoice;
        }
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('sewa-sathi-panel');
        const toggle = document.getElementById('sewa-sathi-toggle');
        
        if (this.isOpen) {
            panel.classList.add('active');
            panel.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            document.getElementById('chat-input').focus();
            this.speak(this.t('welcome'));
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

    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.updateUI();
        
        if (this.recognition) {
            this.recognition.lang = lang === 'en' ? 'en-US' : 'ne-NP';
        }
        
        this.speak(this.t('welcome'));
        this.saveSettings();
    }

    toggleVoice() {
        this.isVoiceEnabled = !this.isVoiceEnabled;
        const btn = document.getElementById('voice-toggle');
        const status = document.getElementById('voice-status');
        
        if (this.isVoiceEnabled) {
            btn.classList.add('active');
            status.textContent = this.t('voiceOn');
            if (this.recognition) {
                this.startListening();
            } else {
                this.showError(this.t('voiceNotSupported'));
            }
        } else {
            btn.classList.remove('active');
            status.textContent = this.t('voiceOff');
            this.stopListening();
        }
        
        this.saveSettings();
    }

    toggleTTS() {
        this.isTTSEnabled = !this.isTTSEnabled;
        const btn = document.getElementById('tts-toggle');
        const status = document.getElementById('tts-status');
        
        if (this.isTTSEnabled) {
            btn.classList.add('active');
            status.textContent = this.t('ttsOn');
        } else {
            btn.classList.remove('active');
            status.textContent = this.t('ttsOff');
        }
        
        this.saveSettings();
    }

    setupContinuousListening() {
        // For blind users, enable continuous listening when panel is open
        this.continuousListeningInterval = null;
        
        // Start continuous listening when panel opens
        this.originalTogglePanel = this.togglePanel.bind(this);
        this.togglePanel = () => {
            this.originalTogglePanel();
            if (this.isOpen && this.isBlindUser) {
                this.startContinuousListening();
            } else {
                this.stopContinuousListening();
            }
        };
    }

    startContinuousListening() {
        if (this.continuousListeningInterval) return;
        
        // Start listening every 3 seconds for blind users
        this.continuousListeningInterval = setInterval(() => {
            if (this.isOpen && this.isVoiceEnabled && !this.isListening) {
                this.startListening();
            }
        }, 3000);
    }

    stopContinuousListening() {
        if (this.continuousListeningInterval) {
            clearInterval(this.continuousListeningInterval);
            this.continuousListeningInterval = null;
        }
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.addMessage(this.t('listening'), 'ai');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateStatus('ready');
    }

    // Voice overlay methods removed - using chat interface instead

    processVoiceCommand(transcript) {
        this.addMessage(transcript, 'user');
        this.handleCommand(transcript);
    }

    async handleCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // Enhanced command processing with more natural language understanding
        if (this.isQuickCommand(lowerCommand)) {
            this.handleQuickCommand(lowerCommand);
        } else if (this.isNavigationCommand(lowerCommand)) {
            this.handleNavigationCommand(lowerCommand);
        } else if (this.isActionCommand(lowerCommand)) {
            this.handleActionCommand(lowerCommand);
        } else {
            // Send to AI for intelligent processing
            await this.sendToAI(command);
        }
    }

    isQuickCommand(command) {
        const quickCommands = ['help', 'close', 'exit', 'stop', 'quit', 'settings', 'preferences'];
        return quickCommands.some(cmd => command.includes(cmd));
    }

    isNavigationCommand(command) {
        const navKeywords = ['navigate', 'go to', 'go', 'move to', 'show me', 'take me to', 'open'];
        return navKeywords.some(keyword => command.includes(keyword));
    }

    isActionCommand(command) {
        const actionKeywords = ['read', 'speak', 'tell me', 'explain', 'describe', 'what is', 'how to'];
        return actionKeywords.some(keyword => command.includes(keyword));
    }

    handleQuickCommand(command) {
        if (command.includes('help')) {
            this.handleQuickAction('help');
        } else if (command.includes('close') || command.includes('exit') || command.includes('quit')) {
            this.closePanel();
        } else if (command.includes('settings') || command.includes('preferences')) {
            this.handleQuickAction('settings');
        }
    }

    handleNavigationCommand(command) {
        // Extract target from command
        let target = 'home';
        
        if (command.includes('news') || command.includes('headlines')) {
            target = 'news';
        } else if (command.includes('emergency')) {
            target = 'emergency';
        } else if (command.includes('medical') || command.includes('health')) {
            target = 'medical';
        } else if (command.includes('transport') || command.includes('transportation')) {
            target = 'transport';
        } else if (command.includes('education') || command.includes('learning')) {
            target = 'education';
        } else if (command.includes('features') || command.includes('feature')) {
            target = 'features';
        } else if (command.includes('resources') || command.includes('resource')) {
            target = 'resources';
        } else if (command.includes('contact') || command.includes('contact us')) {
            target = 'contact';
        } else if (command.includes('home') || command.includes('main')) {
            target = 'home';
        }
        
        this.navigateToSection(target);
    }

    handleActionCommand(command) {
        if (command.includes('read') || command.includes('speak')) {
            if (command.includes('news') || command.includes('headlines')) {
                this.handleNewsCommand(command);
            } else {
                this.handleQuickAction('read');
            }
        } else if (command.includes('news') || command.includes('headlines') || command.includes('latest news')) {
            this.handleNewsCommand(command);
        } else if (command.includes('tell me about') || command.includes('explain')) {
            this.handleQuickAction('help');
        } else {
            // Send to AI for detailed processing
            this.sendToAI(command);
        }
    }

    handleNewsCommand(command) {
        // Navigate to news section
        this.navigateToSection('news');
        
        // If news manager is available, trigger news reading
        if (window.newsManager) {
            setTimeout(() => {
                if (command.includes('read') || command.includes('speak')) {
                    window.newsManager.readNewsForAccessibility();
                } else {
                    const message = this.currentLanguage === 'en' 
                        ? "Navigating to news section. You can use the auto-read feature for deaf users or manually select articles to read."
                        : "समाचार खण्डमा नेविगेट गर्दैछु। तपाईं बहिरा प्रयोगकर्ताहरूका लागि स्वचालित पढाइ सुविधा प्रयोग गर्न सक्नुहुन्छ वा म्यानुअली लेखहरू छान्न सक्नुहुन्छ।";
                    
                    this.addMessage(message, 'ai');
                    this.speak(message);
                }
            }, 1000);
        }
    }

    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            section.focus();
            
            const message = this.currentLanguage === 'en' 
                ? `Navigating to ${sectionId} section`
                : `${sectionId} खण्डमा नेविगेट गर्दैछु`;
            
            this.addMessage(message, 'ai');
            this.speak(message);
        }
    }

    async sendToAI(message) {
        if (!this.geminiApiKey) {
            this.addMessage(this.t('noApiKey'), 'ai');
            return;
        }

        this.setThinking(true);
        
        try {
            const response = await this.callGeminiAPI(message);
            this.addMessage(response, 'ai');
            
            // Use enhanced speak function for blind users
            if (this.isBlindUser) {
                this.speakForBlindUser(response);
            } else {
                this.speak(response);
            }
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage(this.t('error'), 'ai');
            this.setThinking(false);
        }
    }

    async callGeminiAPI(message) {
        const prompt = this.buildPrompt(message);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    buildPrompt(message) {
        const context = this.getPageContext();
        const language = this.currentLanguage === 'en' ? 'English' : 'Nepali';
        const isBlindUser = this.isBlindUser;
        
        return `You are Sewa Sathi, an empathetic AI accessibility assistant focused on helping users with disabilities. Respond in ${language}.

USER CONTEXT:
- Language: ${language}
- Current page: Accessible website with disability support features
- Page content: ${context}
- User type: ${isBlindUser ? 'Blind/Visually Impaired User' : 'General User'}
- Accessibility features: Emergency services, medical support, transportation, education resources
- Speech features: Text-to-speech and speech-to-text enabled

USER MESSAGE: "${message}"

RESPONSE GUIDELINES:
1. Be conversational, empathetic, and helpful
2. Focus on accessibility, disability support, and user empowerment
3. Provide actionable guidance for navigating the website
4. Help with emergency services, medical support, transportation, and education
5. Be encouraging and supportive
6. Keep responses concise but informative
7. If responding in Nepali, use proper Devanagari script
8. Always prioritize user safety and accessibility needs
9. Offer specific help with website features and services
10. Be ready to assist with any disability-related questions

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

    handleQuickAction(action) {
        switch (action) {
            case 'navigate':
                this.navigatePage();
                break;
            case 'read':
                this.readContent();
                break;
            case 'emergency':
                this.showEmergencyHelp();
                break;
            case 'news':
                this.showNewsHelp();
                break;
            case 'help':
                this.showHelp();
                break;
            case 'settings':
                this.openAccessibilitySettings();
                break;
        }
    }

    showNewsHelp() {
        const newsMessage = this.currentLanguage === 'en' 
            ? `News section features:
• Latest news from multiple countries
• Auto-read for deaf users
• Category filtering (Technology, Health, Education, Disability, Accessibility)
• Voice commands: "read news", "latest news", "news update"
• Press Alt + N to toggle auto-read mode

I can help you navigate to the news section or read the latest headlines. What would you like to know?`
            : `समाचार खण्डका सुविधाहरू:
• धेरै देशहरूबाट नवीनतम समाचार
• बहिरा प्रयोगकर्ताहरूका लागि स्वचालित पढाइ
• श्रेणी फिल्टरिङ (प्रविधि, स्वास्थ्य, शिक्षा, अपाङ्गता, सुलभता)
• आवाज आदेश: "read news", "latest news", "news update"
• स्वचालित पढाइ मोड टगल गर्न Alt + N थिच्नुहोस्

म तपाईंलाई समाचार खण्डमा नेविगेट गर्न वा नवीनतम शीर्षकहरू पढ्न मद्दत गर्न सक्छु। तपाईं के जान्न चाहनुहुन्छ?`;

        this.addMessage(newsMessage, 'ai');
        
        if (this.isBlindUser) {
            this.speakForBlindUser(newsMessage);
        } else {
            this.speak(newsMessage);
        }
    }

    showEmergencyHelp() {
        const emergencyMessage = this.currentLanguage === 'en' 
            ? `Emergency services available:
• Police: 100
• Fire: 101  
• Ambulance: 102
• Disability Support: +977 9768442380
• Medical Emergency: +977 9768442380

I can help you navigate to the emergency section or call these numbers. What do you need?`
            : `आपतकालीन सेवाहरू उपलब्ध:
• प्रहरी: १००
• आगो: १०१
• एम्बुलेन्स: १०२
• अपाङ्गता सहयोग: +९७७ ९७६८४४२३८०
• चिकित्सा आपतकाल: +९७७ ९७६८४४२३८०

म तपाईंलाई आपतकालीन खण्डमा नेविगेट गर्न वा यी नम्बरहरू कल गर्न मद्दत गर्न सक्छु। तपाईंलाई के चाहिएको छ?`;

        this.addMessage(emergencyMessage, 'ai');
        
        if (this.isBlindUser) {
            this.speakForBlindUser(emergencyMessage);
        } else {
            this.speak(emergencyMessage);
        }
    }

    navigatePage() {
        const sections = document.querySelectorAll('section[id]');
        const sectionNames = Array.from(sections).map(s => ({
            id: s.id,
            title: s.querySelector('h1, h2, h3')?.textContent || s.id
        }));

        const message = this.currentLanguage === 'en' 
            ? `Available sections: ${sectionNames.map(s => s.title).join(', ')}. Use Tab to navigate or say "go to [section name]" to jump to a specific section. For news, say "news" or "read news".`
            : `उपलब्ध खण्डहरू: ${sectionNames.map(s => s.title).join(', ')}। नेविगेट गर्न ट्याब प्रयोग गर्नुहोस् वा कुनै विशिष्ट खण्डमा जान "go to [खण्डको नाम]" भन्नुहोस्। समाचारका लागि "news" वा "read news" भन्नुहोस्।`;

        this.addMessage(message, 'ai');
        this.speak(message);
    }

    readContent() {
        const focusedElement = document.activeElement;
        let content = '';
        
        if (focusedElement && focusedElement.textContent) {
            content = focusedElement.textContent;
        } else {
            // Read the main content
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
• Emergency Services: Say "emergency" for immediate help
• Latest News: Say "news" or "read news" for current headlines
• Navigation: Say "navigate" or "go to [section]"
• Reading: Say "read" or "read content"
• Voice commands: Enable voice mode and speak naturally
• Accessibility: Ask about any accessibility features
• Medical Support: Get help with healthcare services
• Transportation: Find accessible transport options
• Education: Access learning resources
• Auto-read: Press Alt + N for deaf users
• Language: Switch between English and Nepali anytime`
            : `म तपाईंलाई यसरी मद्दत गर्न सक्छु:
• आपतकालीन सेवा: तत्काल मद्दतको लागि "emergency" भन्नुहोस्
• नवीनतम समाचार: वर्तमान शीर्षकहरूका लागि "news" वा "read news" भन्नुहोस्
• नेविगेसन: "navigate" वा "go to [खण्ड]" भन्नुहोस्
• पढाइ: "read" वा "read content" भन्नुहोस्
• आवाज आदेश: आवाज मोड सक्षम गर्नुहोस् र प्राकृतिक रूपमा बोल्नुहोस्
• सुलभता: कुनै पनि सुलभता सुविधाहरूको बारेमा सोध्नुहोस्
• चिकित्सा सहयोग: स्वास्थ्य सेवाहरूसँग मद्दत पाउनुहोस्
• यातायात: सुलभ यातायात विकल्पहरू फेला पार्नुहोस्
• शिक्षा: सिकाइ स्रोतहरू पहुँच गर्नुहोस्
• स्वचालित पढाइ: बहिरा प्रयोगकर्ताहरूका लागि Alt + N थिच्नुहोस्
• भाषा: कहिले पनि अंग्रेजी र नेपाली बीच स्विच गर्नुहोस्`;

        this.addMessage(helpMessage, 'ai');
        
        if (this.isBlindUser) {
            this.speakForBlindUser(helpMessage);
        } else {
            this.speak(helpMessage);
        }
    }

    openAccessibilitySettings() {
        // Focus on accessibility controls
        const controls = document.querySelector('.accessibility-controls');
        if (controls) {
            controls.scrollIntoView({ behavior: 'smooth' });
            const firstButton = controls.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }

        const message = this.currentLanguage === 'en' 
            ? "Accessibility settings are now in focus. Use Tab to navigate through the controls."
            : "सुलभता सेटिङहरू अब फोकसमा छन्। नियन्त्रणहरू मार्फत नेविगेट गर्न ट्याब प्रयोग गर्नुहोस्।";

        this.addMessage(message, 'ai');
        this.speak(message);
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage(message, 'user');
            input.value = '';
            this.handleCommand(message);
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
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    speak(text) {
        if (!this.isTTSEnabled || !this.synthesis) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Use enhanced TTS settings
        utterance.rate = this.ttsSettings.rate;
        utterance.pitch = this.ttsSettings.pitch;
        utterance.volume = this.ttsSettings.volume;
        utterance.lang = this.currentLanguage === 'en' ? 'en-US' : 'ne-NP';

        // Set voice based on language and user needs
        if (this.currentLanguage === 'ne' && this.nepaliVoice) {
            utterance.voice = this.nepaliVoice;
        } else if (this.englishVoice) {
            utterance.voice = this.englishVoice;
        }

        // Enhanced event handlers for better accessibility
        utterance.onstart = () => {
            this.updateStatus('speaking');
        };

        utterance.onend = () => {
            this.updateStatus('ready');
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event.error);
            this.updateStatus('ready');
        };

        this.synthesis.speak(utterance);
    }

    // Enhanced speak function for blind users with better pacing
    speakForBlindUser(text) {
        if (!this.isTTSEnabled || !this.synthesis) return;

        // For blind users, speak more slowly and clearly
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8; // Slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 0.9; // Louder for better hearing
        utterance.lang = this.currentLanguage === 'en' ? 'en-US' : 'ne-NP';

        // Use the best available voice
        if (this.currentLanguage === 'ne' && this.nepaliVoice) {
            utterance.voice = this.nepaliVoice;
        } else if (this.englishVoice) {
            utterance.voice = this.englishVoice;
        }

        this.synthesis.speak(utterance);
    }

    setThinking(thinking) {
        this.isThinking = thinking;
        const statusDot = document.getElementById('ai-status');
        const statusText = document.getElementById('status-text');
        
        if (thinking) {
            statusDot.classList.add('thinking');
            statusText.textContent = this.t('aiThinking');
        } else {
            statusDot.classList.remove('thinking');
            statusText.textContent = this.t('aiReady');
        }
    }

    updateStatus(status) {
        const statusText = document.getElementById('status-text');
        const statusDot = document.getElementById('ai-status');
        
        statusDot.className = 'status-dot';
        
        switch (status) {
            case 'listening':
                statusText.textContent = this.t('listening');
                statusDot.style.background = '#ffc107'; // Yellow for listening
                break;
            case 'speaking':
                statusText.textContent = this.currentLanguage === 'en' ? 'Speaking...' : 'बोल्दैछु...';
                statusDot.style.background = '#17a2b8'; // Blue for speaking
                break;
            case 'thinking':
                statusText.textContent = this.t('aiThinking');
                statusDot.classList.add('thinking');
                statusDot.style.background = '#ffc107'; // Yellow for thinking
                break;
            case 'ready':
            default:
                statusText.textContent = this.t('aiReady');
                statusDot.style.background = '#28a745'; // Green for ready
                break;
        }
    }

    updateUI() {
        // Update all elements with data attributes
        document.querySelectorAll('[data-en], [data-ne]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update placeholders and labels
        document.getElementById('chat-input').placeholder = this.t('typeMessage');
        document.getElementById('sewa-sathi-toggle').setAttribute('aria-label', this.t('openAssistant'));
        document.getElementById('sewa-sathi-close').setAttribute('aria-label', this.t('closeAssistant'));
        document.getElementById('send-message').setAttribute('aria-label', this.t('sendMessage'));
    }

    showError(message) {
        this.addMessage(message, 'ai');
        this.speak(message);
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || this.translations.en[key] || key;
    }

    saveSettings() {
        const settings = {
            language: this.currentLanguage,
            voiceEnabled: this.isVoiceEnabled,
            ttsEnabled: this.isTTSEnabled,
            geminiApiKey: this.geminiApiKey
        };
        localStorage.setItem('sewa-sathi-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('sewa-sathi-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.currentLanguage = settings.language || 'en';
                this.isVoiceEnabled = settings.voiceEnabled || false;
                this.isTTSEnabled = settings.ttsEnabled !== false; // Default to true
                this.geminiApiKey = settings.geminiApiKey || null;
            } catch (e) {
                console.warn('Could not load Sewa Sathi settings:', e);
            }
        }
    }

    // Method to set Gemini API key (can be called from console or settings)
    setApiKey(key) {
        this.geminiApiKey = key;
        this.saveSettings();
        this.addMessage(this.t('apiKeySet'), 'ai');
    }

    // Touch control methods
    enableTouchControl() {
        document.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    handleTouch(event) {
        if (this.isOpen && this.isVoiceEnabled) {
            // Guide user through touch interactions
            const target = event.target;
            const description = this.describeElement(target);
            this.speak(description);
        }
    }

    handleTouchEnd(event) {
        // Handle touch end if needed
    }

    describeElement(element) {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim();
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        
        let description = '';
        
        if (ariaLabel) {
            description = ariaLabel;
        } else if (text && text.length < 50) {
            description = `${tagName}: ${text}`;
        } else if (role) {
            description = `${role} element`;
        } else {
            description = `${tagName} element`;
        }
        
        return this.currentLanguage === 'en' 
            ? `Touched: ${description}`
            : `छोएको: ${description}`;
    }
}

// Initialize Sewa Sathi when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sewaSathi = new SewaSathi();
    
    // Announce that Sewa Sathi is ready with AI capabilities
    setTimeout(() => {
        if (window.sewaSathi) {
            const welcomeMessage = "Sewa Sathi is ready! I'm your AI accessibility assistant focused on helping with emergency services, medical support, transportation, education, and latest news. I can speak and listen to help you navigate the website. Try saying 'help', 'emergency', or 'news' to get started!";
            window.sewaSathi.addMessage(welcomeMessage, 'ai');
            
            // Speak the welcome message for blind users
            if (window.sewaSathi.isBlindUser) {
                window.sewaSathi.speakForBlindUser(welcomeMessage);
            } else {
                window.sewaSathi.speak(welcomeMessage);
            }
        }
    }, 2000);
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SewaSathi;
}
