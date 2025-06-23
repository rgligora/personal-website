/**
 * Projects module
 * Handles the curated projects section with modal details
 */

import { openModal } from './modal.js';

// Curated project data
const projects = [
    /*{
    id: 'project-1',
    title: 'Key-Distribution & Secure-Update Framework',
    description:
      'Lightweight framework that distributes cryptographic keys and ships OTA updates with provenance guarantees.',
    image: 'assets/hero-kdsuf.svg',          // add the svg/png to /assets
    tags: ['Python', 'Cryptography', 'PKI'],
    link: 'https://github.com/rgligora/key-distribution-secure-update-framework',
    featured: true,
    details: {
      overview:
        'Implements a simplified TUF-style update pipeline plus an AES-GCM key-distribution server. Written for embedded gateways where storage and compute budgets are tight.',
      features: [
        'Signed metadata & client-side verification',
        'Symmetric-key rollout over mutual-TLS',
        'Delta update builder (< 40 KB patches)',
        'Pluggable storage back-ends (S3, local FS)',
      ],
      technologies: ['Python', 'Flask', 'OpenSSL', 'SQLite', 'Docker'],
      challenges:
        'Balancing security with MCU-class resource limits; solved by off-loading heavy crypto to the gateway and keeping the client footprint minimal.',
      impact:
        'Secures firmware pipelines for two student-formula cars; reduced field-update failures from 12 % to 0 %.',
    },
  },*/

  {
    id: 'project-2',
    title: 'Anti-Theft IoT System',
    description:
      'ESP32‑based antitheft IoT system with motion alerts, a ThingsBoard IoT platform, digital twin, and a SwiftUI tracking app.',
    image: 'assets/hero-anti-theft.png',
    tags: ['ESP32', 'iOS', 'ThingsBoard'],
    link: 'https://github.com/rgligora/anti-theft-iot-system',
    featured: true,
    details: {
      overview:
        'An IoT project combining an ESP32‑C6 motion‑sensing node, an open‑source ThingsBoard instance, and a SwiftUI iOS client. It showcases how to build a low‑cost antitheft tracker with a live digital twin, real‑time alerts and remote arm/disarm control.',
      features: [
        'Custom ESP32-C6 firmware with motion detection',
        'iOS SwiftUI app with live updates and device notifications',
        'Interactive Web App',
        '3D printed ESP32-C6 enclosure',
      ],
      technologies: ['Micropython', 'ESP', 'Swift', 'Spring Boot', 'Thingsboard'],
      challenges:
        'Implmenting the motion sensing using the MPU6050 IMU sensor, which required fine-tuning the accelerometer and gyroscope thresholds to avoid false positives.',
      impact:
        'Maximum score on the final project, with 100 % positive feedback from the jury. Used as a template for other IoT projects in the course.',
    },
  },

  {
    id: 'project-3',
    title: 'Go-KMS',
    description:
      'Lightweight Key Management Service (KMS) written in Go',
    image: 'assets/hero-go-kms.png',
    tags: ['Go', 'Security', 'mTLS'],
    link: 'https://github.com/rgligora/go-kms',
    featured: true,
    details: {
      overview:
        'Drop-in alternative to cloud KMS APIs for on-prem environments. Supports AEAD primitives and hierarchical key rotation.',
      features: [
        'REST & RPC',
        'Envelope encryption',
        'Key versioning using key rings',
        'mTLS authentication',
      ],
      technologies: ['Go', 'SQLite', 'GoViper'],
      challenges:
        'Key management is complex; implemented a simple key ring model to avoid the pitfalls of traditional KMS systems.',
      impact:
        'Going to be used in KDSUF for key distribution and secure updates, replacing a complex PKI with a simpler model.',
    },
  }
];

/**
 * Initialize projects section
 */
export function initProjects() {
    renderProjects();
    setupProjectInteractions();
}

/**
 * Render projects in the grid
 */
function renderProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    
    if (!projectsGrid) {
        console.warn('Projects grid element not found');
        return;
    }
    
    // Clear existing projects
    projectsGrid.innerHTML = '';
    
    // Filter featured projects
    const featuredProjects = projects.filter(project => project.featured);
    
    featuredProjects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

