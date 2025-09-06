// Advanced Voice Command Library with Auto-Touch Capabilities
class VoiceCommandLibrary {
    constructor(options = {}) {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isEnabled = false;
        this.commands = new Map();
        this.autoTouchEnabled = options.autoTouch || false;
        this.language = options.language || 'en-US';
        this.confidenceThreshold = options.confidenceThreshold || 0.7;
        this.callbacks = {
            onCommand: null,
            onListening: null,
            onError: null,
            onResult: null
        };
        
        this.init();
    }

    init() {
        this.setupSpeechRecognition();
        this.setupDefaultCommands();
        this.setupAutoTouch();
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.language;
            this.recognition.maxAlternatives = 3;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.triggerCallback('onListening', { status: 'started' });
            };

            this.recognition.onresult = (event) => {
                this.processRecognitionResult(event);
            };

            this.recognition.onerror = (event) => {
                this.triggerCallback('onError', { error: event.error });
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.triggerCallback('onListening', { status: 'stopped' });
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupDefaultCommands() {
        // Navigation commands
        this.addCommand('navigate to (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeNavigation(target);
        });

        this.addCommand('go to (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeNavigation(target);
        });

        this.addCommand('show me (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeNavigation(target);
        });

        // Action commands
        this.addCommand('click (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeClick(target);
        });

        this.addCommand('tap (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeClick(target);
        });

        this.addCommand('press (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeClick(target);
        });

        // Reading commands
        this.addCommand('read (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeRead(target);
        });

        this.addCommand('speak (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeRead(target);
        });

        // Form commands
        this.addCommand('type (.*) in (.*)', (match) => {
            const text = match[1];
            const field = match[2].toLowerCase();
            this.executeType(text, field);
        });

        this.addCommand('fill (.*) with (.*)', (match) => {
            const field = match[1].toLowerCase();
            const text = match[2];
            this.executeType(text, field);
        });

        // Scroll commands
        this.addCommand('scroll (up|down|left|right)', (match) => {
            const direction = match[1];
            this.executeScroll(direction);
        });

        this.addCommand('scroll to (.*)', (match) => {
            const target = match[1].toLowerCase();
            this.executeScrollTo(target);
        });

        // General commands
        this.addCommand('help', () => {
            this.executeHelp();
        });

        this.addCommand('close', () => {
            this.executeClose();
        });

        this.addCommand('back', () => {
            this.executeBack();
        });

        this.addCommand('refresh', () => {
            this.executeRefresh();
        });
    }

    setupAutoTouch() {
        if (this.autoTouchEnabled) {
            // Enable touch simulation for voice commands
            this.touchSimulator = new TouchSimulator();
        }
    }

    addCommand(pattern, handler, options = {}) {
        const command = {
            pattern: new RegExp(pattern, 'i'),
            handler,
            options: {
                confidence: options.confidence || this.confidenceThreshold,
                description: options.description || pattern,
                category: options.category || 'general'
            }
        };
        
        this.commands.set(pattern, command);
    }

    removeCommand(pattern) {
        this.commands.delete(pattern);
    }

    processRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        this.triggerCallback('onResult', {
            final: finalTranscript,
            interim: interimTranscript,
            confidence: event.results[0][0].confidence
        });

        if (finalTranscript) {
            this.processCommand(finalTranscript);
        }
    }

    processCommand(transcript) {
        const normalizedTranscript = transcript.toLowerCase().trim();
        let commandExecuted = false;

        for (const [pattern, command] of this.commands) {
            const match = normalizedTranscript.match(command.pattern);
            if (match) {
                try {
                    command.handler(match);
                    commandExecuted = true;
                    this.triggerCallback('onCommand', {
                        pattern,
                        transcript,
                        match,
                        command: command.options
                    });
                    break;
                } catch (error) {
                    console.error('Command execution error:', error);
                    this.triggerCallback('onError', { error: 'Command execution failed' });
                }
            }
        }

        if (!commandExecuted) {
            this.triggerCallback('onCommand', {
                pattern: 'unknown',
                transcript,
                match: null,
                command: null
            });
        }
    }

    // Command execution methods
    executeNavigation(target) {
        const sectionMap = {
            'home': 'home',
            'main': 'home',
            'features': 'features',
            'feature': 'features',
            'resources': 'resources',
            'resource': 'resources',
            'contact': 'contact',
            'about': 'contact',
            'help': 'contact'
        };

        const sectionId = sectionMap[target] || target;
        const element = document.getElementById(sectionId);
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            element.focus();
            this.speak(`Navigating to ${sectionId} section`);
        } else {
            this.speak(`Section ${target} not found`);
        }
    }

    executeClick(target) {
        const element = this.findElement(target);
        if (element) {
            if (this.autoTouchEnabled && this.touchSimulator) {
                this.touchSimulator.simulateClick(element);
            } else {
                element.click();
            }
            this.speak(`Clicked ${target}`);
        } else {
            this.speak(`${target} not found`);
        }
    }

    executeRead(target) {
        const element = this.findElement(target);
        if (element) {
            const text = element.textContent || element.value || element.placeholder;
            this.speak(text);
        } else {
            this.speak(`${target} not found`);
        }
    }

    executeType(text, field) {
        const element = this.findInputElement(field);
        if (element) {
            element.focus();
            element.value = text;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            this.speak(`Typed ${text} in ${field}`);
        } else {
            this.speak(`Input field ${field} not found`);
        }
    }

    executeScroll(direction) {
        const scrollAmount = 200;
        switch (direction) {
            case 'up':
                window.scrollBy(0, -scrollAmount);
                break;
            case 'down':
                window.scrollBy(0, scrollAmount);
                break;
            case 'left':
                window.scrollBy(-scrollAmount, 0);
                break;
            case 'right':
                window.scrollBy(scrollAmount, 0);
                break;
        }
        this.speak(`Scrolled ${direction}`);
    }

    executeScrollTo(target) {
        const element = this.findElement(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.speak(`Scrolled to ${target}`);
        } else {
            this.speak(`${target} not found`);
        }
    }

    executeHelp() {
        this.speak('Available voice commands: navigate, click, read, type, scroll, help, close, back, refresh');
    }

    executeClose() {
        const closeButtons = document.querySelectorAll('[aria-label*="close"], [aria-label*="Close"], .close-btn');
        if (closeButtons.length > 0) {
            closeButtons[0].click();
            this.speak('Closed');
        } else {
            this.speak('No close button found');
        }
    }

    executeBack() {
        if (window.history.length > 1) {
            window.history.back();
            this.speak('Going back');
        } else {
            this.speak('Cannot go back');
        }
    }

    executeRefresh() {
        window.location.reload();
    }

    // Element finding utilities
    findElement(target) {
        // Try by ID first
        let element = document.getElementById(target);
        if (element) return element;

        // Try by class
        element = document.querySelector(`.${target}`);
        if (element) return element;

        // Try by aria-label
        element = document.querySelector(`[aria-label*="${target}"]`);
        if (element) return element;

        // Try by text content
        const elements = Array.from(document.querySelectorAll('*'));
        element = elements.find(el => 
            el.textContent && el.textContent.toLowerCase().includes(target)
        );
        if (element) return element;

        return null;
    }

    findInputElement(field) {
        // Try by name
        let element = document.querySelector(`input[name*="${field}"], textarea[name*="${field}"]`);
        if (element) return element;

        // Try by placeholder
        element = document.querySelector(`input[placeholder*="${field}"], textarea[placeholder*="${field}"]`);
        if (element) return element;

        // Try by label
        const labels = document.querySelectorAll('label');
        for (const label of labels) {
            if (label.textContent.toLowerCase().includes(field)) {
                const input = document.getElementById(label.getAttribute('for'));
                if (input) return input;
            }
        }

        return null;
    }

    // Touch simulation
    simulateTouch(element) {
        if (this.autoTouchEnabled && this.touchSimulator) {
            this.touchSimulator.simulateTouch(element);
        }
    }

    // Speech synthesis
    speak(text, options = {}) {
        if (!this.synthesis) return;

        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 0.8;
        utterance.lang = this.language;

        this.synthesis.speak(utterance);
    }

    // Control methods
    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.stopListening();
    }

    // Callback management
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = callback;
        }
    }

    triggerCallback(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event](data);
        }
    }

    // Configuration
    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = threshold;
    }

    // Get available commands
    getCommands() {
        const commands = [];
        for (const [pattern, command] of this.commands) {
            commands.push({
                pattern,
                description: command.options.description,
                category: command.options.category
            });
        }
        return commands;
    }
}

// Touch Simulator for auto-touch capabilities
class TouchSimulator {
    constructor() {
        this.isEnabled = true;
    }

    simulateClick(element) {
        if (!this.isEnabled) return;

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Create and dispatch touch events
        const touchStart = new TouchEvent('touchstart', {
            touches: [new Touch({
                identifier: 1,
                target: element,
                clientX: x,
                clientY: y
            })]
        });

        const touchEnd = new TouchEvent('touchend', {
            touches: [new Touch({
                identifier: 1,
                target: element,
                clientX: x,
                clientY: y
            })]
        });

        element.dispatchEvent(touchStart);
        setTimeout(() => {
            element.dispatchEvent(touchEnd);
            element.click(); // Fallback for non-touch devices
        }, 100);
    }

    simulateTouch(element) {
        this.simulateClick(element);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceCommandLibrary, TouchSimulator };
}

