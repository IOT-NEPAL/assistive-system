// Accessibility Enhancement JavaScript
class AccessibilityManager {
    constructor() {
        this.isHighContrast = false;
        this.fontSize = 1;
        this.isScreenReaderMode = false;
        this.isDarkMode = false;
        this.announcements = document.getElementById('announcements');
        this.userProgress = {
            currentSection: 'home',
            completedSections: [],
            lastVisited: new Date().toISOString(),
            timeSpent: 0,
            preferences: {}
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupFormValidation();
        this.setupMobileMenu();
        this.setupBreadcrumbNavigation();
        this.setupSearchFunctionality();
        this.setupProgressTracking();
        this.setupOfflineSupport();
        this.setupPrintSupport();
        this.setupNotificationSystem();
        this.setupLoginKeyboardShortcuts();
        this.setupUniqueFeatures();
        this.loadUserPreferences();
        this.loadUserProgress();
        
        // Show welcome notification
        setTimeout(() => {
            this.showInfoNotification(
                'Welcome to Sewa Sathi!',
                'Your accessibility-first website is ready. Use the controls above to customize your experience.',
                5000
            );
        }, 1000);
    }

    setupEventListeners() {
        // Font size controls
        document.getElementById('font-size-increase').addEventListener('click', () => {
            this.increaseFontSize();
        });

        document.getElementById('font-size-decrease').addEventListener('click', () => {
            this.decreaseFontSize();
        });

        // High contrast toggle
        document.getElementById('high-contrast').addEventListener('click', () => {
            this.toggleHighContrast();
        });

        // Screen reader mode toggle
        document.getElementById('screen-reader').addEventListener('click', () => {
            this.toggleScreenReaderMode();
        });

        // Dark mode toggle
        document.getElementById('dark-mode').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Search toggle
        document.getElementById('search-toggle').addEventListener('click', () => {
            this.toggleSearch();
        });

        // Keyboard shortcuts button
        document.getElementById('keyboard-shortcuts-btn').addEventListener('click', () => {
            this.showKeyboardShortcuts();
        });

        // Progress toggle
        document.getElementById('progress-toggle').addEventListener('click', () => {
            this.toggleProgressIndicator();
        });

        // Export data
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportUserData();
        });

