// config/index.js
const scoring = require('./scoring.config');
const search = require('./search.config');

const profiles = require('./profiles');

module.exports = {
  profiles,  // Add profile loader
  scoring: {
    contentTypes: scoring.contentTypes  // Keep this here
  },
  search: {
    api: search.api,  // Keep API settings here
    fullText: search.fullText  // Keep full text settings
  },
  
  // Corpus profiles
  corpus: {
test: {
    filmsToProcess: 1, // temporarily reduce to really test test
    strategiesPerFilm: 10,  // Only top strategies
    fullTextFetches: 3,
    stopEarlyThreshold: 15
  },
  single: {
    filmsToProcess: 1, //deep dive into one film
    strategiesPerFilm: 20,
    fullTextFetches: 5, // could increase this - but only after improving scoring?
    stopEarlyThreshold: 50 // stops searching after 50 deduplicated results
  },
  medium: {
    filmsToProcess: 20,
    strategiesPerFilm: 15,
    fullTextFetches: 5,
    stopEarlyThreshold: 20
  },
  full: {
    filmsToProcess: 120,
    strategiesPerFilm: 20,
    fullTextFetches: 7,
    stopEarlyThreshold: 25
  }
  },
  
 // Updated load method
  load(corpusProfile = 'test', researchProfile = 'default') {
    const profile = profiles.load(researchProfile);
    const baseConfig = {
      scoring: this.scoring,
      search: this.search,
      corpus: this.corpus[corpusProfile]
    };
    
    // Merge profile settings with base config
    const merged = profiles.mergeWithConfig(baseConfig, profile);
    
    // Add profile info for reference
    merged.profileInfo = {
      corpus: corpusProfile,
      research: researchProfile,
      profileName: profile.name,
      profileDescription: profile.description
    };
    
    return merged;
  }
};