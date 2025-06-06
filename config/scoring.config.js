// config/scoring.config.js
module.exports = {
  // Content scoring now based on themes, significance, and entities
  // rather than content types
  
  themes: {
    weights: {
      labor_relations: 3.0,
      censorship: 2.5,
      cultural_controversy: 2.5,
      technical_innovation: 2.0,
      marketing_campaign: 1.5,
      family_audience: 1.0
    }
  },
  
  significance: {
    weights: {
      exceptional_performance: 3.0,
      cultural_controversy: 2.5,
      technical_innovation: 2.5,
      critical_acclaim: 2.0,
      commercial_success: 1.5,
      broad_distribution: 1.0
    }
  }
};