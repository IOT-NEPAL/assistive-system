// Enhanced Accessibility Manager with Intelligent User Detection
class EnhancedAccessibilityManager {
    constructor() {
        this.userProfile = null;
        this.isInitialized = false;
        this.apis = {
            tts: null,
            ocr: null,
            speechRecognition: null,
            braille: null
        };
        this.settings = {
            autoTTS: false,
            autoOCR: false,
            voiceCommands: false,
            brailleMode: false,
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            hapticFeedback: false
        };
        
        this.init();
    }

    async init() {
        await this.detectUserNeeds();
        await this.initializeAPIs();
        this.setupEventListeners();
        this.applyUserSpecificSettings();
        this.isInitialized = true;
    }

    async detectUserNeeds() {
        // Check for existing user preferences
        const savedProfile = localStorage.getItem('accessibility-profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
            return;
        }

        // Auto-detect based on browser behavior and system settings
        const detectionResults = await this.performAutoDetection();
        
        // Show user preference modal if auto-detection is inconclusive
        if (!detectionResults.confident) {
            this.showUserPreferenceModal();
        } else {
            this.userProfile = detectionResults.profile;
            this.saveUserProfile();
        }
    }

    async performAutoDetection() {
        const indicators = {
            screenReader: this.detectScreenReader(),
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
            voiceUsage: this.detectVoiceUsage(),
            keyboardNavigation: this.detectKeyboardNavigation()
        };

        // Determine user type based on indicators
        let profile = {
            type: 'general',
            confidence: 0.5,
            needs: []
        };

        if (indicators.screenReader || indicators.voiceUsage) {
            profile.type = 'blind';
            profile.confidence = 0.9;
            profile.needs = ['tts', 'voiceCommands', 'braille', 'keyboardNavigation'];
        } else if (indicators.highContrast || indicators.reducedMotion) {
            profile.type = 'lowVision';
            profile.confidence = 0.8;
            profile.needs = ['highContrast', 'largeText', 'reducedMotion'];
        } else if (indicators.keyboardNavigation) {
            profile.type = 'motorImpaired';
            profile.confidence = 0.7;
            profile.needs = ['keyboardNavigation', 'voiceCommands'];
        }

        return {
            profile,
            confident: profile.confidence > 0.7
        };
    }

    detectScreenReader() {
        // Check for screen reader indicators
        const screenReaderIndicators = [
            'speechSynthesis' in window,
            'webkitSpeechSynthesis' in window,
            navigator.userAgent.includes('NVDA'),
            navigator.userAgent.includes('JAWS'),
            navigator.userAgent.includes('VoiceOver')
        ];
        
        return screenReaderIndicators.some(indicator => indicator);
    }

    detectVoiceUsage() {
        // Check if user has used voice features recently
        const voiceHistory = localStorage.getItem('voice-usage-history');
        return voiceHistory && JSON.parse(voiceHistory).length > 0;
    }

    detectKeyboardNavigation() {
        // Track if user primarily uses keyboard
        let keyboardUsage = 0;
        let mouseUsage = 0;
        
        document.addEventListener('keydown', () => keyboardUsage++);
        document.addEventListener('mousedown', () => mouseUsage++);
        
        return keyboardUsage > mouseUsage;
    }

