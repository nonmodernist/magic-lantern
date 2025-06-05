// test-strategy-generation.js
const UnifiedMagicLantern = require('../magic-lantern-v5');
const strategyRegistry = require('../lib/strategy-registry');

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
        'labor-history',
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
        
        // NEW: Show labor-related strategies for labor-history profile
        if (profile === 'labor-history') {
            const laborStrategies = strategies.filter(s => 
                s.type.includes('strike') || s.type.includes('labor') || 
                s.type.includes('picket') || s.type.includes('boycott') ||
                s.type.includes('walkout')
            );
            console.log(`\nLabor strategies: ${laborStrategies.length}`);
            if (laborStrategies.length > 0) {
                console.log('Examples:');
                laborStrategies.forEach(s => {
                    console.log(`  - [${s.type}] ${s.query}`);
                });
            }
        }
        
        // NEW: Identify which strategies came from registry vs legacy
        const registryTypes = strategyRegistry.getAll().map(s => s.type);
        const fromRegistry = strategies.filter(s => registryTypes.includes(s.type));
        const fromLegacy = strategies.filter(s => !registryTypes.includes(s.type));
        
        console.log(`\nSource breakdown:`);
        console.log(`  From registry: ${fromRegistry.length}`);
        console.log(`  From legacy: ${fromLegacy.length}`);
    }
}

// NEW: Test registry directly
async function testRegistry() {
    console.log('\n\n🧪 Testing Strategy Registry Directly\n');
    console.log('='.repeat(60));
    
    // Test getting all strategies
    const allStrategies = strategyRegistry.getAll();
    console.log(`\nTotal strategies in registry: ${allStrategies.length}`);
    
    // Test by category
    const categories = ['title', 'labor', 'creator'];
    categories.forEach(cat => {
        const catStrategies = strategyRegistry.getByCategory(cat);
        console.log(`\n${cat} strategies: ${catStrategies.length}`);
        catStrategies.forEach(s => {
            console.log(`  - ${s.type}: ${s.description}`);
        });
    });
    
    // Test query building and parsing
    console.log('\n\nTesting query building and parsing:');
    const testCases = [
        { type: 'title_strike', film: { title: 'Test Film' } },
        { type: 'studio_labor', film: { studio: 'MGM' } },
        { type: 'author_title', film: { author: 'Jane Doe', title: 'Test Book' } }
    ];
    
    testCases.forEach(test => {
        const strategy = strategyRegistry.get(test.type);
        if (strategy) {
            const data = strategy.generator(test.film);
            const query = strategyRegistry.buildQuery(data);
            const parsed = strategyRegistry.parseQuery(query, test.type);
            
            console.log(`\n${test.type}:`);
            console.log(`  Generated query: ${query}`);
            console.log(`  Parsed back: ${JSON.stringify(parsed)}`);
        }
    });
}

// Run both tests
async function runAllTests() {
    await testStrategyGeneration();
    await testRegistry();
}

runAllTests();