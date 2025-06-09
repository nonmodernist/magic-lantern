// app/pages/profile-editor/script.js

class ProfileEditor {
    constructor() {
        this.currentProfile = null;
        this.isDirty = false;
        this.profiles = {};
        
        this.initializeEditor();
        this.loadProfiles();
        this.setupDragAndDrop();
        this.setupDateRangeControls();
    }
    
    initializeEditor() {
        // Set up event listeners for profile changes
        document.getElementById('profile-name').addEventListener('input', () => this.markDirty());
        document.getElementById('profile-description').addEventListener('input', () => this.markDirty());
        
        // Prevent accidental navigation if there are unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    async loadProfiles() {
        // Load existing profiles
        const profiles = await window.magicLantern.getProfiles();
        
        const listContainer = document.getElementById('profile-list');
        listContainer.innerHTML = '';
        
        profiles.forEach(profile => {
            const item = document.createElement('div');
            item.className = 'profile-item';
            item.dataset.profileKey = profile.key;
            item.innerHTML = `
                <div class="profile-name">${profile.name}</div>
                <div class="profile-desc">${profile.description}</div>
            `;
            item.onclick = () => this.loadProfile(profile.key);
            listContainer.appendChild(item);
        });
        
        // Load the first profile by default
        if (profiles.length > 0) {
            this.loadProfile(profiles[0].key);
        }
    }
    
    async loadProfile(profileKey) {
        // Check for unsaved changes
        if (this.isDirty && !confirm('You have unsaved changes. Continue without saving?')) {
            return;
        }
        
    // Load full profile data
    console.log('Loading profile:', profileKey);
    this.currentProfile = await window.magicLantern.getProfile(profileKey);
    console.log('Loaded profile data:', this.currentProfile);
        
        // Update UI
        document.getElementById('profile-name').value = this.currentProfile.name;
        document.getElementById('profile-description').value = this.currentProfile.description;
        
        this.renderPublicationWeights();
        this.renderSearchStrategies();
        this.renderDateRanges();
        
        // Mark active profile
        document.querySelectorAll('.profile-item').forEach(item => {
            item.classList.toggle('active', item.dataset.profileKey === profileKey);
        });
        
        this.isDirty = false;
    }
    
    renderPublicationWeights() {
        const container = document.getElementById('publication-weights');
        container.innerHTML = '';
        
        const weights = this.currentProfile.publications?.weights || {};
        
        // Sort by weight (highest first)
        Object.entries(weights)
            .sort((a, b) => b[1] - a[1])
            .forEach(([pub, weight]) => {
                const control = this.createWeightControl(pub, weight);
                container.appendChild(control);
            });
    }
    
    createWeightControl(publication, weight) {
        const control = document.createElement('div');
        control.className = 'weight-control';
        control.dataset.publication = publication;
        
        control.innerHTML = `
            <div class="weight-label">
                <span class="publication-name">${this.formatPublicationName(publication)}</span>
                <span class="weight-value">${weight.toFixed(1)}x</span>
            </div>
            <input type="range" class="weight-slider" 
                   min="0" max="3" step="0.1" value="${weight}">
            <div class="weight-hint">${this.getWeightHint(weight)}</div>
        `;
        
        // Add event listener
        const slider = control.querySelector('.weight-slider');
        const valueSpan = control.querySelector('.weight-value');
        const hintDiv = control.querySelector('.weight-hint');
        
        slider.addEventListener('input', (e) => {
            const newWeight = parseFloat(e.target.value);
            valueSpan.textContent = newWeight.toFixed(1) + 'x';
            hintDiv.textContent = this.getWeightHint(newWeight);
            this.updateWeight('publications', publication, newWeight);
        });
        
        return control;
    }
    
    renderSearchStrategies() {
        const container = document.getElementById('strategy-list');
        container.innerHTML = '';
        
        const strategies = this.currentProfile.searchStrategies?.weights || {};
        const enabled = this.currentProfile.searchStrategies?.enabled || {};
        
        // Default strategies if none exist
        const allStrategies = {
            'exact_title': 'Exact Title Match',
            'title_no_article': 'Title without Articles',
            'author_title': 'Author + Title',
            'director_title': 'Director + Title',
            'studio_title': 'Studio + Title',
            'title_box_office': 'Box Office Data',
            'title_production': 'Production News',
            'title_strike': 'Labor: Strike Coverage',
            'title_work_stoppage': 'Labor: Work Stoppages',
            ...strategies
        };
        
        // Sort by weight
        Object.entries(allStrategies)
            .sort((a, b) => (strategies[b[0]] || 0) - (strategies[a[0]] || 0))
            .forEach(([strategy, _]) => {
                const weight = strategies[strategy] || 0;
                const isEnabled = weight > 0;
                const item = this.createStrategyItem(strategy, weight, isEnabled);
                container.appendChild(item);
            });
    }
    
