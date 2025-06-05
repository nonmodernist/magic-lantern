// lib/strategy-registry.js
class StrategyRegistry {
    constructor() {
        this.strategies = new Map();
        this.initializeStrategies();
    }

    initializeStrategies() {
        // Title-based strategies
        this.register('exact_title', {
            generator: (film) => ({
            keyword: `"${film.title || film.Title}"`,
            confidence: 'high',
            description: 'Exact title match'
        }),
        defaultWeight: 1.0,
        category: 'title'
    });

    this.register('title_no_article', {
        condition: (film) => {
            const title = film.title || film.Title;
            return ['The', 'A', 'An'].some(article => title.startsWith(article + ' '));
        },
        generator: (film) => {
            const title = film.title || film.Title;
            const article = ['The', 'A', 'An'].find(a => title.startsWith(a + ' '));
            const shortTitle = title.substring(article.length + 1);
            return {
            keyword: `"${shortTitle}"`,
            confidence: 'high',
            description: `Title without "${article}"`
            };
        },
        defaultWeight: 1.0,
        category: 'title'
        });

        // Labor-specific strategies
        this.register('title_strike', {
            generator: (film) => ({
                keyword: `"${film.title || film.Title}"`,
                secondKeyword: '"picketed"',
                confidence: 'high',
                description: 'Film title + picketed'
            }),
                defaultWeight: 2.5,
                category: 'labor',
                profileRequired: 'labor'
        });

    this.register('title_work_stoppage', {
        generator: (film) => ({
            keyword: `"${film.title || film.Title}"`,
            secondKeyword: '"work stoppage"',
            confidence: 'high',
            description: 'Film title + work stoppage'
            }),
            defaultWeight: 2.0,
            category: 'labor',
            profileRequired: 'labor'
            });

    this.register('studio_labor', {
      condition: (film) => film.studio && film.studio !== '-',
      generator: (film) => ({
        keyword: `"${film.studio || film.Studio}"`,
        secondKeyword: '"labor dispute"',
        confidence: 'medium',
        description: 'Studio + "labor dispute"'
      }),
      defaultWeight: 1.8,
      category: 'labor',
      profileRequired: 'labor'
    });

    // Author/adaptation strategies
    this.register('author_title', {
      condition: (film) => film.author && film.author !== '-',
      generator: (film) => ({
        keyword: `"${film.author || film.Author}"`,
        secondKeyword: `"${film.title || film.Title}"`,
        confidence: 'high',
        description: 'Author + exact title'
      }),
      defaultWeight: 1.5,
      category: 'creator'
    });

    // Add more strategies here...
  }

  register(type, config) {
    this.strategies.set(type, { type, ...config });
  }

  get(type) {
    return this.strategies.get(type);
  }

  getAll() {
    return Array.from(this.strategies.values());
  }

  getByCategory(category) {
    return this.getAll().filter(s => s.category === category);
  }

  // Build the query string from keywords
  buildQuery(keywords) {
    const parts = [];
    if (keywords.keyword) parts.push(keywords.keyword);
    if (keywords.secondKeyword) parts.push(keywords.secondKeyword);
    if (keywords.thirdKeyword) parts.push(keywords.thirdKeyword);
    return parts.join(' ');
  }

  // Parse query back into keywords for API
  parseQuery(query, strategyType) {
    const strategy = this.get(strategyType);
    if (!strategy) return this.legacyParse(query);

    // For now, we'll use a simple parsing approach
    // This could be enhanced based on the strategy definition
    const keywords = {};
    const quotedPhrases = query.match(/"[^"]+"/g) || [];
    const remainingText = query.replace(/"[^"]+"/g, '').trim();
    const unquotedWords = remainingText.split(/\s+/).filter(w => w.length > 0);

    // Most strategies follow a pattern of keyword + secondKeyword
    if (quotedPhrases.length > 0) {
        keywords.keyword = quotedPhrases[0];
        if (quotedPhrases.length > 1) keywords.second_keyword = quotedPhrases[1];
        if (quotedPhrases.length > 2) keywords.third_keyword = quotedPhrases[2];
    }

    // Add any unquoted words
    let keywordIndex = keywords.second_keyword ? 2 : (keywords.keyword ? 1 : 0);
    unquotedWords.forEach(word => {
        if (keywordIndex === 0) keywords.keyword = word;
        else if (keywordIndex === 1) keywords.second_keyword = word;
        else if (keywordIndex === 2) keywords.third_keyword = word;
        keywordIndex++;
    });

    return keywords;
}

  // Fallback for strategies not yet migrated
    legacyParse(query) {
    // This would contain the existing parsing logic
    // for backward compatibility
    return {};
    }
}

module.exports = new StrategyRegistry();