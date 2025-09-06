// Touch-to-Speech Library for Hearing Impaired Users
class TouchToSpeech {
    constructor(options = {}) {
        this.isEnabled = false;
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.settings = {
            rate: options.rate || 0.9,
            pitch: options.pitch || 1,
            volume: options.volume || 0.8,
            language: options.language || 'en-US',
            delay: options.delay || 100, // Delay before speaking to avoid rapid fire
            hoverDelay: options.hoverDelay || 500, // Delay for hover events
            ...options
        };
        
        this.hoverTimeout = null;
        this.lastSpokenText = '';
        this.isSpeaking = false;
        this.voices = [];
        this.selectedVoice = null;
        
        this.init();
    }

    init() {
        this.loadVoices();
        this.setupEventListeners();
        this.createControlPanel();
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
        this.selectedVoice = this.voices.find(voice => 
            voice.lang.startsWith(this.settings.language.split('-')[0])
        ) || this.voices[0];
        
        this.synthesis.onvoiceschanged = () => {
            this.voices = this.synthesis.getVoices();
            this.selectedVoice = this.voices.find(voice => 
                voice.lang.startsWith(this.settings.language.split('-')[0])
            ) || this.voices[0];
        };
    }

    setupEventListeners() {
        // Touch events for mobile devices
        document.addEventListener('touchstart', (e) => {
            if (this.isEnabled) {
                this.handleTouch(e);
            }
        }, { passive: true });

        // Mouse hover events for desktop
        document.addEventListener('mouseover', (e) => {
            if (this.isEnabled) {
                this.handleHover(e);
            }
        });

        // Mouse leave events to stop speaking
        document.addEventListener('mouseout', (e) => {
            if (this.isEnabled) {
                this.handleMouseLeave(e);
            }
        });

        // Focus events for keyboard navigation
        document.addEventListener('focusin', (e) => {
            if (this.isEnabled) {
                this.handleFocus(e);
            }
        });

        // Click events for interactive elements
        document.addEventListener('click', (e) => {
            if (this.isEnabled) {
                this.handleClick(e);
            }
        });
    }

    handleTouch(e) {
        const element = e.target;
        const text = this.extractText(element);
        
        if (text && text !== this.lastSpokenText) {
            this.speakText(text);
            this.lastSpokenText = text;
        }
    }

    handleHover(e) {
        const element = e.target;
        
        // Clear previous timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }

        // Set new timeout for hover delay
        this.hoverTimeout = setTimeout(() => {
            const text = this.extractText(element);
            if (text && text !== this.lastSpokenText) {
                this.speakText(text);
                this.lastSpokenText = text;
            }
        }, this.settings.hoverDelay);
    }

    handleMouseLeave(e) {
        // Clear hover timeout when mouse leaves
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
    }

    handleFocus(e) {
        const element = e.target;
        const text = this.extractText(element);
        
        if (text && text !== this.lastSpokenText) {
            this.speakText(text);
            this.lastSpokenText = text;
        }
    }

    handleClick(e) {
        const element = e.target;
        const text = this.extractText(element);
        
        if (text) {
            this.speakText(text);
            this.lastSpokenText = text;
        }
    }

