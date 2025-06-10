// app/pages/profile-selector/script.js

class ProfileSelector {
    constructor() {
        this.profiles = {};
        this.selectedProfile = null;
        this.currentOverrides = {
            dateRangeAdjustment: 'normal',
            skipStrategies: []
        };
        
        this.loadProfiles();
        this.setupEventListeners();
    }
    
    async loadProfiles() {
        // Profile data with icons and highlights
        const profileData = {
            'default': {
                icon: '📚',
                highlights: [
                    'Balanced search across all sources',
                    'Standard date ranges',
                    'All search strategies enabled'
                ]
            },
            'adaptation-studies': {
                icon: '📖',
                highlights: [
                    'Emphasizes author searches',
                    'Prioritizes literary magazines',
                    'Finds source material mentions'
                ]
            },
            'labor-history': {
                icon: '⚒️',
                highlights: [
                    'Strike and union coverage',
                    'Studio labor relations',
                    'Trade paper focus'
                ]
            },
            'early-cinema': {
                icon: '🎞️',
                highlights: [
                    'Early trade publications',
                    'Silent era terminology',
                    'Moving Picture World priority'
                ]
            },
            'regional-reception': {
                icon: '🌎',
                highlights: [
                    'Small-town exhibition',
                    'Regional publications',
                    'Box office patterns'
                ]
            }
        };
        
        // Get profiles from backend
        const profiles = await window.magicLantern.getProfiles();
        
        const container = document.querySelector('.profiles-grid');
        container.innerHTML = '';
        
        profiles.forEach(profile => {
            const data = profileData[profile.key] || { icon: '📁', highlights: [] };
            const card = this.createProfileCard(profile, data);
            container.appendChild(card);
            
            // Store profile data
            this.profiles[profile.key] = profile;
        });
    }
    
    createProfileCard(profile, data) {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.dataset.profileKey = profile.key;
        
        card.innerHTML = `
            <span class="profile-icon">${data.icon}</span>
            <h3 class="profile-name">${profile.name}</h3>
            <p class="profile-description">${profile.description}</p>
            <div class="profile-highlights">
                ${data.highlights.map(h => `
                    <div class="highlight-item">
                        <span class="highlight-icon">✓</span>
                        <span>${h}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        card.addEventListener('click', () => this.showProfileDetails(profile.key));
        
        return card;
    }
    
    async showProfileDetails(profileKey) {
        // Update selected state
        document.querySelectorAll('.profile-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.profileKey === profileKey);
        });
        
        // Load full profile data
        const profile = await window.magicLantern.getProfile(profileKey);
        this.selectedProfile = profile;
        
        // Update profile name
        document.getElementById('selected-profile-name').textContent = profile.name;
        
        // Show search strategies
        this.showSearchStrategies(profile);
        
        // Show prioritized publications
        this.showPublications(profile);
        
        // Show date ranges
        this.showDateRanges(profile);
        
        // Setup skip checkboxes
        this.setupSkipCheckboxes(profile);
        
        // Show details section
        document.getElementById('profile-details').style.display = 'block';
        
