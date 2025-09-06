// Vision-Based AI Assistant - COCO-SSD + Gemini Integration
class VisionAssistant {
    constructor(sewaSathi) {
        this.sewaSathi = sewaSathi;
        this.model = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.isDetecting = false;
        this.detectionInterval = null;
        this.instructionQueue = [];
        this.isProcessingInstruction = false;
        this.userContext = {
            language: 'en',
            colorblindMode: false,
            previousInstructions: [],
            voiceCommands: [],
            currentUIState: 'idle',
            detectedObjects: [],
            lastDetectionTime: 0
        };
        
        this.init();
    }

    async init() {
        await this.loadCOCOSSD();
        this.setupCamera();
        this.setupVisualOverlay();
        this.setupContextTracking();
    }

    async loadCOCOSSD() {
        try {
            // Load TensorFlow.js and COCO-SSD
            await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@latest/dist/coco-ssd.min.js');
            
            this.model = await cocoSsd.load();
            console.log('COCO-SSD model loaded successfully');
            this.sewaSathi.addMessage("Vision capabilities activated! I can now see and describe what's in front of you.", 'ai');
        } catch (error) {
            console.error('Failed to load COCO-SSD:', error);
            this.sewaSathi.addMessage("Vision features are not available. Please ensure you have a camera and stable internet connection.", 'ai');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupCamera() {
        // Create video element for camera feed
        this.video = document.createElement('video');
        this.video.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            width: 200px;
            height: 150px;
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            z-index: 1001;
            display: none;
            background: #000;
        `;
        this.video.setAttribute('aria-label', 'Camera feed for object detection');
        document.body.appendChild(this.video);

        // Create canvas for processing
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Request camera access
        this.requestCameraAccess();
    }

    async requestCameraAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user'
                } 
            });
            
            this.video.srcObject = stream;
            this.video.play();
            
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.startDetection();
            });

            this.sewaSathi.addMessage("Camera access granted! I can now see what's in front of you.", 'ai');
        } catch (error) {
            console.error('Camera access denied:', error);
            this.sewaSathi.addMessage("Camera access is required for vision features. Please allow camera access and refresh the page.", 'ai');
        }
    }

    startDetection() {
        if (!this.model || this.isDetecting) return;
        
        this.isDetecting = true;
        this.detectionInterval = setInterval(() => {
            this.detectObjects();
        }, 2000); // Detect every 2 seconds
    }

    stopDetection() {
        this.isDetecting = false;
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        this.video.style.display = 'none';
    }

    async detectObjects() {
        if (!this.model || !this.video.videoWidth) return;

        try {
            // Draw video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Run object detection
            const predictions = await this.model.detect(this.canvas);
            
            if (predictions.length > 0) {
                const topObject = predictions[0]; // Get highest confidence detection
                this.processDetection(topObject, predictions);
            }
        } catch (error) {
            console.error('Object detection error:', error);
        }
    }

    async processDetection(topObject, allObjects) {
        const currentTime = Date.now();
        
        // Update user context
        this.userContext.detectedObjects = allObjects;
        this.userContext.lastDetectionTime = currentTime;
        this.userContext.currentUIState = this.getCurrentUIState();

        // Generate contextual guidance using Gemini
        const guidance = await this.generateContextualGuidance(topObject, allObjects);
        
        if (guidance) {
            this.queueInstruction(guidance);
        }
    }

    async generateContextualGuidance(topObject, allObjects) {
        const prompt = this.buildVisionPrompt(topObject, allObjects);
        
        try {
            const response = await this.callGeminiVisionAPI(prompt);
            return this.parseGuidanceResponse(response);
        } catch (error) {
            console.error('Vision guidance generation error:', error);
            return null;
        }
    }

    buildVisionPrompt(topObject, allObjects) {
        const language = this.userContext.language;
        const colorblindMode = this.userContext.colorblindMode;
        const previousInstructions = this.userContext.previousInstructions.slice(-3); // Last 3 instructions
        const uiState = this.userContext.currentUIState;
        
        const objectInfo = {
            topObject: {
                class: topObject.class,
                confidence: Math.round(topObject.score * 100),
                bbox: topObject.bbox
            },
            allObjects: allObjects.map(obj => ({
                class: obj.class,
                confidence: Math.round(obj.score * 100)
            }))
        };

        return `You are Sewa Sathi, an empathetic AI assistant for disabled users. Analyze the camera input and provide contextual guidance.

VISION INPUT:
Top detected object: ${objectInfo.topObject.class} (${objectInfo.topObject.confidence}% confidence)
All detected objects: ${objectInfo.allObjects.map(obj => `${obj.class} (${obj.confidence}%)`).join(', ')}

USER CONTEXT:
- Language: ${language === 'en' ? 'English' : 'Nepali'}
- Colorblind mode: ${colorblindMode ? 'Enabled' : 'Disabled'}
- Current UI state: ${uiState}
- Recent instructions: ${previousInstructions.join(', ') || 'None'}

GUIDANCE REQUIREMENTS:
1. Provide empathetic, actionable guidance based on what you see
2. Consider the user's accessibility needs and context
3. Be specific about object location and characteristics
4. Suggest safe, practical actions
5. Adapt language and complexity to user needs
6. If responding in Nepali, use proper Devanagari script

RESPONSE FORMAT:
{
    "instruction": "Clear, actionable guidance text",
    "priority": "high|medium|low",
    "visualSuggestion": "Optional UI suggestion",
    "ttsText": "Text optimized for speech synthesis",
    "confidence": 0.0-1.0
}

Respond in ${language === 'en' ? 'English' : 'Nepali'}:`;
    }

    async callGeminiVisionAPI(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.sewaSathi.geminiApiKey}`, {
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
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Vision API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    parseGuidanceResponse(response) {
        try {
            // Try to parse as JSON first
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback to simple text parsing
            return {
                instruction: response,
                priority: 'medium',
                visualSuggestion: null,
                ttsText: response,
                confidence: 0.8
            };
        } catch (error) {
            console.error('Failed to parse guidance response:', error);
            return {
                instruction: response,
                priority: 'medium',
                visualSuggestion: null,
                ttsText: response,
                confidence: 0.5
            };
        }
    }

    queueInstruction(guidance) {
        this.instructionQueue.push({
            ...guidance,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });

        // Process queue if not already processing
        if (!this.isProcessingInstruction) {
            this.processInstructionQueue();
        }
    }

    async processInstructionQueue() {
        if (this.instructionQueue.length === 0 || this.isProcessingInstruction) return;

        this.isProcessingInstruction = true;

        while (this.instructionQueue.length > 0) {
            const instruction = this.instructionQueue.shift();
            await this.executeInstruction(instruction);
            
            // Add delay between instructions to prevent overlap
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.isProcessingInstruction = false;
    }

    async executeInstruction(instruction) {
        // Add to conversation history
        this.sewaSathi.addMessage(instruction.instruction, 'ai');
        
        // Update user context
        this.userContext.previousInstructions.push(instruction.instruction);
        if (this.userContext.previousInstructions.length > 10) {
            this.userContext.previousInstructions.shift(); // Keep only last 10
        }

        // Speak the instruction if TTS is enabled
        if (this.sewaSathi.isTTSEnabled) {
            this.sewaSathi.speak(instruction.ttsText || instruction.instruction);
        }

        // Show visual suggestion if provided
        if (instruction.visualSuggestion) {
            this.showVisualSuggestion(instruction.visualSuggestion);
        }

        // Update UI state based on instruction
        this.updateUIState(instruction);
    }

    showVisualSuggestion(suggestion) {
        // Create visual overlay for suggestions
        const overlay = document.createElement('div');
        overlay.className = 'vision-suggestion';
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 102, 204, 0.95);
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            max-width: 300px;
            text-align: center;
            font-size: 16px;
            animation: suggestionFadeIn 0.5s ease-out;
        `;
        overlay.textContent = suggestion;
        document.body.appendChild(overlay);

        // Remove after 3 seconds
        setTimeout(() => {
            overlay.style.animation = 'suggestionFadeOut 0.5s ease-out';
            setTimeout(() => overlay.remove(), 500);
        }, 3000);
    }

    updateUIState(instruction) {
        // Update UI state based on instruction content
        if (instruction.instruction.toLowerCase().includes('navigate') || 
            instruction.instruction.toLowerCase().includes('go to')) {
            this.userContext.currentUIState = 'navigating';
        } else if (instruction.instruction.toLowerCase().includes('read') || 
                   instruction.instruction.toLowerCase().includes('content')) {
            this.userContext.currentUIState = 'reading';
        } else if (instruction.instruction.toLowerCase().includes('help') || 
                   instruction.instruction.toLowerCase().includes('assistance')) {
            this.userContext.currentUIState = 'helping';
        } else {
            this.userContext.currentUIState = 'idle';
        }
    }

    getCurrentUIState() {
        // Determine current UI state based on focused elements and page content
        const focusedElement = document.activeElement;
        const currentSection = this.getCurrentSection();
        
        if (focusedElement && focusedElement.tagName === 'INPUT') {
            return 'typing';
        } else if (focusedElement && focusedElement.classList.contains('nav-link')) {
            return 'navigating';
        } else if (currentSection) {
            return `viewing-${currentSection}`;
        } else {
            return 'idle';
        }
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                return section.id;
            }
        }
        return null;
    }

    setupVisualOverlay() {
        // Add CSS for visual suggestions
        const style = document.createElement('style');
        style.textContent = `
            @keyframes suggestionFadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            @keyframes suggestionFadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
            
            .vision-suggestion {
                font-family: var(--font-family);
                backdrop-filter: blur(10px);
            }
        `;
        document.head.appendChild(style);
    }

    setupContextTracking() {
        // Track language changes
        this.sewaSathi.currentLanguage = this.userContext.language;
        
        // Track accessibility settings
        this.userContext.colorblindMode = document.body.classList.contains('high-contrast');
        
        // Update context when settings change
        document.addEventListener('change', () => {
            this.userContext.language = this.sewaSathi.currentLanguage;
            this.userContext.colorblindMode = document.body.classList.contains('high-contrast');
        });
    }

    // Public methods for external control
    startVision() {
        if (this.video) {
            this.video.style.display = 'block';
            this.startDetection();
        }
    }

    stopVision() {
        this.stopDetection();
    }

    toggleVision() {
        if (this.isDetecting) {
            this.stopVision();
        } else {
            this.startVision();
        }
    }

    getContext() {
        return { ...this.userContext };
    }

    updateContext(updates) {
        Object.assign(this.userContext, updates);
    }
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisionAssistant;
}