/**
 * Create a project card element
 */
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-project-id', project.id);
    
    // Add click handler to open modal
    card.addEventListener('click', () => {
        openProjectModal(project);
    });
    
    // Keyboard support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProjectModal(project);
        }
    });
    
    card.innerHTML = `
        <img 
            src="${project.image}" 
            alt="${escapeHtml(project.title)} preview"
            class="project-image"
            loading="lazy"
        >
        <div class="project-content">
            <h3 class="project-title">${escapeHtml(project.title)}</h3>
            <p class="project-description">${escapeHtml(project.description)}</p>
            
            <div class="project-tags">
                ${project.tags.map(tag => 
                    `<span class="project-tag">${escapeHtml(tag)}</span>`
                ).join('')}
            </div>
            
            <div class="project-links">
                <button class="project-link" onclick="event.stopPropagation();" data-action="modal">
                    Learn more
                </button>
                <a href="${project.link}" class="project-link" onclick="event.stopPropagation();" target="_blank" rel="noopener noreferrer">
                    View code
                </a>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Setup project interactions
 */
function setupProjectInteractions() {
    // Handle "Learn more" buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-action="modal"]')) {
            e.preventDefault();
            e.stopPropagation();
            
            const projectCard = e.target.closest('[data-project-id]');
            if (projectCard) {
                const projectId = projectCard.getAttribute('data-project-id');
                const project = projects.find(p => p.id === projectId);
                if (project) {
                    openProjectModal(project);
                }
            }
        }
    });
}

/**
 * Open project details modal
 */
function openProjectModal(project) {
    const modalContent = createProjectModalContent(project);
    openModal(project.title, modalContent);
    
    // Track modal opening for analytics (if implemented)
    trackEvent('project_modal_opened', { project_id: project.id });
}

/**
 * Create modal content for project details
 */
function createProjectModalContent(project) {
    const details = project.details;
    
    return `
        <div class="project-modal-content">
            <div class="project-modal-header">
                <img 
                    src="${project.image}" 
                    alt="${escapeHtml(project.title)} preview"
                    class="project-modal-image"
                >
                <div class="project-modal-info">
                    <div class="project-tags">
                        ${project.tags.map(tag => 
                            `<span class="project-tag">${escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                    <p class="project-modal-description">${escapeHtml(project.description)}</p>
                </div>
            </div>
            
            <div class="project-modal-body">
                <section class="project-section">
                    <h4 class="project-section-title">Overview</h4>
                    <p class="project-section-content">${escapeHtml(details.overview)}</p>
                </section>
                
                <section class="project-section">
                    <h4 class="project-section-title">Key Features</h4>
                    <ul class="project-features-list">
                        ${details.features.map(feature => 
                            `<li>${escapeHtml(feature)}</li>`
                        ).join('')}
                    </ul>
                </section>
                
                <section class="project-section">
                    <h4 class="project-section-title">Technologies</h4>
                    <div class="project-tech-list">
                        ${details.technologies.map(tech => 
                            `<span class="project-tech">${escapeHtml(tech)}</span>`
                        ).join('')}
                    </div>
                </section>
                
                ${details.metrics ? `
                <section class="project-section">
                    <h4 class="project-section-title">Key Metrics</h4>
                    <div class="project-metrics">
                    ${Object.entries(details.metrics).map(([k,v]) => `
                        <div class="project-metric">
                            <span class="metric-label">${escapeHtml(k)}</span>
                            <span class="metric-value">${escapeHtml(v)}</span>
                        </div>`).join('')}
                    </div>
                </section>` : ''}
                
                <section class="project-section">
                    <h4 class="project-section-title">Challenges & Solutions</h4>
                    <p class="project-section-content">${escapeHtml(details.challenges)}</p>
                </section>
                
                <section class="project-section">
                    <h4 class="project-section-title">Impact</h4>
                    <p class="project-section-content">${escapeHtml(details.impact)}</p>
                </section>
                
                <div class="project-modal-actions">
                    <a href="${project.link}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        View Project
                    </a>
                </div>
            </div>
        </div>
        
        <style>
            .project-modal-content {
                max-width: 100%;
            }
            
            .project-modal-header {
                display: flex;
                gap: var(--space-6);
                margin-bottom: var(--space-8);
                align-items: flex-start;
            }
            
            .project-modal-image {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: var(--radius-lg);
                flex-shrink: 0;
            }
            
            .project-modal-info {
                flex: 1;
            }
            
            .project-modal-description {
                color: var(--text-secondary);
                margin-top: var(--space-3);
                font-size: var(--font-size-lg);
                line-height: var(--line-height-relaxed);
            }
            
            .project-section {
                margin-bottom: var(--space-8);
            }
            
            .project-section-title {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
                margin-bottom: var(--space-4);
                border-bottom: 2px solid var(--accent-primary);
                padding-bottom: var(--space-2);
            }
            
            .project-section-content {
                color: var(--text-secondary);
                line-height: var(--line-height-relaxed);
            }
            
            .project-features-list {
                list-style: none;
                padding: 0;
            }
            
            .project-features-list li {
                color: var(--text-secondary);
                padding: var(--space-2) 0;
                padding-left: var(--space-6);
                position: relative;
                line-height: var(--line-height-relaxed);
            }
            
            .project-features-list li:before {
                content: '✓';
                position: absolute;
                left: 0;
                color: var(--accent-primary);
                font-weight: var(--font-weight-bold);
            }
            
            .project-tech-list {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-2);
            }
            
            .project-tech {
                background-color: var(--bg-tertiary);
                color: var(--text-secondary);
                padding: var(--space-2) var(--space-3);
                border-radius: var(--radius-base);
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-medium);
                font-family: var(--font-family-mono);
            }
            
            .project-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-4);
            }
            
            .project-metric {
                background-color: var(--bg-secondary);
                padding: var(--space-4);
                border-radius: var(--radius-lg);
                border: 1px solid var(--border-light);
                text-align: center;
            }
            
            .metric-label {
                display: block;
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
                margin-bottom: var(--space-1);
            }
            
            .metric-value {
                display: block;
                font-size: var(--font-size-xl);
                font-weight: var(--font-weight-semibold);
                color: var(--accent-primary);
            }
            
            .project-modal-actions {
                margin-top: var(--space-8);
                text-align: center;
                padding-top: var(--space-6);
                border-top: 1px solid var(--border-light);
            }
            
            @media (max-width: 768px) {
                .project-modal-header {
                    flex-direction: column;
                    text-align: center;
                }
                
                .project-modal-image {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                }
                
                .project-metrics {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;
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
 * Track events for analytics (placeholder implementation)
 */
function trackEvent(eventName, properties = {}) {
    // This would integrate with your analytics service
    console.log('Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    // gtag('event', eventName, properties);
    
    // Example: Custom analytics
    // analytics.track(eventName, properties);
}

// Export for external use
export { projects, openProjectModal };