        // Scroll to details
        document.getElementById('profile-details').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    showSearchStrategies(profile) {
        const container = document.getElementById('search-preview-list');
        container.innerHTML = '';
        
        // Get search strategies from profile
        const strategies = profile.searchStrategies?.weights || {};
        const enabled = profile.searchStrategies?.enabled || {};
        
        // Define all possible strategies with examples
        const strategyExamples = {
            'exact_title': {
                name: 'Exact Title Match',
                example: '"The Wizard of Oz"'
            },
            'title_no_article': {
                name: 'Title without Articles',
                example: '"Wizard of Oz"'
            },
            'author_title': {
                name: 'Author + Title',
                example: '"L. Frank Baum" "The Wizard of Oz"'
            },
            'director_title': {
                name: 'Director + Title',
                example: '"Victor Fleming" "The Wizard of Oz"'
            },
            'studio_title': {
                name: 'Studio + Title',
                example: '"MGM" "The Wizard of Oz"'
            },
            'title_box_office': {
                name: 'Box Office Data',
                example: '"The Wizard of Oz" "box office"'
            },
            'title_production': {
                name: 'Production News',
                example: '"The Wizard of Oz" production filming'
            },
            'title_exhibitor': {
                name: 'Exhibitor Reports',
                example: '"The Wizard of Oz" exhibitor'
            },
            'title_strike': {
                name: 'Labor: Strikes',
                example: '"The Wizard of Oz" "picketed"'
            },
            'studio_labor': {
                name: 'Labor: Studio Relations',
                example: '"MGM" "labor dispute"'
            },
            'source_adaptation': {
                name: 'Source Material',
                example: '"The Wonderful Wizard of Oz" adaptation'
            }
        };
        
        // Sort strategies by weight
        const sortedStrategies = Object.entries(strategies)
            .sort((a, b) => (b[1] || 0) - (a[1] || 0));
        
        // Add default strategies if not in profile
        Object.keys(strategyExamples).forEach(key => {
            if (!strategies.hasOwnProperty(key)) {
                sortedStrategies.push([key, enabled[key] === false ? 0 : 1]);
            }
        });
        
        sortedStrategies.forEach(([strategyKey, weight]) => {
            const info = strategyExamples[strategyKey] || {
                name: strategyKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                example: strategyKey
            };
            
            const isDisabled = weight === 0;
            
            const item = document.createElement('div');
            item.className = `search-strategy-item ${isDisabled ? 'strategy-disabled' : ''}`;
            
            item.innerHTML = `
                <div class="strategy-info">
                    <div class="strategy-name">${info.name}</div>
                    <span class="strategy-example">${info.example}</span>
                </div>
                <span class="strategy-weight">${isDisabled ? 'SKIP' : weight.toFixed(1) + 'x'}</span>
            `;
            
            container.appendChild(item);
        });
    }
    
