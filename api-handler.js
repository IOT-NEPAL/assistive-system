// Dedicated API Handler for Gemini Integration
class APIHandler {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = 1000; // 1 second between requests
        this.maxRetries = 3;
        this.timeout = 30000; // 30 seconds timeout
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        const request = {
            prompt,
            options: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 1024,
                ...options
            },
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        };

        return this.queueRequest(request);
    }

    async generateVisionContent(prompt, imageData, options = {}) {
        if (!this.apiKey) {
            throw new Error('API key not set');
        }

        const request = {
            prompt,
            imageData,
            options: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 512,
                ...options
            },
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9),
            type: 'vision'
        };

        return this.queueRequest(request);
    }

    async queueRequest(request) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                request,
                resolve,
                reject
            });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.requestQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { request, resolve, reject } = this.requestQueue.shift();

        try {
            const result = await this.executeRequest(request);
            resolve(result);
        } catch (error) {
            reject(error);
        }

        // Add delay between requests to respect rate limits
        setTimeout(() => {
            this.processQueue();
        }, this.rateLimitDelay);
    }

    async executeRequest(request) {
        const { prompt, imageData, options, type } = request;
        
        const requestBody = {
            contents: [{
                parts: type === 'vision' 
                    ? this.buildVisionParts(prompt, imageData)
                    : [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature,
                topK: options.topK,
                topP: options.topP,
                maxOutputTokens: options.maxOutputTokens
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new APIError(
                    `API request failed: ${response.status} ${response.statusText}`,
                    response.status,
                    errorData
                );
            }

            const data = await response.json();
            return this.parseResponse(data);
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }
            
            throw error;
        }
    }

    buildVisionParts(prompt, imageData) {
        const parts = [{ text: prompt }];
        
        if (imageData) {
            if (typeof imageData === 'string') {
                // Base64 image
                parts.push({
                    inline_data: {
                        mime_type: 'image/jpeg',
                        data: imageData
                    }
                });
            } else if (imageData instanceof File) {
                // File object
                parts.push({
                    inline_data: {
                        mime_type: imageData.type,
                        data: this.fileToBase64(imageData)
                    }
                });
            }
        }
        
        return parts;
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    parseResponse(data) {
        if (!data.candidates || data.candidates.length === 0) {
            throw new APIError('No response generated', 500);
        }

        const candidate = data.candidates[0];
        
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new APIError('Invalid response format', 500);
        }

        return {
            text: candidate.content.parts[0].text,
            finishReason: candidate.finishReason,
            safetyRatings: candidate.safetyRatings,
            usageMetadata: data.usageMetadata
        };
    }

    // Utility methods
    async testConnection() {
        try {
            const response = await this.generateContent('Hello, test connection');
            return { success: true, response: response.text };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    getQueueStatus() {
        return {
            queueLength: this.requestQueue.length,
            isProcessing: this.isProcessing,
            rateLimitDelay: this.rateLimitDelay
        };
    }

    clearQueue() {
        this.requestQueue.forEach(({ reject }) => {
            reject(new Error('Request cancelled'));
        });
        this.requestQueue = [];
    }

    setRateLimitDelay(delay) {
        this.rateLimitDelay = delay;
    }

    setTimeout(timeout) {
        this.timeout = timeout;
    }
}

// Custom API Error class
class APIError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// API Response Parser
class APIResponseParser {
    static parseTextResponse(response) {
        try {
            // Try to parse as JSON first
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Return as plain text
            return {
                text: response,
                type: 'text'
            };
        } catch (error) {
            return {
                text: response,
                type: 'text',
                error: 'Failed to parse JSON response'
            };
        }
    }

    static extractInstructions(response) {
        const instructionPatterns = [
            /instruction["\s]*:["\s]*([^"]+)/i,
            /guidance["\s]*:["\s]*([^"]+)/i,
            /action["\s]*:["\s]*([^"]+)/i
        ];

        for (const pattern of instructionPatterns) {
            const match = response.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return response;
    }

    static extractPriority(response) {
        const priorityPatterns = [
            /priority["\s]*:["\s]*(high|medium|low)/i,
            /urgent["\s]*:["\s]*(true|false)/i
        ];

        for (const pattern of priorityPatterns) {
            const match = response.match(pattern);
            if (match) {
                return match[1].toLowerCase();
            }
        }

        return 'medium';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIHandler, APIError, APIResponseParser };
}