    showUserPreferenceModal() {
        const modal = document.createElement('div');
        modal.className = 'accessibility-preference-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Accessibility Preferences</h2>
                <p>Please select your accessibility needs to customize your experience:</p>
                
                <div class="preference-options">
                    <div class="option-group">
                        <h3>Visual Impairments</h3>
                        <label class="option-item">
                            <input type="radio" name="visual-impairment" value="blind">
                            <span class="option-text">Complete Blindness</span>
                            <span class="option-description">I need text-to-speech, voice commands, and Braille support</span>
                        </label>
                        <label class="option-item">
                            <input type="radio" name="visual-impairment" value="low-vision">
                            <span class="option-text">Low Vision</span>
                            <span class="option-description">I need larger text, high contrast, and magnification</span>
                        </label>
                        <label class="option-item">
                            <input type="radio" name="visual-impairment" value="colorblind">
                            <span class="option-text">Color Blindness</span>
                            <span class="option-description">I need color alternatives and high contrast</span>
                        </label>
                    </div>
                    
                    <div class="option-group">
                        <h3>Motor Impairments</h3>
                        <label class="option-item">
                            <input type="radio" name="motor-impairment" value="keyboard-only">
                            <span class="option-text">Keyboard Only</span>
                            <span class="option-description">I navigate using only the keyboard</span>
                        </label>
                        <label class="option-item">
                            <input type="radio" name="motor-impairment" value="voice-control">
                            <span class="option-text">Voice Control</span>
                            <span class="option-description">I prefer voice commands for navigation</span>
                        </label>
                    </div>
                    
                    <div class="option-group">
                        <h3>General Preferences</h3>
                        <label class="option-item">
                            <input type="radio" name="general" value="standard">
                            <span class="option-text">Standard Experience</span>
                            <span class="option-description">I don't need special accessibility features</span>
                        </label>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button id="save-preferences" class="btn btn-primary">Save Preferences</button>
                    <button id="skip-preferences" class="btn btn-secondary">Skip</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle preference saving
        document.getElementById('save-preferences').addEventListener('click', () => {
            this.saveUserPreferences(modal);
        });
        
        document.getElementById('skip-preferences').addEventListener('click', () => {
            this.userProfile = { type: 'general', needs: [] };
            this.saveUserProfile();
            modal.remove();
        });
    }

    saveUserPreferences(modal) {
        const visualImpairment = modal.querySelector('input[name="visual-impairment"]:checked')?.value;
        const motorImpairment = modal.querySelector('input[name="motor-impairment"]:checked')?.value;
        const general = modal.querySelector('input[name="general"]:checked')?.value;
        
        let needs = [];
        let type = 'general';
        
        if (visualImpairment === 'blind') {
            type = 'blind';
            needs = ['tts', 'voiceCommands', 'braille', 'keyboardNavigation'];
        } else if (visualImpairment === 'low-vision') {
            type = 'lowVision';
            needs = ['highContrast', 'largeText', 'reducedMotion'];
        } else if (visualImpairment === 'colorblind') {
            type = 'colorblind';
            needs = ['highContrast', 'colorAlternatives'];
        }
        
        if (motorImpairment === 'keyboard-only') {
            needs.push('keyboardNavigation');
        } else if (motorImpairment === 'voice-control') {
            needs.push('voiceCommands');
        }
        
        this.userProfile = { type, needs };
        this.saveUserProfile();
        modal.remove();
    }

    async initializeAPIs() {
        // Initialize free TTS API (using Web Speech API)
        this.apis.tts = this.initializeTTS();
        
        // Initialize free OCR API (using Tesseract.js)
        this.apis.ocr = await this.initializeOCR();
        
        // Initialize speech recognition
        this.apis.speechRecognition = this.initializeSpeechRecognition();
        
        // Initialize Braille support
        this.apis.braille = this.initializeBraille();
    }

