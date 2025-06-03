// validate-profiles-simple.js
const config = require('./config');

function validateProfiles() {
    console.log('🔍 Validating All Profiles\n');
    
    const profiles = config.profiles.list();
    
    profiles.forEach(({ key, name, description }) => {
        console.log(`\n${key} - ${name}:`);
        console.log(`Description: ${description}`);
        
        try {
            const profile = config.profiles.load(key);
            const issues = [];
            
            // Check for weights without patterns
            if (profile.publications?.weights) {
                const weights = Object.keys(profile.publications.weights);
                const patterns = Object.keys(profile.publications?.patterns || {});
                
                const missingPatterns = weights.filter(w => !patterns.includes(w));
                if (missingPatterns.length > 0) {
                    issues.push(`⚠️  Weights without patterns: ${missingPatterns.join(', ')}`);
                }
            }
            
            // Check for missing patterns entirely
            if (!profile.publications?.patterns) {
                issues.push('❌ No publication patterns defined!');
            }
            
            // Report
            if (issues.length === 0) {
                console.log('✅ Valid');
            } else {
                issues.forEach(i => console.log(i));
            }
            
            // Stats
            console.log(`📊 Stats:`);
            console.log(`   - Publication weights: ${Object.keys(profile.publications?.weights || {}).length}`);
            console.log(`   - Publication patterns: ${Object.keys(profile.publications?.patterns || {}).length}`);
            console.log(`   - Search strategy weights: ${Object.keys(profile.searchStrategies?.weights || {}).length}`);
            
        } catch (error) {
            console.log(`❌ Error loading profile: ${error.message}`);
        }
    });
}

validateProfiles();