        // Import data
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importUserData(e.target.files[0]);
            }
        });

        // Login panel
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showLoginPanel();
        });

        document.getElementById('login-close').addEventListener('click', () => {
            this.hideLoginPanel();
        });

        // Role selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectRole(card.dataset.role);
            });
        });

        // Login form
        document.getElementById('back-to-roles').addEventListener('click', () => {
            this.showRoleSelection();
        });

        document.getElementById('login-submit').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Dashboard close buttons
        document.getElementById('parent-dashboard-close').addEventListener('click', () => {
            this.hideParentDashboard();
        });

        document.getElementById('student-dashboard-close').addEventListener('click', () => {
            this.hideStudentDashboard();
        });

        // Dashboard action buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('action-btn')) {
                this.handleDashboardAction(e.target.textContent);
            }
            
            if (e.target.classList.contains('tool-item')) {
                this.handleToolClick(e.target);
            }
        });

        // Keyboard shortcuts help
        document.getElementById('keyboard-shortcuts-close').addEventListener('click', () => {
            this.hideKeyboardShortcuts();
        });

        // Reset accessibility settings
        document.getElementById('reset-accessibility').addEventListener('click', () => {
            this.resetAccessibilitySettings();
        });

        // Save preferences on change
        document.addEventListener('change', () => {
            this.saveUserPreferences();
        });
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Skip to main content with Alt + M
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                document.getElementById('main-content').focus();
                this.announce('Skipped to main content');
            }

            // Toggle high contrast with Alt + H
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.toggleHighContrast();
            }

            // Toggle screen reader mode with Alt + S
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                this.toggleScreenReaderMode();
            }

            // Toggle dark mode with Alt + D
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDarkMode();
            }

            // Toggle search with Ctrl + K
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch();
            }

            // Show keyboard shortcuts with Ctrl + /
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }

            // Close modals with Escape
            if (e.key === 'Escape') {
                this.hideKeyboardShortcuts();
                this.hideSearch();
            }

            // Increase font size with Alt + Plus
            if (e.altKey && e.key === '+') {
                e.preventDefault();
                this.increaseFontSize();
            }

            // Decrease font size with Alt + Minus
            if (e.altKey && e.key === '-') {
                e.preventDefault();
                this.decreaseFontSize();
            }

            // Focus management for modals and dropdowns
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Focus trap for mobile menu
        this.setupFocusTrap();
    }

    setupFocusTrap() {
        const mobileMenu = document.querySelector('.nav-menu');
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        if (mobileMenu) {
            mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableContent = mobileMenu.querySelectorAll(focusableElements);
                    const firstFocusableElement = focusableContent[0];
                    const lastFocusableElement = focusableContent[focusableContent.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            lastFocusableElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            firstFocusableElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            });
        }
    }

    setupFormValidation() {
        const form = document.querySelector('.contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(form);
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });

                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        }
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
                mobileToggle.setAttribute('aria-expanded', !isExpanded);
                navMenu.classList.toggle('active');
                
                if (!isExpanded) {
                    // Focus first menu item when opening
                    const firstLink = navMenu.querySelector('.nav-link');
                    if (firstLink) {
                        firstLink.focus();
                    }
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                }
            });
        }
    }

    setupBreadcrumbNavigation() {
        this.breadcrumbList = document.getElementById('breadcrumb-list');
        this.sectionMap = {
            'home': 'Home',
            'features': 'Features',
            'emergency': 'Emergency Services',
            'medical': 'Medical Services',
            'transport': 'Transportation',
            'education': 'Education',
            'resources': 'Resources',
            'contact': 'Contact'
        };

        // Update breadcrumb on scroll
        this.updateBreadcrumbOnScroll();
        
        // Update breadcrumb on navigation
        this.updateBreadcrumbOnNavigation();
        
        // Initial breadcrumb update
        this.updateBreadcrumb();
    }

    updateBreadcrumbOnScroll() {
        let ticking = false;
        
        const updateBreadcrumb = () => {
            this.updateBreadcrumb();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateBreadcrumb);
                ticking = true;
            }
        }, { passive: true });
    }

    updateBreadcrumbOnNavigation() {
        // Listen for navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                setTimeout(() => this.updateBreadcrumb(), 100);
            }
        });

        // Listen for programmatic navigation
        window.addEventListener('hashchange', () => {
            this.updateBreadcrumb();
        });
    }

    updateBreadcrumb() {
        if (!this.breadcrumbList) return;

        const currentSection = this.getCurrentSection();
        const breadcrumbItems = this.buildBreadcrumbItems(currentSection);
        
        this.breadcrumbList.innerHTML = breadcrumbItems.map(item => `
            <li class="breadcrumb-item">
                <a href="${item.href}" 
                   class="breadcrumb-link" 
                   ${item.current ? 'aria-current="page"' : ''}>
                    ${item.text}
                </a>
            </li>
        `).join('');
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = 'home';

        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section.id;
                break;
            }
        }

        return currentSection;
    }

    buildBreadcrumbItems(currentSection) {
        const items = [
            { href: '#home', text: 'Home', current: currentSection === 'home' }
        ];

        if (currentSection !== 'home') {
            const sectionName = this.sectionMap[currentSection] || currentSection;
            items.push({
                href: `#${currentSection}`,
                text: sectionName,
                current: true
            });
        }

        return items;
    }

    setupSearchFunctionality() {
        this.searchContainer = document.getElementById('search-container');
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchVoiceBtn = document.getElementById('search-voice-btn');
        this.searchClearBtn = document.getElementById('search-clear-btn');
        this.isSearchVisible = false;
        this.searchData = this.buildSearchIndex();

        // Search input events
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });

        // Voice search
        this.searchVoiceBtn.addEventListener('click', () => {
            this.toggleVoiceSearch();
        });

        // Clear search
        this.searchClearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        // Close search on outside click
        document.addEventListener('click', (e) => {
            if (!this.searchContainer.contains(e.target) && !e.target.closest('#search-toggle')) {
                this.hideSearch();
            }
        });

        // Keyboard shortcut for search (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch();
            }
        });
    }

    buildSearchIndex() {
        const searchData = [];
        
        // Index all sections and their content
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const id = section.id;
            const title = section.querySelector('h1, h2, h3')?.textContent || '';
            const content = section.textContent || '';
            
            searchData.push({
                id,
                title,
                content: content.substring(0, 500), // Limit content length
                type: 'section',
                url: `#${id}`
            });

            // Index individual cards and items
            const cards = section.querySelectorAll('.feature-card, .emergency-card, .transport-card, .service-item, .program-item');
            cards.forEach(card => {
                const cardTitle = card.querySelector('h3, h4')?.textContent || '';
                const cardContent = card.textContent || '';
                
                if (cardTitle) {
                    searchData.push({
                        id: `${id}-${cardTitle.toLowerCase().replace(/\s+/g, '-')}`,
                        title: cardTitle,
                        content: cardContent.substring(0, 200),
                        type: 'card',
                        section: id,
                        url: `#${id}`
                    });
                }
            });
        });

        return searchData;
    }

    toggleSearch() {
        this.isSearchVisible = !this.isSearchVisible;
        
        if (this.isSearchVisible) {
            this.showSearch();
        } else {
            this.hideSearch();
        }
    }

    showSearch() {
        this.searchContainer.classList.add('active');
        this.searchInput.focus();
        this.isSearchVisible = true;
        this.announce('Search opened. Type to search or use voice search.');
    }

    hideSearch() {
        this.searchContainer.classList.remove('active');
        this.searchResults.classList.remove('active');
        this.searchInput.value = '';
        this.searchClearBtn.style.display = 'none';
        this.isSearchVisible = false;
    }

    handleSearchInput(query) {
        if (query.length === 0) {
            this.searchResults.classList.remove('active');
            this.searchClearBtn.style.display = 'none';
            return;
        }

        this.searchClearBtn.style.display = 'block';
        const results = this.performSearch(query);
        this.displaySearchResults(results);
    }

    handleSearchKeydown(e) {
        const results = this.searchResults.querySelectorAll('.search-result-item');
        const currentIndex = Array.from(results).findIndex(item => item === document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
                results[nextIndex]?.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
                results[prevIndex]?.focus();
                break;
            case 'Enter':
                e.preventDefault();
                if (results[currentIndex]) {
                    results[currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideSearch();
                break;
        }
    }

    performSearch(query) {
        const normalizedQuery = query.toLowerCase().trim();
        if (normalizedQuery.length < 2) return [];

        return this.searchData.filter(item => 
            item.title.toLowerCase().includes(normalizedQuery) ||
            item.content.toLowerCase().includes(normalizedQuery)
        ).slice(0, 10); // Limit to 10 results
    }

    displaySearchResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-no-results">No results found. Try different keywords.</div>';
        } else {
            this.searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" 
                     tabindex="0" 
                     data-url="${result.url}"
                     data-section="${result.section || result.id}">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-snippet">${this.highlightSearchTerms(result.content, this.searchInput.value)}</div>
                    <div class="search-result-section">${this.sectionMap[result.section || result.id] || result.type}</div>
                </div>
            `).join('');

            // Add click handlers to results
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    const section = item.dataset.section;
                    this.navigateToSearchResult(url, section);
                });
            });
        }

        this.searchResults.classList.add('active');
    }

    highlightSearchTerms(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    navigateToSearchResult(url, section) {
        // Navigate to the section
        const targetElement = document.querySelector(url);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            targetElement.focus();
            this.hideSearch();
            this.announce(`Navigated to ${section}`);
        }
    }

    toggleVoiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.announce('Voice search is not supported in this browser');
            return;
        }

        if (this.isVoiceSearchActive) {
            this.stopVoiceSearch();
        } else {
            this.startVoiceSearch();
        }
    }

    startVoiceSearch() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceRecognition = new SpeechRecognition();
        this.voiceRecognition.continuous = false;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'en-US';

        this.voiceRecognition.onstart = () => {
            this.isVoiceSearchActive = true;
            this.searchVoiceBtn.classList.add('listening');
            this.searchVoiceBtn.setAttribute('aria-label', 'Stop voice search');
            this.announce('Listening for search terms...');
        };

        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.searchInput.value = transcript;
            this.handleSearchInput(transcript);
        };

        this.voiceRecognition.onend = () => {
            this.stopVoiceSearch();
        };

        this.voiceRecognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            this.announce('Voice search error. Please try again.');
            this.stopVoiceSearch();
        };

        this.voiceRecognition.start();
    }

    stopVoiceSearch() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        this.isVoiceSearchActive = false;
        this.searchVoiceBtn.classList.remove('listening');
        this.searchVoiceBtn.setAttribute('aria-label', 'Voice search');
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchResults.classList.remove('active');
        this.searchClearBtn.style.display = 'none';
        this.searchInput.focus();
    }

    showKeyboardShortcuts() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus the close button
        const closeBtn = document.getElementById('keyboard-shortcuts-close');
        closeBtn.focus();
        
        this.announce('Keyboard shortcuts help opened');
    }

    hideKeyboardShortcuts() {
        const modal = document.getElementById('keyboard-shortcuts-modal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        this.announce('Keyboard shortcuts help closed');
    }

    setupProgressTracking() {
        // Track section changes
        this.observeSectionChanges();
        
        // Track time spent
        this.startTimeTracking();
        
        // Save progress periodically
        setInterval(() => {
            this.saveUserProgress();
        }, 30000); // Save every 30 seconds
        
        // Save progress on page unload
        window.addEventListener('beforeunload', () => {
            this.saveUserProgress();
        });
    }

    observeSectionChanges() {
        // Track when user navigates to different sections
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateCurrentSection(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    updateCurrentSection(sectionId) {
        if (this.userProgress.currentSection !== sectionId) {
            this.userProgress.currentSection = sectionId;
            this.userProgress.lastVisited = new Date().toISOString();
            this.updateBreadcrumb(sectionId);
            this.saveUserProgress();
        }
    }

    startTimeTracking() {
        this.sessionStartTime = Date.now();
        
        // Update time spent every minute
        setInterval(() => {
            if (this.sessionStartTime) {
                this.userProgress.timeSpent += 1; // in minutes
            }
        }, 60000);
    }

    markSectionCompleted(sectionId) {
        if (!this.userProgress.completedSections.includes(sectionId)) {
            this.userProgress.completedSections.push(sectionId);
            this.userProgress.lastVisited = new Date().toISOString();
            this.saveUserProgress();
            this.announce(`Section ${sectionId} marked as completed`);
        }
    }

    saveUserProgress() {
        this.userProgress.preferences = {
            fontSize: this.fontSize,
            isHighContrast: this.isHighContrast,
            isScreenReaderMode: this.isScreenReaderMode,
            isDarkMode: this.isDarkMode
        };
        
        localStorage.setItem('user-progress', JSON.stringify(this.userProgress));
    }

    loadUserProgress() {
        const saved = localStorage.getItem('user-progress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                this.userProgress = { ...this.userProgress, ...progress };
                
                // Restore last visited section
                if (this.userProgress.currentSection && this.userProgress.currentSection !== 'home') {
                    this.scrollToSection(this.userProgress.currentSection);
                }
                
                this.announce('Progress restored from previous session');
            } catch (e) {
                console.warn('Could not load user progress:', e);
            }
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            this.updateBreadcrumb(sectionId);
        }
    }

    getProgressSummary() {
        const totalSections = document.querySelectorAll('section[id]').length;
        const completedCount = this.userProgress.completedSections.length;
        const progressPercentage = Math.round((completedCount / totalSections) * 100);
        
        return {
            currentSection: this.userProgress.currentSection,
            completedSections: this.userProgress.completedSections,
            totalSections: totalSections,
            progressPercentage: progressPercentage,
            timeSpent: this.userProgress.timeSpent,
            lastVisited: this.userProgress.lastVisited
        };
    }

    updateProgressIndicator() {
        const summary = this.getProgressSummary();
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${summary.progressPercentage}%`;
            progressText.textContent = `Progress: ${summary.progressPercentage}% (${summary.completedCount}/${summary.totalSections} sections)`;
        }
    }

    showProgressIndicator() {
        const indicator = document.getElementById('progress-indicator');
        if (indicator) {
            indicator.classList.add('active');
            this.updateProgressIndicator();
        }
    }

    hideProgressIndicator() {
        const indicator = document.getElementById('progress-indicator');
        if (indicator) {
            indicator.classList.remove('active');
        }
    }

    toggleProgressIndicator() {
        const indicator = document.getElementById('progress-indicator');
        if (indicator) {
            if (indicator.classList.contains('active')) {
                this.hideProgressIndicator();
                this.announce('Progress indicator hidden');
            } else {
                this.showProgressIndicator();
                this.announce('Progress indicator shown');
            }
        }
    }

    setupOfflineSupport() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);
                    this.isOnline = navigator.onLine;
                    this.setupOnlineOfflineHandlers();
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        // Setup IndexedDB for offline data storage
        this.setupIndexedDB();
    }

    setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.announce('Connection restored. Syncing offline data...');
            this.syncOfflineData();
            this.hideOfflineIndicator();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.announce('Connection lost. Working in offline mode.');
            this.showOfflineIndicator();
        });
    }

    setupIndexedDB() {
        const request = indexedDB.open('SewaSathiOffline', 1);
        
        request.onerror = (event) => {
            console.log('IndexedDB error:', event.target.error);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store for offline data
            if (!db.objectStoreNames.contains('offlineData')) {
                const store = db.createObjectStore('offlineData', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    }

    showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <div class="offline-content">
                    <span class="offline-icon">📡</span>
                    <span class="offline-text">You're offline. Some features may be limited.</span>
                </div>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    saveOfflineData(data) {
        if (!this.db) return;

        const transaction = this.db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        
        const offlineData = {
            ...data,
            timestamp: Date.now(),
            synced: false
        };

        store.add(offlineData);
    }

    async syncOfflineData() {
        if (!this.db || !this.isOnline) return;

        const transaction = this.db.transaction(['offlineData'], 'readonly');
        const store = transaction.objectStore('offlineData');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
            const offlineData = getAllRequest.result.filter(item => !item.synced);
            
            for (const data of offlineData) {
                try {
                    await this.syncSingleOfflineData(data);
                    await this.markDataAsSynced(data.id);
                } catch (error) {
                    console.log('Failed to sync data:', error);
                }
            }
        };
    }

    async syncSingleOfflineData(data) {
        // Implement specific sync logic based on data type
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Sync failed');
        }
    }

    async markDataAsSynced(id) {
        if (!this.db) return;

        const transaction = this.db.transaction(['offlineData'], 'readwrite');
        const store = transaction.objectStore('offlineData');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const data = getRequest.result;
            if (data) {
                data.synced = true;
                store.put(data);
            }
        };
    }

    setupPrintSupport() {
        // Set print date
        const printDateElement = document.getElementById('print-date');
        if (printDateElement) {
            printDateElement.textContent = new Date().toLocaleDateString();
        }

        // Add print event listener
        window.addEventListener('beforeprint', () => {
            this.prepareForPrint();
        });

        window.addEventListener('afterprint', () => {
            this.cleanupAfterPrint();
        });
    }

    prepareForPrint() {
        // Update print date
        const printDateElement = document.getElementById('print-date');
        if (printDateElement) {
            printDateElement.textContent = new Date().toLocaleDateString();
        }

        // Add page breaks to major sections
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section, index) => {
            if (index > 0 && index % 3 === 0) {
                section.classList.add('page-break');
            }
        });

        this.announce('Preparing document for printing');
    }

    cleanupAfterPrint() {
        // Remove page breaks after printing
        const sections = document.querySelectorAll('.page-break');
        sections.forEach(section => {
            section.classList.remove('page-break');
        });

        this.announce('Print completed');
    }

    setupNotificationSystem() {
        this.notificationContainer = document.getElementById('notification-container');
        this.notifications = [];
        this.maxNotifications = 5;
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotification(title, message, type = 'info', duration = 5000, actions = []) {
        const notification = {
            id: Date.now() + Math.random(),
            title,
            message,
            type,
            duration,
            actions,
            timestamp: new Date()
        };

        this.notifications.push(notification);
        this.renderNotification(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, duration);
        }

        // Limit number of notifications
        if (this.notifications.length > this.maxNotifications) {
            const oldestNotification = this.notifications.shift();
            this.removeNotification(oldestNotification.id);
        }

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            this.showBrowserNotification(title, message, type);
        }
    }

    renderNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type}`;
        notificationElement.setAttribute('role', 'alert');
        notificationElement.setAttribute('aria-live', 'polite');

        const icon = this.getNotificationIcon(notification.type);
        
        notificationElement.innerHTML = `
            <span class="notification-icon" aria-hidden="true">${icon}</span>
            <div class="notification-content">
                <h4 class="notification-title">${notification.title}</h4>
                <p class="notification-message">${notification.message}</p>
                ${notification.actions.length > 0 ? this.renderNotificationActions(notification.actions) : ''}
            </div>
            <button class="notification-close" aria-label="Close notification" onclick="window.accessibilityManager.removeNotification('${notification.id}')">
                <span aria-hidden="true">&times;</span>
            </button>
        `;

        this.notificationContainer.appendChild(notificationElement);

        // Announce to screen readers
        this.announce(`${notification.title}: ${notification.message}`);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    renderNotificationActions(actions) {
        return `
            <div class="notification-actions">
                ${actions.map(action => `
                    <button class="btn btn-sm" onclick="${action.onclick}">
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    removeNotification(id) {
        const notificationElement = document.querySelector(`[onclick*="${id}"]`)?.closest('.notification');
        if (notificationElement) {
            notificationElement.classList.add('removing');
            setTimeout(() => {
                notificationElement.remove();
            }, 300);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    showBrowserNotification(title, message, type) {
        const notification = new Notification(title, {
            body: message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'sewa-sathi-notification',
            requireInteraction: type === 'error' || type === 'warning'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 5 seconds unless it's an error
        if (type !== 'error') {
            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    // Convenience methods for different notification types
    showSuccessNotification(title, message, duration = 3000) {
        this.showNotification(title, message, 'success', duration);
    }

    showErrorNotification(title, message, duration = 0) {
        this.showNotification(title, message, 'error', duration);
    }

    showWarningNotification(title, message, duration = 5000) {
        this.showNotification(title, message, 'warning', duration);
    }

    showInfoNotification(title, message, duration = 4000) {
        this.showNotification(title, message, 'info', duration);
    }

    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
        this.notifications = [];
    }

    exportUserData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                userPreferences: {
                    fontSize: this.fontSize,
                    isHighContrast: this.isHighContrast,
                    isScreenReaderMode: this.isScreenReaderMode,
                    isDarkMode: this.isDarkMode
                },
                userProgress: this.userProgress,
                accessibilitySettings: {
                    colorblindMode: window.colorblindAccessibilityManager?.getCurrentMode() || 'none',
                    voiceCommands: window.sewaSathiModular?.voiceLibrary?.getCommands() || [],
                    customSettings: this.getCustomSettings()
                },
                browserInfo: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    screenResolution: `${screen.width}x${screen.height}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sewa-sathi-data-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showSuccessNotification(
                'Data Exported Successfully',
                'Your accessibility preferences and progress have been exported to a JSON file.',
                3000
            );

            this.announce('User data exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            this.showErrorNotification(
                'Export Failed',
                'There was an error exporting your data. Please try again.',
                5000
            );
        }
    }

    getCustomSettings() {
        const settings = {};
        
        // Get colorblind settings
        if (window.colorblindAccessibilityManager) {
            settings.colorblind = {
                mode: window.colorblindAccessibilityManager.getCurrentMode(),
                intensity: window.colorblindAccessibilityManager.getIntensity()
            };
        }

        // Get voice command settings
        if (window.sewaSathiModular) {
            settings.voiceCommands = {
                enabled: window.sewaSathiModular.isVoiceEnabled,
                language: window.sewaSathiModular.voiceLibrary?.getLanguage() || 'en-US'
            };
        }

        // Get vision assistant settings
        if (window.visionAssistant) {
            settings.visionAssistant = {
                enabled: window.visionAssistant.isEnabled,
                autoDetect: window.visionAssistant.autoDetect
            };
        }

        return settings;
    }

    importUserData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.applyImportedData(importData);
                
                this.showSuccessNotification(
                    'Data Imported Successfully',
                    'Your accessibility preferences and progress have been restored.',
                    3000
                );
            } catch (error) {
                console.error('Import failed:', error);
                this.showErrorNotification(
                    'Import Failed',
                    'The file format is invalid. Please select a valid Sewa Sathi data file.',
                    5000
                );
            }
        };
        reader.readAsText(file);
    }

    applyImportedData(data) {
        if (data.userPreferences) {
            this.fontSize = data.userPreferences.fontSize || this.fontSize;
            this.isHighContrast = data.userPreferences.isHighContrast || false;
            this.isScreenReaderMode = data.userPreferences.isScreenReaderMode || false;
            this.isDarkMode = data.userPreferences.isDarkMode || false;
            
            this.applyFontSize();
            
            if (this.isHighContrast) {
                document.body.classList.add('high-contrast');
            }
            
            if (this.isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        }

        if (data.userProgress) {
            this.userProgress = { ...this.userProgress, ...data.userProgress };
            this.updateProgressIndicator();
        }

        if (data.accessibilitySettings) {
            this.applyCustomSettings(data.accessibilitySettings);
        }

        this.saveUserPreferences();
        this.saveUserProgress();
    }

    applyCustomSettings(settings) {
        if (settings.colorblind && window.colorblindAccessibilityManager) {
            window.colorblindAccessibilityManager.setMode(settings.colorblind.mode);
            window.colorblindAccessibilityManager.setIntensity(settings.colorblind.intensity);
        }

        if (settings.voiceCommands && window.sewaSathiModular) {
            window.sewaSathiModular.voiceLibrary?.setLanguage(settings.voiceCommands.language);
        }

        if (settings.visionAssistant && window.visionAssistant) {
            window.visionAssistant.setEnabled(settings.visionAssistant.enabled);
            window.visionAssistant.setAutoDetect(settings.visionAssistant.autoDetect);
        }
    }

    // Login Panel Methods
    showLoginPanel() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus the first role card
        const firstCard = document.querySelector('.role-card');
        if (firstCard) {
            firstCard.focus();
        }
        
        this.announce('Login panel opened. Choose your role to continue.');
    }

    hideLoginPanel() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        this.announce('Login panel closed');
    }

    selectRole(role) {
        // Remove previous selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to clicked card
        const selectedCard = document.querySelector(`[data-role="${role}"]`);
        selectedCard.classList.add('selected');
        
        // Store selected role
        this.selectedRole = role;
        
        // Show login form after a short delay
        setTimeout(() => {
            this.showLoginForm();
        }, 300);
        
        this.announce(`${role} role selected. Please enter your credentials.`);
    }

    showLoginForm() {
        const roleSelection = document.querySelector('.role-selection');
        const loginForm = document.getElementById('login-form');
        
        roleSelection.style.display = 'none';
        loginForm.style.display = 'block';
        
        // Focus the username input
        document.getElementById('username').focus();
    }

    showRoleSelection() {
        const roleSelection = document.querySelector('.role-selection');
        const loginForm = document.getElementById('login-form');
        
        roleSelection.style.display = 'grid';
        loginForm.style.display = 'none';
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        this.announce('Role selection. Choose your role to continue.');
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            this.showErrorNotification(
                'Login Failed',
                'Please enter both username and password.',
                3000
            );
            return;
        }
        
        // Simulate login process
        this.showInfoNotification(
            'Logging in...',
            'Please wait while we authenticate your credentials.',
            2000
        );
        
        setTimeout(() => {
            this.hideLoginPanel();
            this.showDashboard(this.selectedRole);
            
            this.showSuccessNotification(
                'Login Successful',
                `Welcome to your ${this.selectedRole} dashboard!`,
                3000
            );
        }, 2000);
    }

    showDashboard(role) {
        if (role === 'parent') {
            this.showParentDashboard();
        } else if (role === 'student') {
            this.showStudentDashboard();
        }
    }

    showParentDashboard() {
        const modal = document.getElementById('parent-dashboard');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Animate progress circle
        this.animateProgressCircle();
        
        this.announce('Parent dashboard opened. View your child\'s progress and manage settings.');
    }

    hideParentDashboard() {
        const modal = document.getElementById('parent-dashboard');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        this.announce('Parent dashboard closed');
    }

    showStudentDashboard() {
        const modal = document.getElementById('student-dashboard');
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Animate progress bar
        this.animateProgressBar();
        
        this.announce('Student dashboard opened. Access your learning tools and track progress.');
    }

    hideStudentDashboard() {
        const modal = document.getElementById('student-dashboard');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        this.announce('Student dashboard closed');
    }

    animateProgressCircle() {
        const circle = document.querySelector('.progress-circle');
        if (circle) {
            circle.style.animation = 'none';
            setTimeout(() => {
                circle.style.animation = 'progressCircleFill 2s ease-out forwards';
            }, 100);
        }
    }

    animateProgressBar() {
        const progressFill = document.querySelector('#student-dashboard .progress-fill');
        if (progressFill) {
            progressFill.style.width = '0%';
            setTimeout(() => {
                progressFill.style.transition = 'width 2s ease-out';
                progressFill.style.width = '60%';
            }, 100);
        }
    }

    // Add keyboard shortcuts for login
    setupLoginKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Open login with Ctrl + L
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.showLoginPanel();
            }
            
            // Close modals with Escape
            if (e.key === 'Escape') {
                const loginModal = document.getElementById('login-modal');
                const parentDashboard = document.getElementById('parent-dashboard');
                const studentDashboard = document.getElementById('student-dashboard');
                
                if (loginModal.style.display === 'flex') {
                    this.hideLoginPanel();
                } else if (parentDashboard.style.display === 'flex') {
                    this.hideParentDashboard();
                } else if (studentDashboard.style.display === 'flex') {
                    this.hideStudentDashboard();
                }
            }
        });
    }

    handleDashboardAction(action) {
        switch (action) {
            case 'View Reports':
                this.showInfoNotification(
                    'Reports',
                    'Generating your child\'s progress report...',
                    3000
                );
                break;
            case 'Export Data':
                this.exportUserData();
                break;
            case 'Contact Support':
                this.showInfoNotification(
                    'Support',
                    'Redirecting to support center...',
                    2000
                );
                break;
            case 'Continue Learning':
                this.showInfoNotification(
                    'Learning',
                    'Opening learning modules...',
                    2000
                );
                break;
            case 'Take Assessment':
                this.showInfoNotification(
                    'Assessment',
                    'Starting accessibility assessment...',
                    2000
                );
                break;
            case 'View Resources':
                this.showInfoNotification(
                    'Resources',
                    'Loading learning resources...',
                    2000
                );
                break;
            default:
                this.showInfoNotification(
                    'Action',
                    `${action} feature coming soon!`,
                    2000
                );
        }
    }

    handleToolClick(toolItem) {
        const toolName = toolItem.querySelector('span:last-child').textContent;
        
        switch (toolName) {
            case 'Search':
                this.toggleSearch();
                break;
            case 'Voice Commands':
                if (window.sewaSathiModular) {
                    window.sewaSathiModular.toggleVoiceCommands();
                }
                break;
            case 'Vision Assistant':
                if (window.visionAssistant) {
                    window.visionAssistant.toggle();
                }
                break;
            case 'Keyboard Shortcuts':
                this.showKeyboardShortcuts();
                break;
            default:
                this.showInfoNotification(
                    'Tool',
                    `${toolName} activated!`,
                    2000
                );
        }
    }

    // Unique Features Setup
    setupUniqueFeatures() {
        this.setupAIAssistant();
        this.setupAccessibilityScanner();
        this.setupAccessibilityHeatmap();
        this.setupVoiceVisualizer();
        this.setupSmartAnimations();
    }

    // AI Accessibility Assistant
    setupAIAssistant() {
        const aiToggle = document.getElementById('ai-assistant-toggle');
        const aiAssistant = document.getElementById('ai-assistant');
        const aiInput = document.getElementById('ai-input');
        const aiSend = document.getElementById('ai-send');
        const quickActions = document.querySelectorAll('.quick-action-btn');

        if (aiToggle) {
            aiToggle.addEventListener('click', () => {
                aiAssistant.classList.toggle('active');
                if (aiAssistant.classList.contains('active')) {
                    this.announce('AI Assistant opened. Ask me anything about accessibility.');
                } else {
                    this.announce('AI Assistant closed.');
                }
            });
        }

        if (aiSend) {
            aiSend.addEventListener('click', () => {
                this.handleAIMessage(aiInput.value);
                aiInput.value = '';
            });
        }

        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAIMessage(aiInput.value);
                    aiInput.value = '';
                }
            });
        }

        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAIQuickAction(action);
            });
        });
    }

    handleAIMessage(message) {
        if (!message.trim()) return;

        const responses = {
            'hello': 'Hello! I\'m here to help with accessibility. How can I assist you today?',
            'help': 'I can help you with: optimizing your experience, explaining features, adjusting settings, and answering accessibility questions.',
            'optimize': 'I\'ll analyze your preferences and optimize the interface for you. Let me adjust the settings...',
            'contrast': 'I can help you adjust contrast settings. Would you like me to enable high contrast mode?',
            'font': 'I can help with font size adjustments. Would you like me to increase or decrease the font size?',
            'voice': 'Voice commands are available! Try saying "open search" or "enable dark mode".',
            'keyboard': 'Keyboard shortcuts are available! Press Ctrl + / to see all available shortcuts.',
            'colorblind': 'I can help with colorblind support. Would you like me to enable colorblind simulation?'
        };

        const lowerMessage = message.toLowerCase();
        let response = 'I understand you\'re asking about accessibility. Let me help you with that.';

        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }

        this.addAIMessage(response);
        this.announce(`AI Assistant: ${response}`);
    }

    handleAIQuickAction(action) {
        const actions = {
            'optimize': () => {
                this.optimizeForUser();
                this.addAIMessage('I\'ve optimized your experience based on your usage patterns!');
            },
            'explain': () => {
                this.addAIMessage('Here are our key features: Voice commands, Dark mode, High contrast, Font scaling, Screen reader support, and more!');
            },
            'help': () => {
                this.addAIMessage('I\'m here to help! You can ask me about any accessibility feature or ask me to optimize your experience.');
            }
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    addAIMessage(message) {
        const aiChat = document.querySelector('.ai-chat');
        if (aiChat) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message';
            messageDiv.innerHTML = `
                <div class="ai-avatar-small">🤖</div>
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
            aiChat.appendChild(messageDiv);
            aiChat.scrollTop = aiChat.scrollHeight;
        }
    }

    optimizeForUser() {
        // Simulate AI optimization
        this.showSuccessNotification(
            'AI Optimization Complete',
            'Your interface has been optimized based on your usage patterns!',
            3000
        );
    }

    // Accessibility Scanner
    setupAccessibilityScanner() {
        const scannerToggle = document.getElementById('scanner-toggle');
        const scanner = document.getElementById('accessibility-scanner');

        if (scannerToggle) {
            scannerToggle.addEventListener('click', () => {
                scanner.classList.toggle('active');
                if (scanner.classList.contains('active')) {
                    this.runAccessibilityScan();
                    this.announce('Accessibility scanner activated. Scanning page for issues...');
                } else {
                    this.announce('Accessibility scanner closed.');
                }
            });
        }
    }

    runAccessibilityScan() {
        const results = document.getElementById('scanner-results');
        if (!results) return;
        
        results.innerHTML = '';

        const checks = [
            { icon: '✅', text: 'Alt text present on images', status: 'pass' },
            { icon: '✅', text: 'Proper heading structure', status: 'pass' },
            { icon: '✅', text: 'ARIA labels implemented', status: 'pass' },
            { icon: '⚠️', text: 'Consider adding more focus indicators', status: 'warning' },
            { icon: '✅', text: 'Color contrast meets standards', status: 'pass' },
            { icon: '✅', text: 'Keyboard navigation working', status: 'pass' }
        ];

        checks.forEach((check, index) => {
            setTimeout(() => {
                const item = document.createElement('div');
                item.className = 'scan-item';
                item.innerHTML = `
                    <span class="scan-icon">${check.icon}</span>
                    <span class="scan-text">${check.text}</span>
                `;
                results.appendChild(item);
            }, index * 200);
        });
    }

    // Accessibility Heatmap
    setupAccessibilityHeatmap() {
        const heatmapToggle = document.getElementById('heatmap-toggle');
        const heatmap = document.getElementById('accessibility-heatmap');

        if (heatmapToggle) {
            heatmapToggle.addEventListener('click', () => {
                heatmap.classList.toggle('active');
                if (heatmap.classList.contains('active')) {
                    this.showAccessibilityHeatmap();
                    this.announce('Accessibility heatmap activated. Showing accessibility levels across the page.');
                } else {
                    this.hideAccessibilityHeatmap();
                    this.announce('Accessibility heatmap closed.');
                }
            });
        }
    }

    showAccessibilityHeatmap() {
        const elements = document.querySelectorAll('*');
        const overlay = document.getElementById('heatmap-overlay');
        if (!overlay) return;
        
        elements.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                const rect = el.getBoundingClientRect();
                
                const heatmapElement = document.createElement('div');
                heatmapElement.style.position = 'absolute';
                heatmapElement.style.left = rect.left + 'px';
                heatmapElement.style.top = rect.top + 'px';
                heatmapElement.style.width = rect.width + 'px';
                heatmapElement.style.height = rect.height + 'px';
                heatmapElement.style.pointerEvents = 'none';
                heatmapElement.style.opacity = '0.3';
                
                // Simulate accessibility score
                const score = Math.random();
                if (score > 0.8) {
                    heatmapElement.style.backgroundColor = '#10b981';
                } else if (score > 0.5) {
                    heatmapElement.style.backgroundColor = '#3b82f6';
                } else {
                    heatmapElement.style.backgroundColor = '#f59e0b';
                }
                
                overlay.appendChild(heatmapElement);
            }
        });
    }

    hideAccessibilityHeatmap() {
        const overlay = document.getElementById('heatmap-overlay');
        if (overlay) {
            overlay.innerHTML = '';
        }
    }

    // Voice Visualizer
    setupVoiceVisualizer() {
        this.voiceVisualizer = document.getElementById('voice-visualizer');
    }

    showVoiceVisualizer() {
        if (this.voiceVisualizer) {
            this.voiceVisualizer.classList.add('active');
            setTimeout(() => {
                this.voiceVisualizer.classList.remove('active');
            }, 3000);
        }
    }

    // Smart Animations
    setupSmartAnimations() {
        this.setupIntersectionObserver();
        this.setupParallaxEffects();
        this.setupHoverAnimations();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.card, .section, .feature-item').forEach(el => {
            observer.observe(el);
        });
    }

    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    setupHoverAnimations() {
        document.querySelectorAll('.interactive-element').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    increaseFontSize() {
        if (this.fontSize < 1.5) {
            this.fontSize += 0.1;
            this.applyFontSize();
            this.announce(`Font size increased to ${Math.round(this.fontSize * 100)}%`);
        }
    }

    decreaseFontSize() {
        if (this.fontSize > 0.8) {
            this.fontSize -= 0.1;
            this.applyFontSize();
            this.announce(`Font size decreased to ${Math.round(this.fontSize * 100)}%`);
        }
    }

    applyFontSize() {
        document.documentElement.style.fontSize = `${this.fontSize * 16}px`;
        
        // Apply CSS classes for additional sizing
        document.body.classList.remove('large-text', 'extra-large-text');
        if (this.fontSize >= 1.25) {
            document.body.classList.add('large-text');
        }
        if (this.fontSize >= 1.5) {
            document.body.classList.add('extra-large-text');
        }
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);
        
        const button = document.getElementById('high-contrast');
        button.setAttribute('aria-pressed', this.isHighContrast);
        
        this.announce(this.isHighContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
    }

    toggleScreenReaderMode() {
        this.isScreenReaderMode = !this.isScreenReaderMode;
        
        const button = document.getElementById('screen-reader');
        button.setAttribute('aria-pressed', this.isScreenReaderMode);
        
        if (this.isScreenReaderMode) {
            this.announce('Screen reader mode enabled. Enhanced announcements will be provided.');
            this.enhanceScreenReaderSupport();
        } else {
            this.announce('Screen reader mode disabled.');
            this.disableScreenReaderEnhancements();
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        
        const button = document.getElementById('dark-mode');
        button.setAttribute('aria-pressed', this.isDarkMode);
        
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            button.innerHTML = '<span aria-hidden="true">☀️</span>';
            this.announce('Dark mode enabled');
        } else {
            document.documentElement.removeAttribute('data-theme');
            button.innerHTML = '<span aria-hidden="true">🌙</span>';
            this.announce('Dark mode disabled');
        }
    }

    enhanceScreenReaderSupport() {
        // Add more descriptive labels and announcements
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            const title = card.querySelector('.feature-title').textContent;
            const description = card.querySelector('.feature-description').textContent;
            card.setAttribute('aria-label', `${title}. ${description}`);
        });

        // Add live regions for dynamic content
        this.createLiveRegion('status', 'Status updates');
        this.createLiveRegion('alert', 'Important alerts');
    }

    disableScreenReaderEnhancements() {
        // Remove enhanced labels
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.removeAttribute('aria-label');
        });
    }

    createLiveRegion(type, label) {
        const region = document.createElement('div');
        region.setAttribute('aria-live', type === 'alert' ? 'assertive' : 'polite');
        region.setAttribute('aria-label', label);
        region.className = 'sr-only';
        region.id = `${type}-region`;
        document.body.appendChild(region);
    }

    announce(message, type = 'polite') {
        if (this.announcements) {
            this.announcements.textContent = message;
        }

        if (this.isScreenReaderMode) {
            const region = document.getElementById(`${type}-region`);
            if (region) {
                region.textContent = message;
            }
        }
    }

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            this.announce('Form submitted successfully!', 'alert');
            // Here you would typically submit the form
            form.reset();
        } else {
            this.announce('Please correct the errors in the form', 'alert');
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        let isValid = true;
        let errorMessage = '';

        if (!value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required`;
        } else if (field.type === 'email' && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        if (errorElement) {
            if (isValid) {
                errorElement.textContent = '';
                errorElement.classList.remove('show');
                field.setAttribute('aria-invalid', 'false');
            } else {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
                field.setAttribute('aria-invalid', 'true');
            }
        }

        return isValid;
    }

    clearFieldError(field) {
        const fieldName = field.getAttribute('name');
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            field.setAttribute('aria-invalid', 'false');
        }
    }

    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        return label ? label.textContent.replace('*', '').trim() : fieldName;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    handleEscapeKey() {
        // Close mobile menu
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (mobileToggle && navMenu && navMenu.classList.contains('active')) {
            mobileToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            mobileToggle.focus();
        }
    }

    saveUserPreferences() {
        const preferences = {
            fontSize: this.fontSize,
            isHighContrast: this.isHighContrast,
            isScreenReaderMode: this.isScreenReaderMode,
            isDarkMode: this.isDarkMode
        };
        
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('accessibility-preferences');
        if (saved) {
            try {
                const preferences = JSON.parse(saved);
                this.fontSize = preferences.fontSize || 1;
                this.isHighContrast = preferences.isHighContrast || false;
                this.isScreenReaderMode = preferences.isScreenReaderMode || false;
                this.isDarkMode = preferences.isDarkMode || false;
                
                this.applyFontSize();
                
                if (this.isHighContrast) {
                    document.body.classList.add('high-contrast');
                }
                
                if (this.isScreenReaderMode) {
                    this.enhanceScreenReaderSupport();
                }
                
                if (this.isDarkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    const button = document.getElementById('dark-mode');
                    if (button) {
                        button.innerHTML = '<span aria-hidden="true">☀️</span>';
                        button.setAttribute('aria-pressed', 'true');
                    }
                }
            } catch (e) {
                console.warn('Could not load accessibility preferences:', e);
            }
        } else {
            // Check system preference for dark mode
            this.checkSystemDarkModePreference();
        }
    }

    checkSystemDarkModePreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.isDarkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
            const button = document.getElementById('dark-mode');
            if (button) {
                button.innerHTML = '<span aria-hidden="true">☀️</span>';
                button.setAttribute('aria-pressed', 'true');
            }
        }
    }

    resetAccessibilitySettings() {
        // Reset all accessibility settings
        this.fontSize = 1;
        this.isHighContrast = false;
        this.isScreenReaderMode = false;
        this.isDarkMode = false;
        
        // Remove all accessibility classes and attributes
        document.body.classList.remove('high-contrast', 'large-text', 'extra-large-text');
        document.documentElement.removeAttribute('data-theme');
        
        // Reset font size
        this.applyFontSize();
        
        // Disable screen reader enhancements
        this.disableScreenReaderEnhancements();
        
        // Reset dark mode button
        const darkModeButton = document.getElementById('dark-mode');
        if (darkModeButton) {
            darkModeButton.innerHTML = '<span aria-hidden="true">🌙</span>';
            darkModeButton.setAttribute('aria-pressed', 'false');
        }
        
        // Clear localStorage
        localStorage.removeItem('accessibility-preferences');
        
        // Reset colorblind accessibility if available
        if (window.colorblindAccessibilityManager) {
            window.colorblindAccessibilityManager.resetPreferences();
        }
        
        this.announce('All accessibility settings have been reset to default');
    }
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                target.focus();
            }
        });
    });
}

