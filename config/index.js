// config/index.js
const scoring = require('./scoring.config');
const search = require('./search.config');

module.exports = {
  scoring,
  search,
  
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
    fullTextFetches: 5,
    stopEarlyThreshold: 50 // ? what does this do?
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
  
  // Override any config with environment variables
  load(profile = 'test') {
    const config = {
      scoring: { ...scoring },
      search: { ...search },
      corpus: this.corpus[profile]
    };
    
    // Allow env var overrides
    if (process.env.LANTERN_RATE_LIMIT) {
      config.search.api.rateLimitMs = parseInt(process.env.LANTERN_RATE_LIMIT);
    }
    
    return config;
  }
};