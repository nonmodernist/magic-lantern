// app/pages/profile-selector/script.js - Refactored for classless HTML

class ProfileSelector {
    constructor() {
        this.profiles = {};
        this.selectedProfile = null;
        this.loadProfiles();
        this.loadSavedSelection();
    }

    loadSavedSelection() {
        const savedProfile = localStorage.getItem('selectedProfile');
        if (savedProfile) {
            setTimeout(() => {
                this.showProfileDetails(savedProfile);
            }, 100);
        }
    }
    
    async loadProfiles() {
        // Profile data remains the same
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
        
        const profiles = await window.magicLantern.getProfiles();
        
        // Now using data attribute selector
        const container = document.querySelector('[data-grid="cards"]');
        container.innerHTML = '';
        
        profiles.forEach(profile => {
            const data = profileData[profile.key] || { icon: '📁', highlights: [] };
            const card = this.createProfileCard(profile, data);
            container.appendChild(card);
            this.profiles[profile.key] = profile;
        });
    }
    
    createProfileCard(profile, data) {
        const card = document.createElement('div');
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('data-profile-key', profile.key);
        
        // Create structure without classes
        card.innerHTML = `
            <figure>${data.icon}</figure>
            <h3>${profile.name}</h3>
            <p>${profile.description}</p>
            <ul>
                ${data.highlights.map(h => `
                    <li>${h}</li>
                `).join('')}
            </ul>
        `;
        
        // Add both click and keyboard support
        card.addEventListener('click', () => this.showProfileDetails(profile.key));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showProfileDetails(profile.key);
            }
        });
        
        return card;
    }
    
    async showProfileDetails(profileKey) {
        // Update selected state using aria-selected
        document.querySelectorAll('[data-grid="cards"] > div').forEach(card => {
            const isSelected = card.getAttribute('data-profile-key') === profileKey;
            card.setAttribute('aria-selected', isSelected);
        });
        
        const profile = await window.magicLantern.getProfile(profileKey);
        this.selectedProfile = {
            ...profile,
            key: profileKey
        };
        
        // Update profile name
        document.getElementById('selected-profile-name').textContent = profile.name;
        
        // Show sections
        this.showSearchStrategies(profile);
        this.showPublications(profile);
        this.showDateRanges(profile);
        
        // Show details using hidden attribute
        document.getElementById('profile-details').hidden = false;
        
        // Scroll to details
        document.getElementById('profile-details').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    showSearchStrategies(profile) {
        const container = document.getElementById('search-preview-list');
        container.innerHTML = '';
        
        const strategies = profile.searchStrategies?.weights || {};
        const enabled = profile.searchStrategies?.enabled || {};
        
        // Strategy examples remain the same
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
        
        const sortedStrategies = Object.entries(strategies)
            .sort((a, b) => (b[1] || 0) - (a[1] || 0));
        
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
            
            // Create structured item without classes
            const item = document.createElement('div');
            item.setAttribute('data-disabled', isDisabled);
            
            item.innerHTML = `
                <div>
                    <strong>${info.name}</strong>
                    <code>${info.example}</code>
                </div>
                <data value="${weight}">${isDisabled ? 'SKIP' : weight.toFixed(1) + 'x'}</data>
            `;
            
            container.appendChild(item);
        });
    }
    
    showPublications(profile) {
        const container = document.getElementById('publication-list');
        container.innerHTML = '';
        
        const weights = profile.publications?.weights || {};
        
        Object.entries(weights)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12)
            .forEach(([pub, weight]) => {
                const item = document.createElement('div');
                
                item.innerHTML = `
                    <span>${this.formatPublicationName(pub)}</span>
                    <data value="${weight}">${weight.toFixed(1)}x</data>
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
            item.setAttribute('data-confidence', confidence);
            
            const totalYears = 10;
            const centerPercent = 50;
            const beforePercent = (range.before / totalYears) * 50;
            const afterPercent = (range.after / totalYears) * 50;
            
            item.innerHTML = `
                <strong>${confidence.charAt(0).toUpperCase() + confidence.slice(1)}:</strong>
                <meter 
                    min="0" 
                    max="100" 
                    value="${beforePercent + afterPercent}"
                    data-before="${range.before}"
                    data-after="${range.after}"
                >
                    -${range.before}/+${range.after} years
                </meter>
                <span>-${range.before}/+${range.after} years</span>
            `;
            
            container.appendChild(item);
        });
    }
    
    selectProfile() {
        if (!this.selectedProfile) return;
        
        localStorage.setItem('selectedProfile', this.selectedProfile.key);
        window.location.href = '../home/index.html';
    }
    
    async importProfile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.profile.js';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await file.text();
                
                if (!content.includes('module.exports')) {
                    alert('Invalid profile file format');
                    return;
                }
                
                const filename = file.name.replace(/\.js$/, '');
                alert(`Profile import feature coming soon!\nFor now, manually copy ${file.name} to:\ncore/config/profiles/`);
                
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