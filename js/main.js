/**
 * Main JavaScript file for the portfolio website
 * Handles initialization and coordination of all modules
 */

import { initThemeToggle } from './theme-toggle.js';
import { initGitHubAPI } from './github-api.js';
import { initProjects } from './projects.js';
import { initModal } from './modal.js';

/**
 * Initialize the application
 */
async function init() {
    try {
        // Initialize theme system first (for immediate UI response)
        initThemeToggle();
        
        // Initialize modal system
        initModal();
        
        // Initialize projects section
        initProjects();
        
        // Initialize GitHub API and load repositories
        await initGitHubAPI();
        
        // Initialize smooth scrolling for navigation links
        initSmoothScrolling();
        
        // Initialize performance optimizations
        initPerformanceOptimizations();
        
        // Initialize accessibility features
        initAccessibilityFeatures();
        
        console.log('Portfolio application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

/**
 * Initialize smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                history.pushState(null, null, targetId);
                
                // Focus management for accessibility
                targetElement.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * Initialize performance optimizations
 */
function initPerformanceOptimizations() {
    // Lazy load images when they come into view
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Add loading="lazy" to non-critical images
    const nonCriticalImages = document.querySelectorAll('img:not(.critical)');
    nonCriticalImages.forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

/**
 * Preload critical resources for better performance
 */
function preloadCriticalResources() {
    const criticalResources = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
    });
}

/**
 * Initialize accessibility features
 */
function initAccessibilityFeatures() {
    // Add skip links navigation
    initSkipLinks();
    
    // Enhanced keyboard navigation
    initKeyboardNavigation();
    
    // ARIA live regions for dynamic content updates
    initLiveRegions();
    
    // Focus management
    initFocusManagement();
}

/**
 * Initialize skip links for better accessibility
 */
function initSkipLinks() {
    const skipLink = document.querySelector('.skip-link');
    
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Enhanced keyboard navigation
 */
function initKeyboardNavigation() {
    // Add keyboard support for interactive elements
    const interactiveElements = document.querySelectorAll(
        '.project-card, .repo-card, .contact-link'
    );
    
    interactiveElements.forEach(element => {
        // Make elements focusable
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listeners
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
    
    // Escape key handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close modal if open
            const modal = document.getElementById('modal-overlay');
            if (modal && !modal.classList.contains('hidden')) {
                modal.querySelector('.modal-close').click();
            }
        }
    });
}

/**
 * Initialize ARIA live regions for dynamic content updates
 */
function initLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    // Announce theme changes
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTimeout(() => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                announceToScreenReader(`Switched to ${currentTheme} mode`);
            }, 100);
        });
    }
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

/**
 * Initialize focus management
 */
function initFocusManagement() {
    // Store the last focused element before modal opens
    let lastFocusedElement = null;
    
    // Modal focus management
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (!modal.classList.contains('hidden')) {
                        // Modal opened
                        lastFocusedElement = document.activeElement;
                        const firstFocusable = modal.querySelector('.modal-close');
                        if (firstFocusable) {
                            firstFocusable.focus();
                        }
                    } else if (lastFocusedElement) {
                        // Modal closed
                        lastFocusedElement.focus();
                        lastFocusedElement = null;
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }
}

/**
 * Handle errors gracefully
 */
function handleError(error, context = 'Application') {
    console.error(`${context} Error:`, error);
    
    // Show user-friendly error message
    const errorMessage = `Sorry, something went wrong. Please refresh the page and try again.`;
    announceToScreenReader(errorMessage);
    
    // You could also show a toast notification or error banner here
    showErrorNotification(errorMessage);
}

/**
 * Show error notification to user
 */
function showErrorNotification(message) {
    // Create and show a temporary error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--error-primary)',
        color: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-lg)',
        zIndex: 'var(--z-tooltip)',
        maxWidth: '300px',
        boxShadow: 'var(--shadow-lg)'
    });
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Service Worker registration for performance and offline capabilities
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                // Note: Service worker file would need to be created separately
                // const registration = await navigator.serviceWorker.register('/sw.js');
                // console.log('ServiceWorker registration successful:', registration);
            } catch (error) {
                console.log('ServiceWorker registration failed:', error);
            }
        });
    }
}

// Global error handlers
window.addEventListener('error', (e) => {
    handleError(e.error, 'JavaScript');
});

window.addEventListener('unhandledrejection', (e) => {
    handleError(e.reason, 'Promise');
});

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential external use
export { announceToScreenReader, handleError };
