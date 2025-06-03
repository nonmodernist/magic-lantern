// quick-profile-test.js
const config = require('./config');

console.log('🚀 Quick Profile Test\n');

// 1. List all profiles
console.log('Available profiles:');
config.profiles.list().forEach(p => {
    console.log(`  - ${p.key}: ${p.description}`);
});

// 2. Test loading each profile
console.log('\n\nLoading test:');
config.profiles.list().forEach(p => {
    try {
        const profile = config.profiles.load(p.key);
        const pubCount = Object.keys(profile.publications?.weights || {}).length;
        const stratCount = Object.keys(profile.searchStrategies?.weights || {}).length;
        console.log(`✅ ${p.key}: ${pubCount} publications, ${stratCount} strategy weights`);
    } catch (e) {
        console.log(`❌ ${p.key}: ${e.message}`);
    }
});

// 3. Test a specific profile's unique characteristics
console.log('\n\nProfile characteristics:');
const testProfile = 'adaptation-studies';
const profile = config.profiles.load(testProfile);

console.log(`\n${testProfile} profile:`);
console.log('Top weighted publications:');
Object.entries(profile.publications?.weights || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([pub, weight]) => {
        console.log(`  ${pub}: ${weight}`);
    });

console.log('\nSearch strategy weights:');
Object.entries(profile.searchStrategies?.weights || {})
    .sort(([,a], [,b]) => b - a)
    .forEach(([strategy, weight]) => {
        console.log(`  ${strategy}: ${weight}`);
    });