    createStrategyItem(strategy, weight, isEnabled) {
        const item = document.createElement('div');
        item.className = 'strategy-item';
        item.draggable = true;
        item.dataset.strategy = strategy;
        
        item.innerHTML = `
            <span class="strategy-handle">☰</span>
            <div class="strategy-toggle ${isEnabled ? 'active' : ''}" 
                 data-strategy="${strategy}"></div>
            <div class="strategy-info">
                <div class="strategy-name">${this.formatStrategyName(strategy)}</div>
                <div class="strategy-weight">Weight: ${weight.toFixed(1)}</div>
            </div>
            <input type="number" class="strategy-weight-input" 
                   value="${weight}" min="0" max="5" step="0.1">
        `;
        
        // Toggle handler
        const toggle = item.querySelector('.strategy-toggle');
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const isNowEnabled = toggle.classList.contains('active');
            this.updateStrategyEnabled(strategy, isNowEnabled);
        });
        
        // Weight input handler
        const weightInput = item.querySelector('.strategy-weight-input');
        weightInput.addEventListener('change', (e) => {
            const newWeight = parseFloat(e.target.value) || 0;
            item.querySelector('.strategy-weight').textContent = `Weight: ${newWeight.toFixed(1)}`;
            this.updateWeight('searchStrategies', strategy, newWeight);
            
            // Update toggle state
            toggle.classList.toggle('active', newWeight > 0);
        });
        
        return item;
    }
    
    renderDateRanges() {

            console.log('renderDateRanges called');
    console.log('currentProfile:', this.currentProfile);
    console.log('dateRanges:', this.currentProfile.dateRanges);

        const ranges = this.currentProfile.dateRanges || {
            high: { before: 1, after: 1 },
            medium: { before: 2, after: 2 },
            low: { before: 3, after: 3 }
        };

            console.log('ranges after fallback:', ranges);
        
      ['high', 'medium', 'low'].forEach(confidence => {
        console.log(`Processing ${confidence}:`, ranges[confidence]);
        const range = ranges[confidence];
        if (!range) {
            console.error(`No range for ${confidence}!`);
            return;
        }
        document.getElementById(`${confidence}-before`).value = range.before;
        document.getElementById(`${confidence}-after`).value = range.after;
        this.updateRangeVisual(confidence);
    });

        

    }
    
    
    setupDateRangeControls() {
        ['high', 'medium', 'low'].forEach(confidence => {
            const beforeInput = document.getElementById(`${confidence}-before`);
            const afterInput = document.getElementById(`${confidence}-after`);
            
            beforeInput.addEventListener('input', () => {
                this.updateDateRange(confidence);
                this.updateRangeVisual(confidence);
            });
            
            afterInput.addEventListener('input', () => {
                this.updateDateRange(confidence);
                this.updateRangeVisual(confidence);
            });
        });
    }
    
    updateRangeVisual(confidence) {
        const before = parseInt(document.getElementById(`${confidence}-before`).value) || 0;
        const after = parseInt(document.getElementById(`${confidence}-after`).value) || 0;
        const rangeBar = document.getElementById(`${confidence}-range`);
        
        const totalYears = 10; // Max years shown
        const centerPercent = 50;
        const beforePercent = (before / totalYears) * 50;
        const afterPercent = (after / totalYears) * 50;
        
        rangeBar.style.left = `${centerPercent - beforePercent}%`;
        rangeBar.style.width = `${beforePercent + afterPercent}%`;
    }
    
    updateDateRange(confidence) {
        if (!this.currentProfile.dateRanges) {
            this.currentProfile.dateRanges = {};
        }
        
        this.currentProfile.dateRanges[confidence] = {
            before: parseInt(document.getElementById(`${confidence}-before`).value) || 0,
            after: parseInt(document.getElementById(`${confidence}-after`).value) || 0
        };
        
        this.markDirty();
    }
    
    setupDragAndDrop() {
        const container = document.getElementById('strategy-list');
        let draggedElement = null;
        
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('strategy-item')) {
                draggedElement = e.target;
                e.target.classList.add('dragging');
            }
        });
        
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('strategy-item')) {
                e.target.classList.remove('dragging');
            }
        });
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(container, e.clientY);
            
            if (afterElement == null) {
                container.appendChild(draggedElement);
            } else {
                container.insertBefore(draggedElement, afterElement);
            }
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            this.updateStrategyOrder();
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.strategy-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    updateStrategyOrder() {
        const items = document.querySelectorAll('.strategy-item');
        const newOrder = {};
        
        // Assign weights based on position (highest first)
        items.forEach((item, index) => {
            const strategy = item.dataset.strategy;
            const currentWeight = parseFloat(item.querySelector('.strategy-weight-input').value) || 0;
            
            // Only update if enabled
            if (currentWeight > 0) {
                const baseWeight = 3.0 - (index * 0.2);
                newOrder[strategy] = Math.max(0, Math.min(currentWeight, baseWeight));
                
                // Update the displayed weight
                item.querySelector('.strategy-weight-input').value = newOrder[strategy].toFixed(1);
                item.querySelector('.strategy-weight').textContent = `Weight: ${newOrder[strategy].toFixed(1)}`;
            }
        });
        
        if (!this.currentProfile.searchStrategies) {
            this.currentProfile.searchStrategies = {};
        }
        this.currentProfile.searchStrategies.weights = newOrder;
        this.markDirty();
    }
    
    updateWeight(section, key, value) {
        if (!this.currentProfile[section]) {
            this.currentProfile[section] = { weights: {} };
        }
        if (!this.currentProfile[section].weights) {
            this.currentProfile[section].weights = {};
        }
        
        this.currentProfile[section].weights[key] = value;
        this.markDirty();
    }
    
    updateStrategyEnabled(strategy, enabled) {
        if (!this.currentProfile.searchStrategies) {
            this.currentProfile.searchStrategies = { enabled: {} };
        }
        if (!this.currentProfile.searchStrategies.enabled) {
            this.currentProfile.searchStrategies.enabled = {};
        }
        
        // When enabling/disabling, also update the weight
        const item = document.querySelector(`[data-strategy="${strategy}"]`);
        const weightInput = item.querySelector('.strategy-weight-input');
        
        if (enabled && parseFloat(weightInput.value) === 0) {
            weightInput.value = '1.0';
            this.updateWeight('searchStrategies', strategy, 1.0);
        } else if (!enabled) {
            weightInput.value = '0';
            this.updateWeight('searchStrategies', strategy, 0);
        }
        
        this.markDirty();
    }
    
    markDirty() {
        this.isDirty = true;
    }
    
    // Action methods
    async saveProfile() {
        if (!this.currentProfile) return;
        
        // Update name and description
        this.currentProfile.name = document.getElementById('profile-name').value;
        this.currentProfile.description = document.getElementById('profile-description').value;
        
        // Validate
        if (!this.validateProfile()) return;
        
        // Save via IPC
        const result = await window.magicLantern.saveProfile(this.currentProfile);
        
        if (result.success) {
            this.showNotification('Profile saved successfully!', 'success');
            this.isDirty = false;
            this.loadProfiles(); // Refresh list
        } else {
            this.showNotification('Failed to save profile: ' + result.error, 'error');
        }
    }
    
    validateProfile() {
        // Check for required fields
        if (!this.currentProfile.name) {
            this.showNotification('Profile name is required', 'error');
            return false;
        }
        
        // Ensure at least one publication has weight > 0
        const hasActivePublication = Object.values(this.currentProfile.publications?.weights || {})
            .some(w => w > 0);
        
        if (!hasActivePublication) {
            this.showNotification('At least one publication must have a weight > 0', 'error');
            return false;
        }
        
        return true;
    }
    
    async testProfile() {
        if (!this.currentProfile) return;
        
        this.showNotification('Testing profile...', 'info');
        
        // Save temporarily and run a test search
        const testResult = await window.magicLantern.testProfile(this.currentProfile);
        
        if (testResult.success) {
            let message = `Test successful! Generated ${testResult.strategiesGenerated} strategies.\n\nTop strategies:\n`;
            testResult.topStrategies.forEach((s, i) => {
                message += `${i + 1}. ${s.type} (weight: ${s.weight})\n`;
            });
            
            this.showNotification(message, 'success', 5000);
        } else {
            this.showNotification('Test failed: ' + testResult.error, 'error');
        }
    }
    
    async exportProfile() {
        if (!this.currentProfile) return;
        
        const profileCode = this.generateProfileCode(this.currentProfile);
        
        // Create a download link
        const blob = new Blob([profileCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProfile.name.toLowerCase().replace(/\s+/g, '-')}.profile.js`;
        a.click();
        
        this.showNotification('Profile exported successfully!', 'success');
    }
    
    async createNewProfile() {
        if (this.isDirty && !confirm('You have unsaved changes. Continue without saving?')) {
            return;
        }
        
        // Create a new profile based on default
        this.currentProfile = {
            name: 'New Profile',
            description: 'Custom research profile',
            publications: {
                weights: {
                    'variety': 1.0,
                    'motion picture herald': 1.0,
                    'the film daily': 1.0
                }
            },
            searchStrategies: {
                weights: {
                    'exact_title': 1.0,
                    'title_no_article': 0.8,
                    'author_title': 0.5
                }
            },
            dateRanges: {
                high: { before: 1, after: 1 },
                medium: { before: 2, after: 2 },
                low: { before: 3, after: 3 }
            }
        };
        
        // Update UI
        document.getElementById('profile-name').value = this.currentProfile.name;
        document.getElementById('profile-description').value = this.currentProfile.description;
        
        this.renderPublicationWeights();
        this.renderSearchStrategies();
        this.renderDateRanges();
        
        // Clear active state
        document.querySelectorAll('.profile-item').forEach(item => {
            item.classList.remove('active');
        });
        
        this.isDirty = true;
        
        this.showNotification('New profile created. Remember to save!', 'info');
    }
    
    addPublication() {
        const pubName = prompt('Enter publication name:');
        if (!pubName) return;
        
        const formattedName = pubName.toLowerCase().trim();
        
        if (!this.currentProfile.publications) {
            this.currentProfile.publications = { weights: {} };
        }
        
        this.currentProfile.publications.weights[formattedName] = 1.0;
        
        // Re-render
        this.renderPublicationWeights();
        this.markDirty();
        
        // Scroll to the new control
        const newControl = document.querySelector(`[data-publication="${formattedName}"]`);
        if (newControl) {
            newControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newControl.style.animation = 'fadeIn 0.5s';
        }
    }
    
    // Helper methods
    formatPublicationName(pub) {
        return pub.split(/[\s-]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    formatStrategyName(strategy) {
        const names = {
            'exact_title': 'Exact Title Match',
            'author_title': 'Author + Title',
            'title_box_office': 'Box Office Data',
            'title_production': 'Production News',
            'director_title': 'Director + Title',
            'studio_title': 'Studio + Title',
            'title_strike': 'Labor: Strike Coverage',
            'title_work_stoppage': 'Labor: Work Stoppages'
        };
        
        return names[strategy] || strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    getWeightHint(weight) {
        if (weight === 0) return "Will not be searched";
        if (weight < 0.5) return "Very low priority - rarely useful";
        if (weight < 0.8) return "Low priority - sometimes useful";
        if (weight < 1.2) return "Standard priority";
        if (weight < 1.5) return "High priority - valuable source";
        if (weight < 2.0) return "Very high priority - key source";
        return "Maximum priority - essential source";
    }
    
    generateProfileCode(profile) {
        return `// ${profile.name}
// ${profile.description}
// Generated by Magic Lantern Profile Editor

const basePatterns = require('./base-patterns');

module.exports = {
  name: "${profile.name}",
  description: "${profile.description}",
  
  publications: {
    weights: ${JSON.stringify(profile.publications.weights, null, 6).replace(/"/g, "'")},
    patterns: basePatterns
  },
  
  collections: {
    weights: ${JSON.stringify(profile.collections?.weights || {}, null, 6).replace(/"/g, "'")}
  },
  
  searchStrategies: {
    enabled: ${JSON.stringify(profile.searchStrategies?.enabled || {}, null, 6)},
    weights: ${JSON.stringify(profile.searchStrategies.weights, null, 6).replace(/"/g, "'")}
  },
  
  dateRanges: ${JSON.stringify(profile.dateRanges, null, 4)}
};`;
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Initialize editor when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.profileEditor = new ProfileEditor();
});