/**
 * GitHub API integration module
 * Handles fetching and displaying GitHub repositories
 */

let repositories = [];
let filteredRepositories = [];
let currentFilter = "all";

/**
 * Initialize GitHub API functionality
 */
export async function initGitHubAPI() {
    try {
        await loadRepositories();
        initializeRepositoryFilters();
        setupRepositorySearch();
    } catch (error) {
        console.error("Failed to initialize GitHub API:", error);
        showRepositoryError("Failed to connect to GitHub API");
    }
}

/**
 * Load repositories from GitHub API
 */
async function loadRepositories() {
    const loadingElement = document.getElementById("repos-loading");
    const errorElement = document.getElementById("repos-error");
    const gridElement = document.getElementById("repositories-grid");

    try {
        // Show loading state
        loadingElement?.classList.remove("hidden");
        errorElement?.classList.add("hidden");

        // Get GitHub username from environment or use default
        const username = getGitHubUsername();

        // Fetch repositories from GitHub API
        const response = await fetch(
            `https://api.github.com/users/rgligora/repos`,
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    // Add token if available for higher rate limits
                    ...(getGitHubToken() && {
                        Authorization: `token ${getGitHubToken()}`,
                    }),
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `GitHub API Error: ${response.status} ${response.statusText}`,
            );
        }

        const data = await response.json();

        // Filter out forks unless they have significant activity, and limit to recent repos
        repositories = data
            .filter((repo) => !repo.fork || repo.stargazers_count > 5)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 12); // Limit to 12 most recent repositories

        filteredRepositories = [...repositories];

        // Hide loading and render repositories
        loadingElement?.classList.add("hidden");
        renderRepositories();
    } catch (error) {
        console.error("Error loading repositories:", error);
        loadingElement?.classList.add("hidden");
        showRepositoryError(error.message);
    }
}

/**
 * Get GitHub username from environment or prompt user
 */
function getGitHubUsername() {
    // Try to get from environment variable or use a default
    // In a real deployment, this would be configured properly
    return "microsoft"; // Microsoft has many public repositories for demonstration
}

/**
 * Get GitHub token from environment if available
 */
function getGitHubToken() {
    return null;
}

/**
 * Show repository loading error
 */
function showRepositoryError(message) {
    const errorElement = document.getElementById("repos-error");
    const messageElement = errorElement?.querySelector(".error-message");

    if (messageElement) {
        messageElement.textContent = message;
    }

    errorElement?.classList.remove("hidden");

    // Setup retry button
    const retryButton = document.getElementById("retry-repos");
    if (retryButton) {
        retryButton.onclick = () => {
            errorElement.classList.add("hidden");
            loadRepositories();
        };
    }
}

/**
 * Render repositories in the grid
 */
function renderRepositories() {
    const gridElement = document.getElementById("repositories-grid");
    const emptyElement = document.getElementById("repos-empty");

    if (!gridElement) return;

    // Clear existing repository cards (keep state elements)
    const existingCards = gridElement.querySelectorAll(".repo-card");
    existingCards.forEach((card) => card.remove());

    if (filteredRepositories.length === 0) {
        emptyElement?.classList.remove("hidden");
        return;
    }

    emptyElement?.classList.add("hidden");

    filteredRepositories.forEach((repo) => {
        const repoCard = createRepositoryCard(repo);
        gridElement.appendChild(repoCard);
    });
}

/**
 * Create a repository card element
 */
function createRepositoryCard(repo) {
    const card = document.createElement("div");
    card.className = "repo-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("data-repo-name", repo.name.toLowerCase());
    card.setAttribute(
        "data-repo-language",
        (repo.language || "").toLowerCase(),
    );

    // Make card clickable
    card.addEventListener("click", () => {
        window.open(repo.html_url, "_blank", "noopener,noreferrer");
    });

    // Keyboard support
    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            card.click();
        }
    });

    const hasStars = repo.stargazers_count > 50;

    card.innerHTML = `
        <div class="repo-header">
            <div>
                <h3 class="repo-title">${escapeHtml(repo.name)}</h3>
                ${
                    hasStars
                        ? `
                    <div class="repo-star-badge" title="${repo.stargazers_count} stars">
                        <span aria-hidden="true">⭐</span>
                        <span>${formatNumber(repo.stargazers_count)}</span>
                    </div>
                `
                        : ""
                }
            </div>
        </div>
        
        ${
            repo.description
                ? `
            <p class="repo-description">${escapeHtml(repo.description)}</p>
        `
                : ""
        }
        
        <div class="repo-meta">
            <div class="repo-language">
                ${
                    repo.language
                        ? `
                    <span class="language-dot" data-language="${repo.language.toLowerCase()}" aria-hidden="true"></span>
                    <span>${escapeHtml(repo.language)}</span>
                `
                        : ""
                }
            </div>
            <div class="repo-updated">
                Updated ${formatRelativeTime(repo.updated_at)}
            </div>
        </div>
    `;

    return card;
}

/**
 * Initialize repository filters
 */
function initializeRepositoryFilters() {
    const filterButtons = document.querySelectorAll(".filter-btn");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Update active button
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");

            // Apply filter
            currentFilter = button.dataset.filter;
            applyFilters();
        });
    });
}

/**
 * Setup repository search functionality
 */
function setupRepositorySearch() {
    const searchInput = document.getElementById("repo-search");

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            debounce((e) => {
                applyFilters(e.target.value);
            }, 300),
        );

        // Clear search on escape
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                searchInput.value = "";
                applyFilters();
                searchInput.blur();
            }
        });
    }
}

/**
 * Apply current filters to repositories
 */
function applyFilters(searchTerm = "") {
    const searchQuery =
        searchTerm || document.getElementById("repo-search")?.value || "";

    filteredRepositories = repositories.filter((repo) => {
        // Apply search filter
        const matchesSearch =
            !searchQuery ||
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (repo.description &&
                repo.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
            (repo.language &&
                repo.language
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));

        // Apply category filter
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "starred" && repo.stargazers_count > 50);

        return matchesSearch && matchesFilter;
    });

    renderRepositories();

    // Announce results to screen readers
    const resultCount = filteredRepositories.length;
    const announcement = `${resultCount} ${resultCount === 1 ? "repository" : "repositories"} found`;
    announceToScreenReader(announcement);
}

/**
 * Utility function to escape HTML
 */
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format numbers with appropriate suffixes (1k, 1.2k, etc.)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
}

/**
 * Format relative time (e.g., "2 days ago", "3 months ago")
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "today";
    } else if (diffDays === 1) {
        return "yesterday";
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} ${years === 1 ? "year" : "years"} ago`;
    }
}

/**
 * Debounce function to limit API calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Announce messages to screen readers
 * (This should ideally be imported from main.js, but included here for standalone functionality)
 */
function announceToScreenReader(message) {
    let liveRegion = document.getElementById("live-region");

    if (!liveRegion) {
        liveRegion = document.createElement("div");
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "true");
        liveRegion.className = "visually-hidden";
        liveRegion.id = "live-region";
        document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
    setTimeout(() => {
        liveRegion.textContent = "";
    }, 1000);
}

// Export functions for external use
export { loadRepositories, applyFilters };
