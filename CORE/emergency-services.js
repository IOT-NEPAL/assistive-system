// Emergency Services and Accessibility Features
class EmergencyServices {
    constructor() {
        this.emergencyNumbers = {
            police: '100',
            fire: '101',
            ambulance: '102',
            disability: '+977 9768442380',
            medical: '+977 9768442380'
        };
        
        this.init();
    }

    init() {
        this.setupEmergencyCalls();
        this.setupAccessibilityFeatures();
    }

    setupEmergencyCalls() {
        // Make callEmergency function globally available
        window.callEmergency = (number) => {
            this.makeEmergencyCall(number);
        };
    }

    makeEmergencyCall(number) {
        // Create a confirmation dialog
        const confirmed = confirm(`Calling emergency number: ${number}\n\nThis will open your phone dialer. Continue?`);
        
        if (confirmed) {
            // Create a tel: link and click it
            const telLink = document.createElement('a');
            telLink.href = `tel:${number}`;
            telLink.click();
            
            // Announce the call
            this.announceCall(number);
        }
    }

    announceCall(number) {
        const announcement = `Emergency call initiated to ${number}. Please ensure your phone is ready.`;
        
        // Use touch-to-speech if available
        if (window.touchToSpeech && window.touchToSpeech.isTouchToSpeechEnabled()) {
            window.touchToSpeech.speakText(announcement);
        }
        
        // Show visual notification
        this.showCallNotification(announcement);
    }

    showCallNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4757;
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            font-size: 16px;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">📞</div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    setupAccessibilityFeatures() {
        // Add hearing impairment detection
        this.detectHearingImpairment();
        
        // Add emergency accessibility features
        this.addEmergencyAccessibility();
    }

    detectHearingImpairment() {
        // Check for hearing impairment preference
        const hasHearingImpairment = localStorage.getItem('hearing-impairment') === 'true';
        
        if (hasHearingImpairment) {
            // Enable touch-to-speech automatically
            if (window.touchToSpeech) {
                window.touchToSpeech.enable();
            }
            
            // Add visual indicators
            this.addVisualIndicators();
        }
    }

    addVisualIndicators() {
        // Add visual indicators for hearing impaired users
        const style = document.createElement('style');
        style.textContent = `
            .hearing-impairment-mode * {
                border: 1px solid rgba(0, 102, 204, 0.3) !important;
            }
            
            .hearing-impairment-mode *:hover {
                background-color: rgba(0, 102, 204, 0.1) !important;
                border-color: rgba(0, 102, 204, 0.6) !important;
            }
            
            .hearing-impairment-mode .emergency-card {
                border: 3px solid #ffd700 !important;
                animation: urgent-pulse 1s infinite;
            }
        `;
        document.head.appendChild(style);
        
        // Add class to body
        document.body.classList.add('hearing-impairment-mode');
    }

    addEmergencyAccessibility() {
        // Add emergency accessibility features
        this.addEmergencyKeyboardShortcuts();
        this.addEmergencyVoiceCommands();
    }

    addEmergencyKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + E for emergency
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                this.showEmergencyMenu();
            }
            
            // Alt + 1, 2, 3 for quick emergency calls
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                this.makeEmergencyCall(this.emergencyNumbers.police);
            }
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                this.makeEmergencyCall(this.emergencyNumbers.fire);
            }
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                this.makeEmergencyCall(this.emergencyNumbers.ambulance);
            }
        });
    }

    addEmergencyVoiceCommands() {
        if (window.voiceLibrary) {
            // Add emergency voice commands
            window.voiceLibrary.addCommand('emergency', () => {
                this.showEmergencyMenu();
            }, { description: 'Show emergency menu' });

            window.voiceLibrary.addCommand('call police', () => {
                this.makeEmergencyCall(this.emergencyNumbers.police);
            }, { description: 'Call police emergency' });

            window.voiceLibrary.addCommand('call fire', () => {
                this.makeEmergencyCall(this.emergencyNumbers.fire);
            }, { description: 'Call fire emergency' });

            window.voiceLibrary.addCommand('call ambulance', () => {
                this.makeEmergencyCall(this.emergencyNumbers.ambulance);
            }, { description: 'Call ambulance emergency' });

            window.voiceLibrary.addCommand('call disability support', () => {
                this.makeEmergencyCall(this.emergencyNumbers.disability);
            }, { description: 'Call disability support' });
        }
    }

    showEmergencyMenu() {
        const menu = document.createElement('div');
        menu.id = 'emergency-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-primary);
            border: 3px solid #ff4757;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            min-width: 300px;
        `;

        menu.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #ff4757;">🚨 Emergency Services</h3>
            <div style="display: grid; gap: 10px;">
                <button onclick="callEmergency('100')" style="padding: 10px; background: #ff4757; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🚔 Police (100)
                </button>
                <button onclick="callEmergency('101')" style="padding: 10px; background: #ff6b6b; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🚒 Fire (101)
                </button>
                <button onclick="callEmergency('102')" style="padding: 10px; background: #2ed573; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🚑 Ambulance (102)
                </button>
                <button onclick="callEmergency('9768442380')" style="padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    👥 Disability Support
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px; background: var(--secondary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(menu);
        
        // Announce the menu
        if (window.touchToSpeech) {
            window.touchToSpeech.speakText('Emergency menu opened. Choose your emergency service.');
        }
    }

    // Public methods
    enableHearingImpairmentMode() {
        localStorage.setItem('hearing-impairment', 'true');
        this.detectHearingImpairment();
    }

    disableHearingImpairmentMode() {
        localStorage.setItem('hearing-impairment', 'false');
        document.body.classList.remove('hearing-impairment-mode');
    }

    isHearingImpairmentModeEnabled() {
        return localStorage.getItem('hearing-impairment') === 'true';
    }
}

// Initialize emergency services when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emergencyServices = new EmergencyServices();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencyServices;
}

