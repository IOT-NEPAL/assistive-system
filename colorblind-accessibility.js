// Colorblind Accessibility and Disability Selection Manager
class ColorblindAccessibilityManager {
    constructor() {
        this.selectedDisability = null;
        this.colorblindMode = null;
        this.isModalVisible = false;
        this.colorblindOverlay = null;
        this.accessibilityManager = null;
        
        this.init();
    }

    init() {
        this.setupDisabilityModal();
        this.setupColorblindFeatures();
        this.setupAccessibilityControls();
        this.loadUserPreferences();
        this.showDisabilityModal();
    }

    setupDisabilityModal() {
        this.modal = document.getElementById('disability-modal');
        this.disabilityOptions = document.querySelectorAll('.disability-option');
        this.skipButton = document.getElementById('skip-accessibility');
        this.applyButton = document.getElementById('apply-accessibility');

        // Add event listeners for disability options
        this.disabilityOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectDisability(option);
            });

            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectDisability(option);
                }
            });
        });

        // Skip button
        this.skipButton.addEventListener('click', () => {
            this.hideModal();
        });

        // Apply button
        this.applyButton.addEventListener('click', () => {
            this.applyDisabilitySettings();
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalVisible) {
                this.hideModal();
            }
        });
    }

    selectDisability(option) {
        // Remove previous selection
        this.disabilityOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        this.selectedDisability = option.dataset.disability;
        
        // Enable apply button
        this.applyButton.disabled = false;
        this.applyButton.focus();
        
        // Announce selection
        this.announce(`Selected ${option.querySelector('h3').textContent}`);
    }

    applyDisabilitySettings() {
        if (!this.selectedDisability) return;

        // Apply disability-specific settings
        this.applyDisabilityFeatures(this.selectedDisability);
        
        // Save preferences
        this.saveUserPreferences();
        
        // Hide modal
        this.hideModal();
        
        // Announce success
        this.announce('Accessibility settings applied successfully');
    }

    applyDisabilityFeatures(disability) {
        // Remove all disability classes
        document.body.classList.remove(
            'visual-impairment',
            'colorblind-friendly',
            'motor-impairment',
            'cognitive-differences',
            'hearing-impairment'
        );

        // Apply specific disability features
        switch (disability) {
            case 'visual':
                this.applyVisualImpairmentFeatures();
                break;
            case 'colorblind':
                this.applyColorblindFeatures();
                break;
            case 'motor':
                this.applyMotorImpairmentFeatures();
                break;
            case 'cognitive':
                this.applyCognitiveDifferencesFeatures();
                break;
            case 'hearing':
                this.applyHearingImpairmentFeatures();
                break;
            case 'none':
            default:
                this.applyStandardFeatures();
                break;
        }
    }

    applyVisualImpairmentFeatures() {
        document.body.classList.add('visual-impairment');
        
        // Enable high contrast mode
        if (this.accessibilityManager) {
            this.accessibilityManager.toggleHighContrast();
        }
        
        // Increase font size
        if (this.accessibilityManager) {
            this.accessibilityManager.fontSize = 1.25;
            this.accessibilityManager.applyFontSize();
        }
        
        // Enable screen reader mode
        if (this.accessibilityManager) {
            this.accessibilityManager.toggleScreenReaderMode();
        }
        
        this.announce('Visual impairment features enabled: high contrast, large text, and screen reader support');
    }

    applyColorblindFeatures() {
        document.body.classList.add('colorblind-friendly');
        
        // Initialize colorblind simulation
        this.initializeColorblindSimulation();
        
        this.announce('Colorblind-friendly features enabled: high contrast colors and patterns');
    }

    applyMotorImpairmentFeatures() {
        document.body.classList.add('motor-impairment');
        
        // Increase touch targets
        this.enhanceTouchTargets();
        
        // Enable keyboard navigation enhancements
        this.enhanceKeyboardNavigation();
        
        this.announce('Motor impairment features enabled: larger touch targets and enhanced keyboard navigation');
    }

    applyCognitiveDifferencesFeatures() {
        document.body.classList.add('cognitive-differences');
        
        // Simplify interface
        this.simplifyInterface();
        
        // Reduce animations
        this.reduceAnimations();
        
        this.announce('Cognitive differences features enabled: simplified interface and reduced distractions');
    }

    applyHearingImpairmentFeatures() {
        document.body.classList.add('hearing-impairment');
        
        // Add visual feedback for interactions
        this.addVisualFeedback();
        
        // Enable vibration for notifications
        this.enableVibrationFeedback();
        
        this.announce('Hearing impairment features enabled: visual feedback and vibration alerts');
    }

    applyStandardFeatures() {
        // Reset to standard accessibility features
        if (this.accessibilityManager) {
            this.accessibilityManager.fontSize = 1;
            this.accessibilityManager.applyFontSize();
        }
        
        this.announce('Standard accessibility features enabled');
    }

    setupColorblindFeatures() {
        this.colorblindOverlay = document.getElementById('colorblind-overlay');
        this.setupColorblindControls();
        this.createColorblindSVGFilters();
    }

    setupColorblindControls() {
        // Add colorblind controls to accessibility panel
        const controlsContainer = document.querySelector('.accessibility-controls .control-group');
        
        if (controlsContainer) {
            const colorblindControls = document.createElement('div');
            colorblindControls.className = 'colorblind-controls';
            colorblindControls.innerHTML = `
                <button class="colorblind-btn" data-mode="none" title="Normal vision">N</button>
                <button class="colorblind-btn" data-mode="protanopia" title="Protanopia simulation">P</button>
                <button class="colorblind-btn" data-mode="deuteranopia" title="Deuteranopia simulation">D</button>
                <button class="colorblind-btn" data-mode="tritanopia" title="Tritanopia simulation">T</button>
                <button class="colorblind-btn" data-mode="monochromacy" title="Monochromacy simulation">M</button>
            `;
            
            controlsContainer.appendChild(colorblindControls);
            
            // Add event listeners
            colorblindControls.addEventListener('click', (e) => {
                if (e.target.classList.contains('colorblind-btn')) {
                    this.toggleColorblindMode(e.target.dataset.mode);
                }
            });
        }
    }

    createColorblindSVGFilters() {
        // Create SVG filters for colorblind simulation
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.innerHTML = `
            <defs>
                <filter id="protanopia">
                    <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
                </filter>
                <filter id="deuteranopia">
                    <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
                </filter>
                <filter id="tritanopia">
                    <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
                </filter>
                <filter id="monochromacy">
                    <feColorMatrix type="matrix" values="0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0"/>
                </filter>
            </defs>
        `;
        document.body.appendChild(svg);
    }

    initializeColorblindSimulation() {
        // Initialize colorblind simulation using colorblind.js if available
        if (typeof colorblind !== 'undefined') {
            this.colorblindSimulator = colorblind;
            console.log('Colorblind simulation library loaded');
        } else {
            console.warn('Colorblind simulation library not available');
        }
    }

    toggleColorblindMode(mode) {
        // Remove all colorblind classes
        document.body.classList.remove(
            'colorblind-protanopia',
            'colorblind-deuteranopia',
            'colorblind-tritanopia',
            'colorblind-monochromacy'
        );

        // Update button states
        document.querySelectorAll('.colorblind-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (mode === 'none') {
            this.colorblindMode = null;
            this.announce('Colorblind simulation disabled');
            this.hideColorblindInfo();
        } else {
            document.body.classList.add(`colorblind-${mode}`);
            document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
            this.colorblindMode = mode;
            this.announce(`${mode} colorblind simulation enabled`);
            this.showColorblindInfo(mode);
        }

        // Apply colorblind simulation to images if library is available
        if (this.colorblindSimulator && mode !== 'none') {
            this.applyColorblindToImages(mode);
        }
    }

    showColorblindInfo(mode) {
        const modeInfo = {
            protanopia: 'Protanopia: Red-green colorblindness affecting red cones',
            deuteranopia: 'Deuteranopia: Red-green colorblindness affecting green cones',
            tritanopia: 'Tritanopia: Blue-yellow colorblindness affecting blue cones',
            monochromacy: 'Monochromacy: Complete colorblindness, seeing only in grayscale'
        };

        // Create info banner
        const infoBanner = document.createElement('div');
        infoBanner.id = 'colorblind-info-banner';
        infoBanner.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-size: 14px;
            text-align: center;
            max-width: 400px;
            animation: slideDown 0.3s ease-out;
        `;
        infoBanner.textContent = modeInfo[mode] || `${mode} colorblind simulation active`;
        document.body.appendChild(infoBanner);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (infoBanner.parentNode) {
                infoBanner.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => infoBanner.remove(), 300);
            }
        }, 5000);
    }

    hideColorblindInfo() {
        const infoBanner = document.getElementById('colorblind-info-banner');
        if (infoBanner) {
            infoBanner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => infoBanner.remove(), 300);
        }
    }

    applyColorblindToImages(mode) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (this.colorblindSimulator) {
                try {
                    this.colorblindSimulator.simulate(img, mode);
                } catch (error) {
                    console.warn('Could not apply colorblind simulation to image:', error);
                }
            }
        });
    }

    enhanceTouchTargets() {
        // Ensure all interactive elements meet minimum touch target size
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
            }
        });
    }

    enhanceKeyboardNavigation() {
        // Add keyboard navigation enhancements
        document.addEventListener('keydown', (e) => {
            // Tab to skip to main content
            if (e.key === 'Tab' && e.shiftKey === false && document.activeElement === document.body) {
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    e.preventDefault();
                }
            }
        });
    }

    simplifyInterface() {
        // Reduce visual complexity
        const complexElements = document.querySelectorAll('.feature-card, .hero-visual');
        complexElements.forEach(element => {
            element.style.transition = 'none';
        });
    }

    reduceAnimations() {
        // Respect prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.style.setProperty('--transition-fast', '0.01ms');
            document.body.style.setProperty('--transition-normal', '0.01ms');
            document.body.style.setProperty('--transition-slow', '0.01ms');
        }
    }

    addVisualFeedback() {
        // Add visual feedback for button interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, .control-btn')) {
                this.createVisualFeedback(e.target);
            }
        });
    }

    createVisualFeedback(element) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            background: var(--accent-color);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: visual-feedback 0.3s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 300);
    }

    enableVibrationFeedback() {
        // Enable vibration for notifications (if supported)
        if ('vibrate' in navigator) {
            document.addEventListener('click', (e) => {
                if (e.target.matches('button, .btn, .control-btn')) {
                    navigator.vibrate(50); // Short vibration
                }
            });
        }
    }

    setupAccessibilityControls() {
        // Get reference to existing accessibility manager
        this.accessibilityManager = window.accessibilityManager;
    }

    showDisabilityModal() {
        // Check if user has already made a selection
        const hasSelected = localStorage.getItem('accessibility-disability-selected');
        if (hasSelected) {
            const savedDisability = localStorage.getItem('accessibility-disability-type');
            if (savedDisability) {
                this.applyDisabilityFeatures(savedDisability);
                return;
            }
        }

        // Show modal after a short delay
        setTimeout(() => {
            this.modal.style.display = 'flex';
            this.isModalVisible = true;
            
            // Focus first option
            const firstOption = this.disabilityOptions[0];
            if (firstOption) {
                firstOption.focus();
            }
            
            // Announce modal
            this.announce('Accessibility preferences modal opened. Please select your accessibility needs.');
        }, 1000);
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.isModalVisible = false;
        
        // Focus main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
        }
    }

    saveUserPreferences() {
        const preferences = {
            disability: this.selectedDisability,
            colorblindMode: this.colorblindMode,
            timestamp: Date.now()
        };
        
        localStorage.setItem('accessibility-disability-selected', 'true');
        localStorage.setItem('accessibility-disability-type', this.selectedDisability);
        localStorage.setItem('accessibility-colorblind-mode', this.colorblindMode || 'none');
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        try {
            const savedDisability = localStorage.getItem('accessibility-disability-type');
            const savedColorblindMode = localStorage.getItem('accessibility-colorblind-mode');
            
            if (savedDisability) {
                this.selectedDisability = savedDisability;
            }
            
            if (savedColorblindMode && savedColorblindMode !== 'none') {
                this.colorblindMode = savedColorblindMode;
                this.toggleColorblindMode(savedColorblindMode);
            }
        } catch (error) {
            console.warn('Could not load accessibility preferences:', error);
        }
    }

    announce(message) {
        // Use existing announcement system if available
        if (this.accessibilityManager && this.accessibilityManager.announce) {
            this.accessibilityManager.announce(message);
        } else {
            // Fallback announcement
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => announcement.remove(), 1000);
        }
    }

    // Public methods for external control
    resetPreferences() {
        localStorage.removeItem('accessibility-disability-selected');
        localStorage.removeItem('accessibility-disability-type');
        localStorage.removeItem('accessibility-colorblind-mode');
        localStorage.removeItem('accessibility-preferences');
        
        // Reset UI
        document.body.className = '';
        this.selectedDisability = null;
        this.colorblindMode = null;
        
        // Show modal again
        this.showDisabilityModal();
    }

    getCurrentSettings() {
        return {
            disability: this.selectedDisability,
            colorblindMode: this.colorblindMode,
            isModalVisible: this.isModalVisible
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize colorblind accessibility manager
    window.colorblindAccessibilityManager = new ColorblindAccessibilityManager();
    
    // Make it globally accessible
    window.ColorblindAccessibilityManager = ColorblindAccessibilityManager;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorblindAccessibilityManager;
}