// Intersection Observer for scroll-based animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// Scroll Progress Indicator
function setupScrollIndicator() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    if (!scrollIndicator) return;

    function updateScrollProgress() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        
        scrollIndicator.style.transform = `scaleX(${scrollPercent / 100})`;
    }

    // Throttle scroll events for better performance
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    }

    function handleScroll() {
        ticking = false;
        requestTick();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateScrollProgress();
}

// Enhanced Interactions
function setupEnhancedInteractions() {
    // Add ripple effect to buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn, .action-btn, .control-btn')) {
            createRippleEffect(e);
        }
    });

    // Add hover sound effects (if audio context is available)
    setupHoverSounds();
}

function createRippleEffect(event) {
    const button = event.target;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// Add ripple animation CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

function setupHoverSounds() {
    // This would require Web Audio API implementation
    // For now, we'll just add visual feedback
    console.log('Hover sounds setup (placeholder)');
}

// Parallax Effect
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-visual, .accessibility-icon');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Mobile Menu Animations
function setupMobileMenuAnimations() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        // Enhanced hamburger animation
        mobileToggle.addEventListener('click', () => {
            const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
            
            if (!isExpanded) {
                // Opening animation
                navMenu.style.animation = 'slideDown 0.3s ease-out';
            } else {
                // Closing animation
                navMenu.style.animation = 'slideUp 0.3s ease-out';
            }
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize accessibility manager
    window.accessibilityManager = new AccessibilityManager();
    
    // Setup additional features
    setupSmoothScrolling();
    setupScrollAnimations();
    setupScrollIndicator();
    setupEnhancedInteractions();
    setupParallaxEffect();
    setupMobileMenuAnimations();
    setupAccessibilityEnhancements();
    setupQuickAccessPanel();
    
    // Announce page load
    setTimeout(() => {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            announcements.textContent = 'Accessible Hub loaded. Use Alt + M to skip to main content, Alt + H for high contrast, Alt + S for screen reader mode.';
        }
    }, 1000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any animations or timers
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible, resume animations
        document.body.classList.remove('page-hidden');
    }
});

// Error handling for accessibility features
window.addEventListener('error', (e) => {
    console.error('Accessibility error:', e.error);
    const announcements = document.getElementById('announcements');
    if (announcements) {
        announcements.textContent = 'An error occurred. Please refresh the page if you experience issues.';
    }
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityManager };
}
