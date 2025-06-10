// app/pages/profile-selector/script.js

class ProfileSelector {
    constructor() {
        this.profiles = {};
        this.selectedProfile = null;

        this.loadProfiles();
        this.loadSavedSelection();
    }

    // Add this new method:
loadSavedSelection() {
    const savedProfile = localStorage.getItem('selectedProfile');

    if (savedProfile) {
        // Wait for profiles to load, then select the saved one
        setTimeout(() => {
            this.showProfileDetails(savedProfile);
        }, 100);
    }
    
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

    // Store BOTH the key and the full profile
    this.selectedProfile = {
        ...profile,
        key: profileKey  // Make sure we have the key!
    };
        
        // Update profile name
        document.getElementById('selected-profile-name').textContent = profile.name;
        
        // Show search strategies
        this.showSearchStrategies(profile);
        
        // Show prioritized publications
        this.showPublications(profile);
        
        // Show date ranges
        this.showDateRanges(profile);
        
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
    
    
    selectProfile() {
        if (!this.selectedProfile) return;
  
    // Store the KEY in localStorage, not the name
    localStorage.setItem('selectedProfile', this.selectedProfile.key);
    
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