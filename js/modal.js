/**
 * Modal functionality
 * Handles opening, closing, and accessibility features for modal dialogs
 */

let isModalOpen = false;
let focusedElementBeforeModal = null;
let modalCloseCallback = null;

/**
 * Initialize modal functionality
 */
export function initModal() {
    setupModalEventListeners();
    setupKeyboardNavigation();
    console.log('Modal system initialized');
}

/**
 * Open modal with title and content
 */
export function openModal(title, content, options = {}) {
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) {
        console.error('Modal elements not found');
        return;
    }
    
    // Store currently focused element
    focusedElementBeforeModal = document.activeElement;
    
    // Set modal content
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    // Apply options
    if (options.className) {
        modal.classList.add(options.className);
    }
    
    // Store close callback if provided
    modalCloseCallback = options.onClose || null;
    
    // Show modal
    modal.classList.remove('hidden');
    isModalOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    setTimeout(() => {
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
    
    // Trap focus within modal
    trapFocus(modal);
    
    // Announce modal opening to screen readers
    announceToScreenReader(`Dialog opened: ${title}`);
    
    // Track modal opening
    trackModalEvent('modal_opened', { title });
}

/**
 * Close modal
 */
export function closeModal() {
    const modal = document.getElementById('modal-overlay');
    
    if (!modal || !isModalOpen) {
        return;
    }
    
    // Execute close callback if provided
    if (modalCloseCallback) {
        modalCloseCallback();
        modalCloseCallback = null;
    }
    
    // Hide modal
    modal.classList.add('hidden');
    isModalOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Remove any applied classes
    modal.className = modal.className
        .split(' ')
        .filter(cls => cls === 'modal-overlay' || cls === 'hidden')
        .join(' ');
    
    // Restore focus
    if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
        focusedElementBeforeModal = null;
    }
    
    // Announce modal closing to screen readers
    announceToScreenReader('Dialog closed');
    
    // Track modal closing
    trackModalEvent('modal_closed');
}

/**
 * Setup modal event listeners
 */
function setupModalEventListeners() {
    const modal = document.getElementById('modal-overlay');
    
    if (!modal) {
        console.warn('Modal overlay not found');
        return;
    }
    
    // Close button click
    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent clicks inside modal from closing it
    const modalContainer = modal.querySelector('.modal-container');
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

/**
 * Setup keyboard navigation for modal
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (!isModalOpen) return;
        
        // Close modal on Escape key
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
        
        // Tab key handling for focus trapping
        if (e.key === 'Tab') {
            handleTabKey(e);
        }
    });
}

/**
 * Handle tab key for focus trapping within modal
 */
function handleTabKey(e) {
    const modal = document.getElementById('modal-overlay');
    if (!modal || modal.classList.contains('hidden')) return;
    
    const focusableElements = getFocusableElements(modal);
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift + tab on first element, focus last element
    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    }
    // If tab on last element, focus first element
    else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container) {
    const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
    ];
    
    const focusableElements = container.querySelectorAll(focusableSelectors.join(', '));
    
    return Array.from(focusableElements).filter(element => {
        return isElementVisible(element) && !isElementDisabled(element);
    });
}

/**
 * Check if element is visible
 */
function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
}

/**
 * Check if element is disabled
 */
function isElementDisabled(element) {
    return element.disabled || 
           element.getAttribute('aria-disabled') === 'true' ||
           element.closest('[aria-disabled="true"]');
}

/**
 * Trap focus within modal
 */
function trapFocus(modal) {
    const focusableElements = getFocusableElements(modal);
    
    if (focusableElements.length === 0) {
        // If no focusable elements, make modal container focusable
        const modalContainer = modal.querySelector('.modal-container');
        if (modalContainer) {
            modalContainer.setAttribute('tabindex', '-1');
            modalContainer.focus();
        }
    }
}

/**
 * Show confirmation modal
 */
export function showConfirmModal(title, message, options = {}) {
    return new Promise((resolve) => {
        const content = `
            <div class="confirm-modal-content">
                <p class="confirm-message">${escapeHtml(message)}</p>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" id="confirm-cancel">
                        ${options.cancelText || 'Cancel'}
                    </button>
                    <button class="btn btn-primary" id="confirm-ok">
                        ${options.confirmText || 'OK'}
                    </button>
                </div>
            </div>
            
            <style>
                .confirm-modal-content {
                    text-align: center;
                    padding: var(--space-4);
                }
                
                .confirm-message {
                    margin-bottom: var(--space-8);
                    font-size: var(--font-size-lg);
                    color: var(--text-secondary);
                    line-height: var(--line-height-relaxed);
                }
                
                .confirm-actions {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: center;
                }
                
                @media (max-width: 480px) {
                    .confirm-actions {
                        flex-direction: column;
                    }
                }
            </style>
        `;
        
        openModal(title, content, {
            className: 'confirm-modal',
            onClose: () => resolve(false)
        });
        
        // Setup confirm/cancel handlers
        setTimeout(() => {
            const cancelBtn = document.getElementById('confirm-cancel');
            const okBtn = document.getElementById('confirm-ok');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    closeModal();
                    resolve(false);
                });
            }
            
            if (okBtn) {
                okBtn.addEventListener('click', () => {
                    closeModal();
                    resolve(true);
                });
                okBtn.focus(); // Focus OK button by default
            }
        }, 100);
    });
}

/**
 * Show alert modal
 */
export function showAlertModal(title, message, options = {}) {
    return new Promise((resolve) => {
        const content = `
            <div class="alert-modal-content">
                <p class="alert-message">${escapeHtml(message)}</p>
                <div class="alert-actions">
                    <button class="btn btn-primary" id="alert-ok">
                        ${options.buttonText || 'OK'}
                    </button>
                </div>
            </div>
            
            <style>
                .alert-modal-content {
                    text-align: center;
                    padding: var(--space-4);
                }
                
                .alert-message {
                    margin-bottom: var(--space-8);
                    font-size: var(--font-size-lg);
                    color: var(--text-secondary);
                    line-height: var(--line-height-relaxed);
                }
                
                .alert-actions {
                    display: flex;
                    justify-content: center;
                }
            </style>
        `;
        
        openModal(title, content, {
            className: 'alert-modal',
            onClose: () => resolve()
        });
        
        // Setup OK handler
        setTimeout(() => {
            const okBtn = document.getElementById('alert-ok');
            if (okBtn) {
                okBtn.addEventListener('click', () => {
                    closeModal();
                    resolve();
                });
                okBtn.focus();
            }
        }, 100);
    });
}

/**
 * Check if modal is currently open
 */
export function isModalOpenNow() {
    return isModalOpen;
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
    let liveRegion = document.getElementById('modal-live-region');
    
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'modal-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'visually-hidden';
        document.body.appendChild(liveRegion);
    }
    
    liveRegion.textContent = message;
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 1000);
}

/**
 * Track modal events for analytics
 */
function trackModalEvent(eventName, properties = {}) {
    console.log('Modal event:', eventName, properties);
    
    // Integration with analytics services would go here
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: 'modal_interaction',
            ...properties
        });
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (isModalOpen) {
        document.body.style.overflow = '';
    }
});
