// config/profiles/index.js
const fs = require('fs');
const path = require('path');

class ProfileLoader {
  constructor() {
    this.profiles = {};
    this.loadAllProfiles();
  }
  
  loadAllProfiles() {
    const profileDir = __dirname;
    const files = fs.readdirSync(profileDir)
      .filter(f => f.endsWith('.profile.js') && f !== 'index.js');
    
    files.forEach(file => {
      const profileName = file.replace('.profile.js', '');
      try {
        this.profiles[profileName] = require(path.join(profileDir, file));
        console.log(`✅ Loaded profile: ${profileName}`);
      } catch (error) {
        console.error(`❌ Failed to load profile ${file}:`, error.message);
      }
    });
  }
  
  load(profileName = 'default') {
    const profile = this.profiles[profileName];
    if (!profile) {
      console.warn(`⚠️  Profile "${profileName}" not found, using default`);
      return this.profiles['default'];
    }
    return profile;
  }
  
  list() {
    return Object.entries(this.profiles).map(([key, profile]) => ({
      key,
      name: profile.name,
      description: profile.description
    }));
  }
  
  // Merge a research profile with base config
  mergeWithConfig(baseConfig, profile) {
    return {
      ...baseConfig,
      scoring: {
        ...baseConfig.scoring,
        publications: {
          ...(baseConfig.scoring.publications ?? {}),
          weights: {
            ...(baseConfig.scoring.publications?.weights ?? {}),
            ...(profile.publications?.weights ?? {})
          },
          patterns: {
            ...(baseConfig.scoring.publications?.patterns ?? {}),
            ...(profile.publications?.patterns ?? {})
          }
        },
        collections: {
          ...(baseConfig.scoring.collections ?? {}),
          weights: {
            ...(baseConfig.scoring.collections?.weights ?? {}),
            ...(profile.collections?.weights ?? {})
          }
        }
      },
      search: {
        ...baseConfig.search,
        strategies: {
          ...baseConfig.search.strategies,
          enabled: {
            ...(baseConfig.search.strategies?.enabled ?? {}),
            ...(profile.searchStrategies?.enabled ?? {})
          },
          weights: profile.searchStrategies?.weights || {},
          dateRanges: profile.dateRanges || 
                   (profile.dateRange ? {
                     high: profile.dateRange,
                     medium: profile.dateRange,
                     low: { 
                       before: (profile.dateRange.before || 2) + 1, 
                       after: (profile.dateRange.after || 2) + 1 
                     }
                   } : baseConfig.search.strategies?.dateRanges || {})
        }
      }
    };
  }
}

module.exports = new ProfileLoader();