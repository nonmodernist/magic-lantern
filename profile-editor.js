// profile-editor.js

class ProfileEditor {
  constructor() {
    this.currentProfile = null;
    this.isDirty = false;
    this.profiles = {};
    
    this.initializeEditor();
    this.loadProfiles();
    this.setupDragAndDrop();
  }
  
  async loadProfiles() {
    // Load existing profiles
    const profiles = await window.magicLantern.getProfiles();
    
    const listContainer = document.getElementById('profile-list');
    listContainer.innerHTML = '';
    
    profiles.forEach(profile => {
      const item = document.createElement('div');
      item.className = 'profile-item';
      item.innerHTML = `
        <div class="profile-name">${profile.name}</div>
        <div class="profile-desc" style="font-size: 12px; color: #666;">
          ${profile.description}
        </div>
      `;
      item.onclick = () => this.loadProfile(profile.key);
      listContainer.appendChild(item);
    });
  }
  
  async loadProfile(profileKey) {
    // Load full profile data
    this.currentProfile = await window.magicLantern.getProfile(profileKey);
    
    // Update UI
    document.getElementById('profile-name').value = this.currentProfile.name;
    document.getElementById('profile-description').value = this.currentProfile.description;
    
    this.renderPublicationWeights();
    this.renderSearchStrategies();
    this.renderDateRanges();
    
    // Mark active profile
    document.querySelectorAll('.profile-item').forEach(item => {
      item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
  }
  
  renderPublicationWeights() {
    const container = document.getElementById('publication-weights');
    container.innerHTML = '';
    
    const weights = this.currentProfile.publications.weights;
    
    // Group by weight for better visualization
    const grouped = {};
    Object.entries(weights).forEach(([pub, weight]) => {
      if (!grouped[weight]) grouped[weight] = [];
      grouped[weight].push(pub);
    });
    
    // Render each publication with slider
    Object.entries(weights).sort((a, b) => b[1] - a[1]).forEach(([pub, weight]) => {
      const control = document.createElement('div');
      control.className = 'weight-control';
      control.innerHTML = `
        <div class="weight-label">
          <span>${this.formatPublicationName(pub)}</span>
          <span class="weight-value">${weight.toFixed(1)}x</span>
        </div>
        <input type="range" class="weight-slider" 
               min="0" max="3" step="0.1" value="${weight}"
               data-publication="${pub}">
        <div class="weight-hint" style="font-size: 12px; color: #666; margin-top: 5px;">
          ${this.getWeightHint(weight)}
        </div>
      `;
      container.appendChild(control);
      
      // Add event listener
      const slider = control.querySelector('.weight-slider');
      const valueSpan = control.querySelector('.weight-value');
      
      slider.addEventListener('input', (e) => {
        const newWeight = parseFloat(e.target.value);
        valueSpan.textContent = newWeight.toFixed(1) + 'x';
        control.querySelector('.weight-hint').textContent = this.getWeightHint(newWeight);
        this.updateWeight('publications', pub, newWeight);
      });
    });
  }
  
  renderSearchStrategies() {
    const container = document.getElementById('strategy-list');
    container.innerHTML = '';
    
    const strategies = this.currentProfile.searchStrategies.weights;
    const enabled = this.currentProfile.searchStrategies.enabled;
    
    // Sort by weight
    const sortedStrategies = Object.entries(strategies)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0));
    
    sortedStrategies.forEach(([strategy, weight]) => {
      const item = document.createElement('div');
      item.className = 'strategy-item';
      item.draggable = true;
      item.dataset.strategy = strategy;
      
      const isEnabled = weight > 0;
      
      item.innerHTML = `
        <span class="strategy-handle">☰</span>
        <div class="strategy-toggle ${isEnabled ? 'active' : ''}" 
             data-strategy="${strategy}"></div>
        <div style="flex: 1;">
          <div class="strategy-name">${this.formatStrategyName(strategy)}</div>
          <div class="strategy-weight" style="font-size: 12px; color: #666;">
            Weight: ${weight || 0}
          </div>
        </div>
        <input type="number" class="strategy-weight-input" 
               value="${weight || 0}" min="0" max="5" step="0.1"
               style="width: 60px; padding: 4px;">
      `;
      
      container.appendChild(item);
      
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
        this.updateWeight('searchStrategies', strategy, parseFloat(e.target.value));
      });
    });
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
      const baseWeight = 3.0 - (index * 0.2); // Decrease by 0.2 for each position
      newOrder[strategy] = Math.max(0, baseWeight);
      
      // Update the displayed weight
      item.querySelector('.strategy-weight-input').value = newOrder[strategy].toFixed(1);
    });
    
    this.currentProfile.searchStrategies.weights = newOrder;
    this.isDirty = true;
  }
  
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
    const hasActivePublication = Object.values(this.currentProfile.publications.weights)
      .some(w => w > 0);
    
    if (!hasActivePublication) {
      this.showNotification('At least one publication must have a weight > 0', 'error');
      return false;
    }
    
    return true;
  }
  
  async testProfile() {
    if (!this.currentProfile) return;
    
    // Save temporarily and run a test search
    const testResult = await window.magicLantern.testProfile(this.currentProfile);
    
    // Show results in a modal
    this.showTestResults(testResult);
  }
  
  async exportProfile() {
    if (!this.currentProfile) return;
    
    const profileCode = this.generateProfileCode(this.currentProfile);
    
    // Save to file
    const result = await window.magicLantern.saveFile({
      content: profileCode,
      filters: [
        { name: 'JavaScript Files', extensions: ['js'] }
      ],
      defaultPath: `${this.currentProfile.name.toLowerCase().replace(/\s+/g, '-')}.profile.js`
    });
    
    if (result.success) {
      this.showNotification('Profile exported successfully!', 'success');
    }
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
    weights: ${JSON.stringify(profile.collections.weights, null, 6).replace(/"/g, "'")}
  },
  
  searchStrategies: {
    enabled: ${JSON.stringify(profile.searchStrategies.enabled, null, 6)},
    weights: ${JSON.stringify(profile.searchStrategies.weights, null, 6).replace(/"/g, "'")}
  },
  
  dateRanges: ${JSON.stringify(profile.dateRanges, null, 4)}
};`;
  }
  
  showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px 25px;
      background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
      color: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize editor when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.profileEditor = new ProfileEditor();
});