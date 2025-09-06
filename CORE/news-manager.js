// News Manager - NewsData.io API Integration with Auto TTS for Deaf Users
class NewsManager {
    constructor() {
        this.apiKey = 'pub_e14ad484f8cc427e992da8aa839263f4';
        this.baseUrl = 'https://newsdata.io/api/1/news';
        this.currentCategory = 'all';
        this.autoReadEnabled = false;
        this.isDeafUser = false;
        this.currentlySpeaking = false;
        this.synthesis = window.speechSynthesis;
        this.newsData = [];
        this.currentArticleIndex = 0;
        
        this.init();
    }

    init() {
        this.detectDeafUser();
        this.setupEventListeners();
        this.loadNews();
        this.setupAutoRead();
    }

    detectDeafUser() {
        // Check if user has selected hearing impairment in accessibility settings
        const savedDisability = localStorage.getItem('accessibility-disability-type');
        this.isDeafUser = savedDisability === 'hearing';
        
        // Also check for reduced motion preference (often used by deaf users)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isDeafUser = true;
        }
        
        // Auto-enable TTS for deaf users
        if (this.isDeafUser) {
            this.autoReadEnabled = true;
            this.updateAutoReadUI();
            this.showAutoReadIndicator();
        }
    }

    setupEventListeners() {
        // Category filter
        document.getElementById('news-category').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.loadNews();
        });

        // Refresh button
        document.getElementById('refresh-news').addEventListener('click', () => {
            this.loadNews();
        });

        // Auto-read toggle
        document.getElementById('auto-read-toggle').addEventListener('click', () => {
            this.toggleAutoRead();
        });

        // Retry button
        document.getElementById('retry-news').addEventListener('click', () => {
            this.loadNews();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                this.toggleAutoRead();
            }
        });
    }

    async loadNews() {
        this.showLoading();
        this.hideError();

        try {
            const params = new URLSearchParams({
                apikey: this.apiKey,
                country: 'np,in,us,gb', // Nepal, India, US, UK
                language: 'en',
                page: 1
            });

            // Add category filter if not 'all'
            if (this.currentCategory !== 'all') {
                params.append('category', this.currentCategory);
            }

            const response = await fetch(`${this.baseUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success' && data.results) {
                this.newsData = data.results.slice(0, 12); // Limit to 12 articles
                this.displayNews();
                
                // Auto-read first article for deaf users
                if (this.isDeafUser && this.autoReadEnabled && this.newsData.length > 0) {
                    setTimeout(() => {
                        this.speakArticle(this.newsData[0]);
                    }, 1000);
                }
            } else {
                throw new Error(data.message || 'Failed to load news');
            }
        } catch (error) {
            console.error('News loading error:', error);
            this.showError();
        }
    }

    displayNews() {
        const newsGrid = document.getElementById('news-grid');
        newsGrid.innerHTML = '';

        this.newsData.forEach((article, index) => {
            const newsCard = this.createNewsCard(article, index);
            newsGrid.appendChild(newsCard);
        });

        this.hideLoading();
    }

    createNewsCard(article, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.setAttribute('data-index', index);

        const imageUrl = article.image_url || 'https://via.placeholder.com/400x200?text=News+Image';
        const category = article.category ? article.category[0] : 'General';
        const publishedDate = new Date(article.pubDate).toLocaleDateString();

        card.innerHTML = `
            <img src="${imageUrl}" alt="${article.title}" class="news-card-image" loading="lazy">
            <div class="news-card-content">
                <span class="news-card-category">${category}</span>
                <h3 class="news-card-title">${article.title}</h3>
                <p class="news-card-description">${article.description || 'No description available.'}</p>
                <div class="news-card-meta">
                    <span class="news-card-source">${article.source_id}</span>
                    <span class="news-card-date">${publishedDate}</span>
                </div>
                <div class="news-card-actions">
                    <button class="news-card-read-btn" onclick="window.open('${article.link}', '_blank')">
                        Read Full Article
                    </button>
                    <button class="news-card-speak-btn" data-index="${index}" aria-label="Speak article">
                        🔊
                    </button>
                </div>
            </div>
        `;

        // Add click event for speak button
        const speakBtn = card.querySelector('.news-card-speak-btn');
        speakBtn.addEventListener('click', () => {
            this.speakArticle(article, index);
        });

        return card;
    }

    speakArticle(article, index = 0) {
        if (!this.synthesis) {
            console.warn('Text-to-speech not supported');
            return;
        }

        // Stop any current speech
        this.synthesis.cancel();

        const textToSpeak = `${article.title}. ${article.description || 'No description available.'}`;
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.8; // Slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        utterance.lang = 'en-US';

        // Update UI to show speaking status
        this.updateSpeakingStatus(index, true);

        utterance.onstart = () => {
            this.currentlySpeaking = true;
            this.showSpeakingIndicator();
        };

        utterance.onend = () => {
            this.currentlySpeaking = false;
            this.updateSpeakingStatus(index, false);
            this.hideSpeakingIndicator();
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event.error);
            this.currentlySpeaking = false;
            this.updateSpeakingStatus(index, false);
            this.hideSpeakingIndicator();
        };

        this.synthesis.speak(utterance);
    }

    updateSpeakingStatus(index, isSpeaking) {
        const speakBtn = document.querySelector(`[data-index="${index}"]`);
        if (speakBtn) {
            if (isSpeaking) {
                speakBtn.classList.add('active');
                speakBtn.textContent = '⏸️';
            } else {
                speakBtn.classList.remove('active');
                speakBtn.textContent = '🔊';
            }
        }
    }

    showSpeakingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'speaking-indicator';
        indicator.className = 'auto-read-indicator';
        indicator.innerHTML = '🔊 Speaking article...';
        document.body.appendChild(indicator);
    }

    hideSpeakingIndicator() {
        const indicator = document.getElementById('speaking-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    toggleAutoRead() {
        this.autoReadEnabled = !this.autoReadEnabled;
        this.updateAutoReadUI();
        
        if (this.autoReadEnabled) {
            this.showAutoReadIndicator();
            // Start reading current articles
            if (this.newsData.length > 0) {
                this.startAutoReading();
            }
        } else {
            this.hideAutoReadIndicator();
            this.stopAutoReading();
        }
    }

    updateAutoReadUI() {
        const autoReadBtn = document.getElementById('auto-read-toggle');
        if (autoReadBtn) {
            if (this.autoReadEnabled) {
                autoReadBtn.classList.add('active');
                autoReadBtn.innerHTML = '<span aria-hidden="true">⏸️</span> Stop Auto-Read';
            } else {
                autoReadBtn.classList.remove('active');
                autoReadBtn.innerHTML = '<span aria-hidden="true">🔊</span> Auto-Read';
            }
        }
    }

    showAutoReadIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'auto-read-indicator';
        indicator.className = 'auto-read-indicator';
        indicator.innerHTML = '🔊 Auto-read enabled for deaf users';
        document.body.appendChild(indicator);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideAutoReadIndicator();
        }, 3000);
    }

    hideAutoReadIndicator() {
        const indicator = document.getElementById('auto-read-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    setupAutoRead() {
        if (this.isDeafUser && this.autoReadEnabled) {
            // Set up automatic reading of articles
            this.autoReadInterval = setInterval(() => {
                if (!this.currentlySpeaking && this.newsData.length > 0) {
                    this.currentArticleIndex = (this.currentArticleIndex + 1) % this.newsData.length;
                    this.speakArticle(this.newsData[this.currentArticleIndex], this.currentArticleIndex);
                }
            }, 15000); // Read every 15 seconds
        }
    }

    startAutoReading() {
        if (this.autoReadInterval) {
            clearInterval(this.autoReadInterval);
        }
        
        this.currentArticleIndex = 0;
        this.setupAutoRead();
    }

    stopAutoReading() {
        if (this.autoReadInterval) {
            clearInterval(this.autoReadInterval);
            this.autoReadInterval = null;
        }
        this.synthesis.cancel();
        this.currentlySpeaking = false;
    }

    showLoading() {
        document.getElementById('news-loading').style.display = 'block';
        document.getElementById('news-grid').style.display = 'none';
        document.getElementById('news-error').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('news-loading').style.display = 'none';
        document.getElementById('news-grid').style.display = 'grid';
    }

    showError() {
        document.getElementById('news-loading').style.display = 'none';
        document.getElementById('news-grid').style.display = 'none';
        document.getElementById('news-error').style.display = 'block';
    }

    hideError() {
        document.getElementById('news-error').style.display = 'none';
    }

    // Method to manually trigger news reading for accessibility
    readNewsForAccessibility() {
        if (this.newsData.length > 0) {
            const summary = `Latest news update. ${this.newsData.length} articles loaded. ` +
                this.newsData.slice(0, 3).map(article => 
                    `Article: ${article.title}. From ${article.source_id}.`
                ).join(' ');
            
            const utterance = new SpeechSynthesisUtterance(summary);
            utterance.rate = 0.7;
            utterance.volume = 0.9;
            this.synthesis.speak(utterance);
        }
    }
}

// Initialize News Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new NewsManager();
    
    // Announce news section for accessibility
    setTimeout(() => {
        if (window.newsManager && window.newsManager.isDeafUser) {
            window.newsManager.readNewsForAccessibility();
        }
    }, 3000);
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsManager;
}

