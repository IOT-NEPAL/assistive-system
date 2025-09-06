// Scroll Animations and UI Enhancements
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupNavbarScroll();
        this.setupParallaxEffects();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
    }

    setupScrollAnimations() {
        // Add scroll-triggered animations to sections
        const sections = document.querySelectorAll('section');
        
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'all 0.8s ease-out';
        });

        // Animate sections on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupNavbarScroll() {
        const navbar = document.querySelector('nav');
        if (!navbar) return;

        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-visual, .accessibility-icon');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupIntersectionObserver() {
        // Animate feature cards on scroll
        const featureCards = document.querySelectorAll('.feature-card');
        
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, {
            threshold: 0.1
        });

        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            cardObserver.observe(card);
        });
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Add floating animation to buttons
    addFloatingEffect() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.animation = 'buttonFloat 0.6s ease-out';
            });
            
            button.addEventListener('animationend', () => {
                button.style.animation = '';
            });
        });
    }

    // Add typing effect to hero title
    addTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };

        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }

    // Add particle effect to hero section
    addParticleEffect() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat ${3 + Math.random() * 4}s linear infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 2}s;
            `;
            hero.appendChild(particle);
        }
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes buttonFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
    
    @keyframes particleFloat {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
    .particle {
        position: absolute;
        pointer-events: none;
    }
    
    nav {
        transition: all 0.3s ease;
    }
    
    nav.scrolled {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        padding: var(--spacing-sm) 0;
    }
`;
document.head.appendChild(style);

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scrollAnimations = new ScrollAnimations();
    
    // Add additional effects after a delay
    setTimeout(() => {
        window.scrollAnimations.addFloatingEffect();
        window.scrollAnimations.addTypingEffect();
        window.scrollAnimations.addParticleEffect();
    }, 2000);
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollAnimations;
}