    extractText(element) {
        // Skip if element is not visible
        if (!this.isElementVisible(element)) {
            return null;
        }

        // Get text content based on element type
        let text = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            // For form elements, get placeholder or value
            text = element.placeholder || element.value || element.getAttribute('aria-label') || '';
        } else if (element.tagName === 'IMG') {
            // For images, get alt text
            text = element.alt || element.getAttribute('aria-label') || '';
        } else if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            // For buttons and links, get text content and aria-label
            text = element.textContent.trim() || element.getAttribute('aria-label') || element.title || '';
        } else if (element.hasAttribute('aria-label')) {
            // For elements with aria-label
            text = element.getAttribute('aria-label');
        } else if (element.textContent) {
            // For other elements, get text content
            text = element.textContent.trim();
        }

        // Clean up text
        text = this.cleanText(text);
        
        // Only speak if text is meaningful
        return this.isMeaningfulText(text) ? text : null;
    }

    cleanText(text) {
        if (!text) return '';
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        // Remove common non-meaningful text
        const skipPatterns = [
            /^[\s\n\r]*$/,
            /^[0-9\s\-\(\)]+$/,
            /^[^\w\s]*$/,
            /^(click|tap|press|button|link)$/i
        ];
        
        for (const pattern of skipPatterns) {
            if (pattern.test(text)) {
                return '';
            }
        }
        
        return text;
    }

    isMeaningfulText(text) {
        if (!text || text.length < 2) return false;
        
        // Check if text contains meaningful content
        const meaningfulPatterns = [
            /[a-zA-Z]/, // Contains letters
            /[0-9]/, // Contains numbers
            /[^\s\w]/, // Contains punctuation
        ];
        
        return meaningfulPatterns.some(pattern => pattern.test(text));
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    speakText(text) {
        if (!text || this.isSpeaking) return;

        // Stop current speech
        this.synthesis.cancel();

        // Create new utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.rate = this.settings.rate;
        this.currentUtterance.pitch = this.settings.pitch;
        this.currentUtterance.volume = this.settings.volume;
        this.currentUtterance.lang = this.settings.language;
        
        if (this.selectedVoice) {
            this.currentUtterance.voice = this.selectedVoice;
        }

        // Event handlers
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.showSpeakingIndicator();
        };

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };

        this.currentUtterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            this.isSpeaking = false;
            this.hideSpeakingIndicator();
        };

        // Speak the text
        this.synthesis.speak(this.currentUtterance);
    }

    showSpeakingIndicator() {
        // Create or update speaking indicator
        let indicator = document.getElementById('touch-to-speech-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'touch-to-speech-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.innerHTML = '🔊 Speaking...';
        indicator.style.display = 'flex';
    }

    hideSpeakingIndicator() {
        const indicator = document.getElementById('touch-to-speech-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    createControlPanel() {
        // Create control panel for touch-to-speech settings
        const panel = document.createElement('div');
        panel.id = 'touch-to-speech-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--bg-primary);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 15px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            display: none;
            min-width: 250px;
        `;

        panel.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: var(--text-primary);">Touch-to-Speech Settings</h4>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--text-secondary);">
                    Speech Rate: <span id="rate-value">${this.settings.rate}</span>
                </label>
                <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="${this.settings.rate}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--text-secondary);">
                    Volume: <span id="volume-value">${Math.round(this.settings.volume * 100)}%</span>
                </label>
                <input type="range" id="speech-volume" min="0" max="1" step="0.1" value="${this.settings.volume}" 
                       style="width: 100%;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: var(--text-secondary);">
                    Language:
                </label>
                <select id="speech-language" style="width: 100%; padding: 5px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="ne-NP">नेपाली (Nepali)</option>
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button id="test-speech" style="flex: 1; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Test
                </button>
                <button id="close-panel" style="flex: 1; padding: 8px; background: var(--secondary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(panel);
        this.setupControlPanelEvents();
    }

    setupControlPanelEvents() {
        const panel = document.getElementById('touch-to-speech-panel');
        const rateSlider = document.getElementById('speech-rate');
        const volumeSlider = document.getElementById('speech-volume');
        const languageSelect = document.getElementById('speech-language');
        const testButton = document.getElementById('test-speech');
        const closeButton = document.getElementById('close-panel');

        // Rate slider
        rateSlider.addEventListener('input', (e) => {
            this.settings.rate = parseFloat(e.target.value);
            document.getElementById('rate-value').textContent = this.settings.rate;
        });

        // Volume slider
        volumeSlider.addEventListener('input', (e) => {
            this.settings.volume = parseFloat(e.target.value);
            document.getElementById('volume-value').textContent = Math.round(this.settings.volume * 100) + '%';
        });

        // Language select
        languageSelect.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.loadVoices();
        });

        // Test button
        testButton.addEventListener('click', () => {
            this.speakText('Touch-to-speech is working! Touch any text to hear it spoken aloud.');
        });

        // Close button
        closeButton.addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }

    // Public methods
    enable() {
        this.isEnabled = true;
        this.showControlButton();
        this.speakText('Touch-to-speech enabled. Touch any text to hear it spoken aloud.');
    }

    disable() {
        this.isEnabled = false;
        this.synthesis.cancel();
        this.hideControlButton();
        this.hideSpeakingIndicator();
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    showControlButton() {
        let button = document.getElementById('touch-to-speech-button');
        if (!button) {
            button = document.createElement('button');
            button.id = 'touch-to-speech-button';
            button.innerHTML = '🔊';
            button.title = 'Touch-to-Speech';
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                font-size: 20px;
                cursor: pointer;
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                transition: all 0.3s ease;
            `;
            
            button.addEventListener('click', () => {
                const panel = document.getElementById('touch-to-speech-panel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            });
            
            document.body.appendChild(button);
        }
        button.style.display = 'block';
    }

    hideControlButton() {
        const button = document.getElementById('touch-to-speech-button');
        if (button) {
            button.style.display = 'none';
        }
    }

    // Settings methods
    setRate(rate) {
        this.settings.rate = Math.max(0.5, Math.min(2, rate));
    }

    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
    }

    setLanguage(language) {
        this.settings.language = language;
        this.loadVoices();
    }

    // Get current settings
    getSettings() {
        return { ...this.settings };
    }

    // Check if enabled
    isTouchToSpeechEnabled() {
        return this.isEnabled;
    }
}

// Initialize touch-to-speech when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.touchToSpeech = new TouchToSpeech({
        rate: 0.9,
        pitch: 1,
        volume: 0.8,
        language: 'en-US',
        delay: 100,
        hoverDelay: 500
    });
    
    // Auto-enable if user has hearing impairment preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasHearingImpairment = localStorage.getItem('hearing-impairment') === 'true';
    
    if (hasHearingImpairment || prefersReducedMotion) {
        window.touchToSpeech.enable();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchToSpeech;
}