    showPublications(profile) {
        const container = document.getElementById('publication-list');
        container.innerHTML = '';
        
        const weights = profile.publications?.weights || {};
        
        // Sort by weight (highest first)
        Object.entries(weights)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12) // Show top 12
            .forEach(([pub, weight]) => {
                const item = document.createElement('div');
                item.className = 'publication-item';
                
                item.innerHTML = `
                    <span class="pub-name">${this.formatPublicationName(pub)}</span>
                    <span class="pub-weight">${weight.toFixed(1)}x</span>
                `;
                
                container.appendChild(item);
            });
    }
    
    showDateRanges(profile) {
        const container = document.getElementById('date-range-display');
        container.innerHTML = '';
        
        const ranges = profile.dateRanges || {
            high: { before: 1, after: 1 },
            medium: { before: 2, after: 2 },
            low: { before: 3, after: 3 }
        };
        
        ['high', 'medium', 'low'].forEach(confidence => {
            const range = ranges[confidence];
            const item = document.createElement('div');
            item.className = 'date-range-item';
            
            const totalYears = 10;
            const centerPercent = 50;
            const beforePercent = (range.before / totalYears) * 50;
            const afterPercent = (range.after / totalYears) * 50;
            
            item.innerHTML = `
                <span class="confidence-label">${confidence.charAt(0).toUpperCase() + confidence.slice(1)}:</span>
                <div class="range-visual">
                    <div class="range-bar" style="left: ${centerPercent - beforePercent}%; width: ${beforePercent + afterPercent}%;">
                        -${range.before}/+${range.after} years
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    setupSkipCheckboxes(profile) {
        const container = document.getElementById('skip-checkboxes');
        container.innerHTML = '';
        
        const mainCategories = [
            { key: 'titleVariations', label: 'Title Searches' },
            { key: 'creatorSearches', label: 'Author/Director' },
            { key: 'productionSearches', label: 'Production/Studio' },
            { key: 'starSearches', label: 'Star/Actor' },
            { key: 'contextualSearches', label: 'Contextual/Labor' }
        ];
        
        mainCategories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'skip-checkbox-item';
            
            const isEnabled = profile.searchStrategies?.enabled?.[category.key] !== false;
            
            item.innerHTML = `
                <input type="checkbox" id="skip-${category.key}" value="${category.key}" 
                       ${!isEnabled ? 'checked' : ''}>
                <label for="skip-${category.key}">${category.label}</label>
            `;
            
            container.appendChild(item);
        });
    }
    
    setupEventListeners() {
        // Date range buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentOverrides.dateRangeAdjustment = e.target.dataset.range;
            });
        });
    }
    
    async previewSearches() {
        if (!this.selectedProfile || !window.selectedFilePath) {
            alert('Please select a CSV file first (from the main search page)');
            return;
        }
        
        // Get the films
        const fileData = await window.magicLantern.selectFile();
        if (!fileData) return;
        
        // Parse CSV to get first few films
        const lines = fileData.preview;
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const films = lines.slice(1, 4).map(line => { // First 3 films
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const film = {};
            headers.forEach((header, i) => {
                film[header] = values[i];
            });
            return film;
        });
        
        // Generate previews
        const modal = document.getElementById('search-preview-modal');
        const container = document.getElementById('film-search-previews');
        container.innerHTML = '';
        
        films.forEach(film => {
            const preview = this.generateFilmPreview(film);
            container.appendChild(preview);
        });
        
        modal.style.display = 'flex';
    }
    
    generateFilmPreview(film) {
        const div = document.createElement('div');
        div.className = 'film-preview';
        
        const strategies = this.getActiveStrategies(film);
        
        div.innerHTML = `
            <div class="film-preview-title">
                ${film.title} (${film.year})
            </div>
            <div class="search-query-list">
                ${strategies.slice(0, 10).map((s, i) => `
                    <div class="search-query">
                        <strong>${i + 1}.</strong> ${s.query}
                    </div>
                `).join('')}
                ${strategies.length > 10 ? `<div class="search-query">... and ${strategies.length - 10} more searches</div>` : ''}
            </div>
        `;
        
        return div;
    }
    
    getActiveStrategies(film) {
        // Simulate strategy generation based on profile
        const strategies = [];
        const weights = this.selectedProfile.searchStrategies?.weights || {};
        
        // Get skip settings
        const skipCategories = Array.from(document.querySelectorAll('#skip-checkboxes input:checked'))
            .map(cb => cb.value);
        
        // Add strategies based on weights
        if (weights.exact_title > 0 && !skipCategories.includes('titleVariations')) {
            strategies.push({ query: `"${film.title}"`, weight: weights.exact_title });
        }
        
        if (weights.author_title > 0 && film.author && !skipCategories.includes('creatorSearches')) {
            strategies.push({ query: `"${film.author}" "${film.title}"`, weight: weights.author_title });
        }
        
        if (weights.director_title > 0 && film.director && !skipCategories.includes('creatorSearches')) {
            strategies.push({ query: `"${film.director}" "${film.title}"`, weight: weights.director_title });
        }
        
        if (weights.studio_title > 0 && film.studio && !skipCategories.includes('productionSearches')) {
            strategies.push({ query: `"${film.studio}" "${film.title}"`, weight: weights.studio_title });
        }
        
        // Sort by weight
        strategies.sort((a, b) => b.weight - a.weight);
        
        return strategies;
    }
    
    closeModal() {
        document.getElementById('search-preview-modal').style.display = 'none';
    }
    
    selectProfile() {
        if (!this.selectedProfile) return;
        
        // Get overrides
        const overrides = {
            dateRangeAdjustment: this.currentOverrides.dateRangeAdjustment,
            skipCategories: Array.from(document.querySelectorAll('#skip-checkboxes input:checked'))
                .map(cb => cb.value)
        };
        
        // Store in localStorage
        localStorage.setItem('selectedProfile', this.selectedProfile.key || this.selectedProfile.name);
        localStorage.setItem('profileOverrides', JSON.stringify(overrides));
        
        // Navigate back to search page
        window.location.href = '../home/index.html';
    }
    
    async importProfile() {
        // Show file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.profile.js';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await file.text();
                
                // Basic validation
                if (!content.includes('module.exports')) {
                    alert('Invalid profile file format');
                    return;
                }
                
                // Save the profile
                const filename = file.name.replace(/\.js$/, '');
                
                alert(`Profile import feature coming soon!\nFor now, manually copy ${file.name} to:\ncore/config/profiles/`);
                
                // Future: Actually save the profile via IPC
                // const result = await window.magicLantern.importProfile(content, filename);
                
            } catch (error) {
                alert('Error importing profile: ' + error.message);
            }
        };
        
        input.click();
    }
    
    editProfile() {
        if (!this.selectedProfile) {
            alert('Please select a profile first');
            return;
        }
        
        alert(`To edit this profile, open:\ncore/config/profiles/${this.selectedProfile.name.toLowerCase().replace(/\s+/g, '-')}.profile.js\n\nEdit with your favorite text editor!`);
    }
    
    formatPublicationName(pub) {
        return pub.split(/[\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.profileSelector = new ProfileSelector();
});