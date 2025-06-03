// test-strategy-generation.js
const UnifiedMagicLantern = require('../magic-lantern-v5');

async function testStrategyGeneration() {
    console.log('🔍 Testing Search Strategy Generation Across Profiles\n');
    
    // Test film with full metadata
    const testFilm = {
        title: "Little Women",
        year: 1933,
        author: "Louisa May Alcott",
        director: "George Cukor", 
        studio: "RKO Pictures"
    };
    
    const profiles = [
        'default',
        'adaptation-studies',
        'early-adaptations',
        'regional-reception',
        '50s-adaptations',
        'early-cinema',
        'studio-era-adaptations'
    ];
    
    for (const profile of profiles) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Profile: ${profile}`);
        console.log(`${'='.repeat(60)}`);
        
        const lantern = new UnifiedMagicLantern('test', profile);
        const strategies = lantern.strategyGenerator.generateAllStrategies(testFilm);
        
        // Count by type
        const typeCounts = {};
        strategies.forEach(s => {
            typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
        });
        
        // Show total
        console.log(`\nTotal strategies generated: ${strategies.length}`);
        
        // Show breakdown
        console.log('\nStrategy breakdown:');
        Object.entries(typeCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
        
        // Show author-related strategies specifically
        const authorStrategies = strategies.filter(s => 
            s.type.includes('author') || s.type.includes('novel') || s.type.includes('source')
        );
        console.log(`\nAuthor/adaptation strategies: ${authorStrategies.length}`);
        if (authorStrategies.length > 0) {
            console.log('Examples:');
            authorStrategies.slice(0, 3).forEach(s => {
                console.log(`  - ${s.query}`);
            });
        }
    }
}

// Run it
testStrategyGeneration();