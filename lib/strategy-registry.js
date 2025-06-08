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
      category: 'adaptation'
    });

    // Review-specific strategies - historical terminology
    this.register('title_notices', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"notices"',
        confidence: 'high',
        description: 'Film title + notices (period review term)'
      }),
      defaultWeight: 3.0,
      category: 'review'
    });

    this.register('title_comment', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"comment"',
        confidence: 'high',
        description: 'Film title + comment'
      }),
      defaultWeight: 2.5,
      category: 'review'
    });

    this.register('title_boxoffice', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"box office"',
        confidence: 'medium',
        description: 'Film title + box office'
      }),
      defaultWeight: 2.5,
      category: 'review'
    });

    this.register('title_exhibitor', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"exhibitor"',
        confidence: 'medium',
        description: 'Film title + exhibitor reports'
      }),
      defaultWeight: 2.0,
      category: 'review'
    });

    // Interview/publicity strategies - period terminology
    this.register('director_says', {
      condition: (film) => film.director && film.director !== '-',
      generator: (film) => ({
        keyword: `"${film.director || film.Director}"`,
        secondKeyword: '"says"',
        confidence: 'medium',
        description: 'Director + says (common interview marker)'
      }),
      defaultWeight: 2.5,
      category: 'interview'
    });

    this.register('star_tells', {
      condition: (film) => film.star && film.star !== '-',
      generator: (film) => ({
        keyword: `"${film.star || film.Star}"`,
        secondKeyword: '"tells"',
        confidence: 'medium',
        description: 'Star + tells'
      }),
      defaultWeight: 2.5,
      category: 'interview'
    });

    this.register('personality_sketch', {
      condition: (film) => film.star && film.star !== '-',
      generator: (film) => ({
        keyword: `"${film.star || film.Star}"`,
        secondKeyword: '"personality"',
        confidence: 'medium',
        description: 'Star personality sketch'
      }),
      defaultWeight: 2.0,
      category: 'interview'
    });

    // Advertisement/publicity strategies - historical terms
    this.register('title_playdate', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"playdate"',
        confidence: 'high',
        description: 'Film title + playdate'
      }),
      defaultWeight: 2.0,
      category: 'advertisement'
    });

    this.register('title_booking', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"booking"',
        confidence: 'medium',
        description: 'Film title + booking'
      }),
      defaultWeight: 2.0,
      category: 'advertisement'
    });

    this.register('title_exploitation', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"exploitation"',
        confidence: 'medium',
        description: 'Film title + exploitation (publicity term)'
      }),
      defaultWeight: 2.0,
      category: 'advertisement'
    });

    this.register('company_release', {
      condition: (film) => film.company && film.company !== '-',
      generator: (film) => ({
        keyword: `"${film.company || film.Company}"`,
        secondKeyword: '"release"',
        confidence: 'medium',
        description: 'Company + release'
      }),
      defaultWeight: 2.0,
      category: 'advertisement'
    });

    // Production/creative staff - period terminology
    this.register('megaphoned_by', {
      condition: (film) => film.director && film.director !== '-',
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"megaphoned"',
        confidence: 'medium',
        description: 'Film + megaphoned (directed)'
      }),
      defaultWeight: 2.0,
      category: 'production'
    });

    this.register('lensed_by', {
      condition: (film) => film.cinematographer && film.cinematographer !== '-',
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"lensed"',
        confidence: 'medium',
        description: 'Film + lensed (cinematography)'
      }),
      defaultWeight: 2.0,
      category: 'creative_staff'
    });

    this.register('scenario_by', {
      condition: (film) => film.screenwriter && film.screenwriter !== '-',
      generator: (film) => ({
        keyword: `"${film.screenwriter || film.Screenwriter}"`,
        secondKeyword: '"scenario"',
        confidence: 'high',
        description: 'Screenwriter + scenario'
      }),
      defaultWeight: 2.5,
      category: 'creative_staff'
    });

    this.register('adapted_from', {
      condition: (film) => film.author && film.author !== '-',
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"adapted from"',
        confidence: 'high',
        description: 'Film adapted from source'
      }),
      defaultWeight: 2.5,
      category: 'adaptation'
    });

    // Studio system era terminology
    this.register('pacted_for', {
      condition: (film) => film.star && film.star !== '-',
      generator: (film) => ({
        keyword: `"${film.star || film.Star}"`,
        secondKeyword: '"pacted"',
        confidence: 'medium',
        description: 'Star + pacted (contracted)'
      }),
      defaultWeight: 2.0,
      category: 'production'
    });

    this.register('assigned_to', {
      condition: (film) => film.director && film.director !== '-',
      generator: (film) => ({
        keyword: `"${film.director || film.Director}"`,
        secondKeyword: '"assigned"',
        confidence: 'medium',
        description: 'Director + assigned to project'
      }),
      defaultWeight: 2.0,
      category: 'production'
    });

    // Early cinema terminology (1880s-1920s)
    this.register('photoplay_version', {
      condition: (film) => film.year && parseInt(film.year) < 1930,
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"photoplay"',
        confidence: 'medium',
        description: 'Title + photoplay (early term)'
      }),
      defaultWeight: 2.0,
      category: 'general'
    });

    this.register('picture_play', {
      condition: (film) => film.year && parseInt(film.year) < 1920,
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"picture play"',
        confidence: 'low',
        description: 'Title + picture play (very early term)'
      }),
      defaultWeight: 1.5,
      category: 'general'
    });

    // Trade-specific terminology
    this.register('grosses_reported', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"grosses"',
        confidence: 'medium',
        description: 'Film + grosses (box office)'
      }),
      defaultWeight: 2.0,
      category: 'box_office'
    });

    this.register('percentage_terms', {
      generator: (film) => ({
        keyword: `"${film.title || film.Title}"`,
        secondKeyword: '"percentage"',
        confidence: 'low',
        description: 'Film + percentage (exhibition terms)'
      }),
      defaultWeight: 1.5,
      category: 'box_office'
    });
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