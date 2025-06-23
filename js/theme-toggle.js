/**
 * Theme toggle functionality
 * Handles dark/light mode switching with system preference detection
 */

const THEME_KEY = 'portfolio-theme';
const THEME_ATTRIBUTE = 'data-theme';

let currentTheme = 'light';

/**
 * Initialize theme toggle functionality
 */
export function initThemeToggle() {
    // Detect system theme preference
    const systemTheme = getSystemTheme();
    
    // Get stored theme preference or use system preference
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || systemTheme;
    
    // Apply initial theme
    setTheme(initialTheme, false);
    
    // Setup theme toggle button
    setupThemeToggleButton();
    
    // Listen for system theme changes
    setupSystemThemeListener();
    
    console.log(`Theme initialized: ${currentTheme}`);
}

/**
 * Get system theme preference
 */
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Get stored theme preference from localStorage
 */
function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch (error) {
        console.warn('Could not access localStorage for theme:', error);
        return null;
    }
}

/**
 * Store theme preference in localStorage
 */
function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.warn('Could not store theme in localStorage:', error);
    }
}

/**
 * Set the active theme
 */
function setTheme(theme, store = true) {
    currentTheme = theme;
    
    // Apply theme to document - always set explicit attribute
    if (theme === 'dark') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    } else {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    }
    
    // Update theme toggle button
    updateThemeToggleButton(theme);
    
    // Store preference
    if (store) {
        storeTheme(theme);
    }
    
    // Dispatch custom event for other components
    const themeChangeEvent = new CustomEvent('themechange', {
        detail: { theme: currentTheme }
    });
    document.dispatchEvent(themeChangeEvent);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Announce theme change to screen readers
    announceThemeChange(newTheme);
    
    // Track theme toggle for analytics
    trackThemeToggle(newTheme);
}

/**
 * Setup theme toggle button event listeners
 */
function setupThemeToggleButton() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    
    // Add click listener
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
    });
    
    // Add keyboard support
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
    
    // Initialize button state
    updateThemeToggleButton(currentTheme);
}

/**
 * Update theme toggle button appearance and accessibility attributes
 */
function updateThemeToggleButton(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-toggle-icon');
    
    if (!themeToggle || !themeIcon) return;
    
    // Update icon and labels
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
        themeToggle.setAttribute('title', 'Switch to light mode');
    } else {
        themeIcon.textContent = '🌙';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        themeToggle.setAttribute('title', 'Switch to dark mode');
    }
}

/**
 * Listen for system theme changes
 */
function setupSystemThemeListener() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Listen for changes in system theme preference
    mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const storedTheme = getStoredTheme();
        if (!storedTheme) {
            const systemTheme = e.matches ? 'dark' : 'light';
            setTheme(systemTheme, false); // Don't store system preference
        }
    });
}

/**
 * Announce theme changes to screen readers
 */
function announceThemeChange(theme) {
    const message = `Switched to ${theme} mode`;
    
    // Create or update live region for announcements
    let liveRegion = document.getElementById('theme-announcement');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'theme-announcement';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'visually-hidden';
        document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    
    // Clear announcement after a short delay
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

/**
 * Track theme toggle for analytics
 */
function trackThemeToggle(theme) {
    // This would integrate with your analytics service
    console.log('Theme toggled to:', theme);
    
    // Example implementations:
    
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'theme_toggle', {
            theme_preference: theme,
            event_category: 'ui_interaction'
        });
    }
    
    // Custom analytics service
    if (typeof analytics !== 'undefined') {
        analytics.track('Theme Toggle', {
            theme: theme,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Force set theme (useful for external controls)
 */
export function forceSetTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
        setTheme(theme);
    } else {
        console.warn('Invalid theme:', theme);
    }
}

/**
 * Reset theme to system preference
 */
export function resetToSystemTheme() {
    const systemTheme = getSystemTheme();
    setTheme(systemTheme);
    
    // Clear stored preference
    try {
        localStorage.removeItem(THEME_KEY);
    } catch (error) {
        console.warn('Could not clear theme from localStorage:', error);
    }
}

/**
 * Check if dark mode is active
 */
export function isDarkMode() {
    return currentTheme === 'dark';
}

/**
 * Listen for theme change events
 */
export function onThemeChange(callback) {
    document.addEventListener('themechange', (e) => {
        callback(e.detail.theme);
    });
}

// Initialize theme immediately to prevent flash of wrong theme
// This runs before the main init function
(function initializeThemeImmediately() {
    const storedTheme = getStoredTheme();
    const systemTheme = getSystemTheme();
    const initialTheme = storedTheme || systemTheme;
    
    // Always set explicit theme attribute
    if (initialTheme === 'dark') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'dark');
    } else {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light');
    }
    
    currentTheme = initialTheme;
})();
