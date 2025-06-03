// test-profile-impact.js
const config = require('../config');

function simulateProfileImpact() {
    console.log('🎯 Simulating Profile Impact on Search Results\n');
    
    // Simulate some search results
    const mockResults = [
        { id: 'variety_001', position: 1, excerpt: 'Fannie Hurst adaptation scores' },
        { id: 'photoplay_002', position: 2, excerpt: 'Louisa May Alcott story brought to screen' },
        { id: 'boxoffice_003', position: 3, excerpt: 'Playing well in small towns' },
        { id: 'motionpicturewor_004', position: 4, excerpt: 'Production begins on literary adaptation' },
        { id: 'modernscreen_005', position: 5, excerpt: 'Star talks about playing beloved character' },
        { id: 'exhibher_006', position: 6, excerpt: 'Chicago exhibitors report strong receipts' },
        { id: 'motography_007', position: 7, excerpt: 'Technical aspects of filming classic' }
    ];
    
    const profiles = ['default', 'adaptation-studies', 'regional-reception', 'early-adaptations'];
    
    console.log('How different profiles would rank these same results:\n');
    
    profiles.forEach(profileName => {
        console.log(`\n${profileName.toUpperCase()} PROFILE:`);
        console.log('-'.repeat(50));
        
        const profile = config.profiles.load(profileName);
        
        // Score each result
        const scored = mockResults.map(result => {
            // Extract publication
            let publication = null;
            for (const [pub, pattern] of Object.entries(profile.publications?.patterns || {})) {
                if (pattern.test(result.id)) {
                    publication = pub;
                    break;
                }
            }
            
            // Calculate score
            const positionScore = 100 - (result.position - 1) * 10;
            const pubWeight = publication ? (profile.publications?.weights?.[publication] || 1.0) : 1.0;
            const finalScore = positionScore * pubWeight;
            
            return {
                ...result,
                publication,
                pubWeight,
                finalScore
            };
        });
        
        // Sort by final score
        scored.sort((a, b) => b.finalScore - a.finalScore);
        
        // Display top 5
        scored.slice(0, 5).forEach((result, idx) => {
            console.log(`${idx + 1}. [${result.finalScore.toFixed(0)}] ${result.publication || 'unknown'} - "${result.excerpt}"`);
            if (result.pubWeight !== 1.0) {
                console.log(`   (weight: ${result.pubWeight})`);
            }
        });
    });
}

// Run it
simulateProfileImpact();