    initializeTTS() {
        if (!('speechSynthesis' in window)) {
            console.warn('TTS not supported');
            return null;
        }
        
        return {
            speak: (text, options = {}) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = options.rate || 0.9;
                utterance.pitch = options.pitch || 1.0;
                utterance.volume = options.volume || 0.8;
                utterance.lang = options.lang || 'en-US';
                
                // Use the best available voice
                const voices = speechSynthesis.getVoices();
                const preferredVoice = voices.find(voice => 
                    voice.lang.startsWith('en') && voice.name.includes('Google')
                ) || voices.find(voice => voice.lang.startsWith('en'));
                
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
                
                speechSynthesis.speak(utterance);
            },
            
            stop: () => {
                speechSynthesis.cancel();
            }
        };
    }

    async initializeOCR() {
        // Load Tesseract.js for free OCR functionality
        try {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = () => {
                    resolve({
                        recognize: async (imageElement) => {
                            const { data: { text } } = await Tesseract.recognize(imageElement, 'eng');
                            return text;
                        }
                    });
                };
            });
        } catch (error) {
            console.warn('OCR not available:', error);
            return null;
        }
    }

    initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return null;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        return {
            start: (onResult, onError) => {
                recognition.onresult = onResult;
                recognition.onerror = onError;
                recognition.start();
            },
            stop: () => {
                recognition.stop();
            }
        };
    }

    initializeBraille() {
        // Braille character mapping
        const brailleMap = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋',
            'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇',
            'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗',
            's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
            'y': '⠽', 'z': '⠵', ' ': '⠀', '.': '⠲', ',': '⠂', '?': '⠦',
            '!': '⠖', '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲',
            '5': '⠢', '6': '⠖', '7': '⠶', '8': '⠦', '9': '⠔'
        };
        
        return {
            convert: (text) => {
                return text.toLowerCase().split('').map(char => brailleMap[char] || char).join('');
            },
            display: (text, element) => {
                const brailleText = this.apis.braille.convert(text);
                element.textContent = brailleText;
                element.setAttribute('aria-label', `Braille: ${text}`);
            }
        };
    }

    applyUserSpecificSettings() {
        if (!this.userProfile) return;
        
        const { type, needs } = this.userProfile;
        
        // Apply settings based on user needs
        if (needs.includes('tts')) {
            this.settings.autoTTS = true;
            this.enableAutoTTS();
        }
        
        if (needs.includes('highContrast')) {
            this.settings.highContrast = true;
            this.enableHighContrast();
        }
        
        if (needs.includes('largeText')) {
            this.settings.largeText = true;
            this.enableLargeText();
        }
        
        if (needs.includes('voiceCommands')) {
            this.settings.voiceCommands = true;
            this.enableVoiceCommands();
        }
        
        if (needs.includes('braille')) {
            this.settings.brailleMode = true;
            this.enableBrailleMode();
        }
        
        if (needs.includes('reducedMotion')) {
            this.settings.reducedMotion = true;
            this.enableReducedMotion();
        }
        
        if (needs.includes('keyboardNavigation')) {
            this.enableKeyboardNavigation();
        }
        
        // Announce the applied settings
        this.announceSettings();
    }

    enableAutoTTS() {
        // Auto-read content when it changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                            this.apis.tts?.speak(node.textContent);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enableHighContrast() {
        document.body.classList.add('high-contrast');
    }

    enableLargeText() {
        document.body.classList.add('large-text');
    }

    enableVoiceCommands() {
        if (!this.apis.speechRecognition) return;
        
        // Add voice command button
        const voiceButton = document.createElement('button');
        voiceButton.id = 'voice-command-btn';
        voiceButton.className = 'voice-command-btn';
        voiceButton.innerHTML = '🎤 Voice Commands';
        voiceButton.addEventListener('click', () => {
            this.startVoiceCommand();
        });
        
        document.querySelector('.accessibility-controls .control-group').appendChild(voiceButton);
    }

    enableBrailleMode() {
        // Add Braille display for important content
        const brailleElements = document.querySelectorAll('[data-braille]');
        brailleElements.forEach(element => {
            const brailleDisplay = document.createElement('div');
            brailleDisplay.className = 'braille-display';
            brailleDisplay.setAttribute('aria-label', 'Braille display');
            this.apis.braille?.display(element.textContent, brailleDisplay);
            element.appendChild(brailleDisplay);
        });
    }

    enableReducedMotion() {
        document.body.classList.add('reduced-motion');
    }

    enableKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        this.toggleHighContrast();
                        break;
                    case 't':
                        e.preventDefault();
                        this.toggleTTS();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.toggleBraille();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.startVoiceCommand();
                        break;
                }
            }
        });
    }

    startVoiceCommand() {
        if (!this.apis.speechRecognition) return;
        
        this.apis.speechRecognition.start(
            (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            },
            (error) => {
                console.error('Voice recognition error:', error);
            }
        );
    }

    processVoiceCommand(command) {
        // Process voice commands based on user profile
        if (command.includes('read') || command.includes('speak')) {
            this.readCurrentContent();
        } else if (command.includes('navigate') || command.includes('go to')) {
            this.navigateWithVoice(command);
        } else if (command.includes('emergency')) {
            this.handleEmergencyVoice(command);
        } else if (command.includes('help')) {
            this.showVoiceHelp();
        }
    }

    readCurrentContent() {
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.textContent) {
            this.apis.tts?.speak(focusedElement.textContent);
        } else {
            const mainContent = document.querySelector('main');
            if (mainContent) {
                this.apis.tts?.speak(mainContent.textContent.substring(0, 500));
            }
        }
    }

    navigateWithVoice(command) {
        const sections = document.querySelectorAll('section[id]');
        for (const section of sections) {
            if (command.includes(section.id)) {
                section.scrollIntoView({ behavior: 'smooth' });
                section.focus();
                this.apis.tts?.speak(`Navigated to ${section.id} section`);
                break;
            }
        }
    }

    handleEmergencyVoice(command) {
        if (command.includes('police')) {
            this.callEmergency('100');
        } else if (command.includes('fire')) {
            this.callEmergency('101');
        } else if (command.includes('ambulance')) {
            this.callEmergency('102');
        } else {
            this.callEmergency('9768442380'); // Disability support
        }
    }

    showVoiceHelp() {
        const helpText = `
            Available voice commands:
            - Say "read" to read current content
            - Say "navigate to [section]" to go to a section
            - Say "emergency police" to call police
            - Say "emergency fire" to call fire department
            - Say "emergency ambulance" to call ambulance
            - Say "help" to hear this help
        `;
        this.apis.tts?.speak(helpText);
    }

    callEmergency(number) {
        if (confirm(`Calling ${number}. Continue?`)) {
            window.location.href = `tel:${number}`;
        }
    }

    announceSettings() {
        const announcement = `Accessibility settings applied for ${this.userProfile.type} user. ` +
            `Enabled features: ${this.userProfile.needs.join(', ')}`;
        this.apis.tts?.speak(announcement);
    }

    saveUserProfile() {
        localStorage.setItem('accessibility-profile', JSON.stringify(this.userProfile));
    }

    setupEventListeners() {
        // Toggle buttons
        document.getElementById('braille-toggle')?.addEventListener('click', () => this.toggleBraille());
        document.getElementById('haptic-toggle')?.addEventListener('click', () => this.toggleHaptic());
        document.getElementById('focus-indicator')?.addEventListener('click', () => this.toggleFocusIndicator());
        document.getElementById('reduced-motion')?.addEventListener('click', () => this.toggleReducedMotion());
        document.getElementById('voice-commands')?.addEventListener('click', () => this.toggleVoiceCommands());
        document.getElementById('gesture-control')?.addEventListener('click', () => this.toggleGestureControl());
    }

    toggleBraille() {
        this.settings.brailleMode = !this.settings.brailleMode;
        if (this.settings.brailleMode) {
            this.enableBrailleMode();
        } else {
            document.querySelectorAll('.braille-display').forEach(el => el.remove());
        }
    }

    toggleHaptic() {
        this.settings.hapticFeedback = !this.settings.hapticFeedback;
        if (this.settings.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(200);
        }
    }

    toggleFocusIndicator() {
        document.body.classList.toggle('enhanced-focus');
    }

    toggleReducedMotion() {
        this.settings.reducedMotion = !this.settings.reducedMotion;
        document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    }

    toggleVoiceCommands() {
        this.settings.voiceCommands = !this.settings.voiceCommands;
        if (this.settings.voiceCommands) {
            this.enableVoiceCommands();
        }
    }

    toggleGestureControl() {
        // Enable gesture control for touch devices
        if ('ontouchstart' in window) {
            this.enableGestureControl();
        }
    }

    enableGestureControl() {
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) {
                    // Swipe left - previous section
                    this.navigateToPreviousSection();
                } else if (diffX < -50) {
                    // Swipe right - next section
                    this.navigateToNextSection();
                }
            } else {
                if (diffY > 50) {
                    // Swipe up - scroll up
                    window.scrollBy(0, -100);
                } else if (diffY < -50) {
                    // Swipe down - scroll down
                    window.scrollBy(0, 100);
                }
            }
        });
    }

    navigateToPreviousSection() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = sections.findIndex(section => 
            section.getBoundingClientRect().top <= window.innerHeight / 2
        );
        
        if (currentIndex > 0) {
            sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
    }

    navigateToNextSection() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = sections.findIndex(section => 
            section.getBoundingClientRect().top <= window.innerHeight / 2
        );
        
        if (currentIndex < sections.length - 1) {
            sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the enhanced accessibility manager
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedAccessibility = new EnhancedAccessibilityManager();
});

