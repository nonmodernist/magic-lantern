// test-labor-strategies.js
const strategyRegistry = require('../lib/strategy-registry');
const SearchStrategyGenerator = require('../lib/search-strategy-generator');

function testLaborStrategies() {
    console.log('🔨 Testing Labor-Specific Strategies\n');
    
    const generator = new SearchStrategyGenerator();
    // Simulate labor-history profile weights
    generator.strategyWeights = {
        'title_strike': 2.5,
        'title_work_stoppage': 2.0,
        'studio_labor': 1.8,
        'studio_boycott': 1.6
    };
    
    const testFilm = {
        title: "The Wizard of Oz",
        studio: "Metro-Goldwyn-Mayer"
    };
    
    const strategies = generator.generateAllStrategies(testFilm);
    const laborStrategies = strategies.filter(s => 
        s.type.includes('strike') || s.type.includes('labor') || 
        s.type.includes('picket') || s.type.includes('boycott')
    );
    
    console.log('Labor strategies generated:');
    laborStrategies.forEach(s => {
        console.log(`\n${s.type} (weight: ${s.profileWeight}):`);
        console.log(`  Query: ${s.query}`);
        console.log(`  Confidence: ${s.confidence}`);
        console.log(`  Description: ${s.description}`);
    });
}

testLaborStrategies();