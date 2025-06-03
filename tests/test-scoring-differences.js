// test-scoring-differences.js
const config = require('../config');

function testScoringDifferences() {
    console.log('📊 Testing Scoring Weight Differences\n');
    
    // Mock results from different publications
    const testResults = [
        { id: 'variety_12345', desc: 'Major trade paper' },
        { id: 'motionpicturewor_6789', desc: 'Early trade paper' },
        { id: 'photoplay_111', desc: 'Fan magazine' },
        { id: 'boxoffice_222', desc: 'Regional trade' },
        { id: 'modernscreen_333', desc: 'Fan magazine' },
        { id: 'motography_444', desc: 'Early technical' },
        { id: 'exhibher_555', desc: 'Chicago trade' }
    ];
    
    const profiles = ['default', 'adaptation-studies', 'early-adaptations', 'regional-reception'];
    
    // Create header
    console.log('Publication'.padEnd(30) + profiles.map(p => p.substring(0, 15).padEnd(18)).join(''));
    console.log('-'.repeat(30 + profiles.length * 18));
    
    // For each test result
    testResults.forEach(result => {
        const row = [result.desc.padEnd(30)];
        
        profiles.forEach(profileName => {
            const profile = config.profiles.load(profileName);
            let publication = null;
            
            // Find which publication pattern matches
            for (const [pub, pattern] of Object.entries(profile.publications?.patterns || {})) {
                if (pattern.test(result.id)) {
                    publication = pub;
                    break;
                }
            }
            
            if (publication) {
                const weight = profile.publications?.weights?.[publication] || 1.0;
                row.push(`${publication} (${weight})`.substring(0, 17).padEnd(18));
            } else {
                row.push('no match'.padEnd(18));
            }
        });
        
        console.log(row.join(''));
    });
    
    // Summary of unique weights
    console.log('\n\n📌 Unique Profile Characteristics:\n');
    
    profiles.forEach(profileName => {
        const profile = config.profiles.load(profileName);
        console.log(`${profileName}:`);
        
        // Find weights that differ from default
        const defaultProfile = config.profiles.load('default');
        const uniqueWeights = {};
        
        Object.entries(profile.publications?.weights || {}).forEach(([pub, weight]) => {
            const defaultWeight = defaultProfile.publications?.weights?.[pub] || 1.0;
            if (Math.abs(weight - defaultWeight) > 0.1) {
                uniqueWeights[pub] = { profile: weight, default: defaultWeight };
            }
        });
        
        if (Object.keys(uniqueWeights).length > 0) {
            Object.entries(uniqueWeights)
                .sort(([,a], [,b]) => Math.abs(b.profile - b.default) - Math.abs(a.profile - a.default))
                .slice(0, 5)
                .forEach(([pub, weights]) => {
                    const diff = weights.profile - weights.default;
                    const arrow = diff > 0 ? '↑' : '↓';
                    console.log(`  ${arrow} ${pub}: ${weights.default} → ${weights.profile} (${diff > 0 ? '+' : ''}${diff.toFixed(1)})`);
                });
        } else {
            console.log('  No significant weight differences from default');
        }
        
        // Show search strategy weights if any
        if (profile.searchStrategies?.weights && Object.keys(profile.searchStrategies.weights).length > 0) {
            console.log('  Search priorities:');
            Object.entries(profile.searchStrategies.weights)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 3)
                .forEach(([strategy, weight]) => {
                    console.log(`    ${strategy}: ${weight}`);
                });
        }
        
        console.log();
    });
}

// Run it
testScoringDifferences();