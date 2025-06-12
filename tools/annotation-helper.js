#!/usr/bin/env node

// annotation-helper.js
// Helper script for adding structured annotations to Magic Lantern JSON results

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class AnnotationHelper {
  constructor(jsonFile) {
    this.jsonFile = jsonFile;
    this.loadData();
    
    // Define annotation schemas for validation
    this.schemas = {
      productionDates: {
        required: ['date', 'dateType', 'excerpt'],
        optional: ['confidence', 'pageContext', 'tags'],
        dateTypes: ['filming_start', 'filming_end', 'production_start', 'wrap', 'reshoot', 'location_shoot', 'studio_shoot', 'other'],
        confidenceLevels: ['explicit', 'inferred', 'uncertain']
      },
      locations: {
        required: ['location', 'locationType', 'excerpt'],
        optional: ['specificArea', 'dateReference', 'coordinates'],
        locationTypes: ['studio', 'backlot', 'on_location', 'city', 'country', 'indoor_set', 'outdoor_set', 'other']
      },
      people: {
        required: ['name', 'role', 'excerpt'],
        optional: ['note', 'date', 'department'],
        roles: ['director', 'actor', 'producer', 'writer', 'cinematographer', 'editor', 'composer', 'production_designer', 'costume_designer', 'crew', 'executive', 'other']
      },
      labor: {
        required: ['type', 'excerpt'],
        optional: ['interpretation', 'date', 'participants', 'outcome'],
        types: ['strike', 'working_conditions', 'wages', 'hours', 'union_action', 'safety_incident', 'labor_dispute', 'contract_negotiation', 'other']
      },
      technical: {
        required: ['aspect', 'excerpt'],
        optional: ['issue', 'impact', 'resolution', 'date'],
        aspects: ['cinematography', 'sound', 'color', 'special_effects', 'editing', 'equipment', 'process', 'innovation', 'other']
      },
      general: {
        required: ['category', 'note', 'excerpt'],
        optional: ['significance', 'date', 'relatedTo'],
        categories: ['budget', 'schedule', 'reception', 'censorship', 'marketing', 'distribution', 'accident', 'trivia', 'other']
      }
    };
  }

  loadData() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.jsonFile, 'utf8'));
      console.log(`✅ Loaded data from ${this.jsonFile}`);
      console.log(`   Found ${this.data.length} films\n`);
    } catch (error) {
      console.error(`❌ Error loading file: ${error.message}`);
      process.exit(1);
    }
  }

  save() {
    // Create backup before saving
    const backupFile = `${this.jsonFile}.backup-${Date.now()}`;
    fs.copyFileSync(this.jsonFile, backupFile);
    
    // Save with pretty formatting
    fs.writeFileSync(this.jsonFile, JSON.stringify(this.data, null, 2));
    console.log(`\n✅ Annotations saved to ${this.jsonFile}`);
    console.log(`   Backup created: ${backupFile}`);
  }

  // Validate annotation data against schema
  validateAnnotation(type, data) {
    const schema = this.schemas[type];
    if (!schema) {
      throw new Error(`Unknown annotation type: ${type}`);
    }

    // Check required fields
    const missing = schema.required.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Validate enum fields
    if (schema.dateTypes && data.dateType && !schema.dateTypes.includes(data.dateType)) {
      throw new Error(`Invalid dateType. Must be one of: ${schema.dateTypes.join(', ')}`);
    }
    if (schema.confidenceLevels && data.confidence && !schema.confidenceLevels.includes(data.confidence)) {
      throw new Error(`Invalid confidence. Must be one of: ${schema.confidenceLevels.join(', ')}`);
    }
    if (schema.locationTypes && data.locationType && !schema.locationTypes.includes(data.locationType)) {
      throw new Error(`Invalid locationType. Must be one of: ${schema.locationTypes.join(', ')}`);
    }
    // Add more validation as needed...

    return true;
  }

  // Add annotation programmatically
  addAnnotation(filmTitle, sourceId, annotationType, annotationData) {
    try {
      // Validate annotation
      this.validateAnnotation(annotationType, annotationData);

      // Find film
      const film = this.data.find(f => f.film.title === filmTitle);
      if (!film) {
        throw new Error(`Film not found: ${filmTitle}`);
      }

      // Find source
      const source = film.sources.find(s => s.id === sourceId);
      if (!source) {
        // List available sources
        console.error(`Source not found: ${sourceId}`);
        console.log('\nAvailable sources for this film:');
        film.sources.slice(0, 10).forEach(s => {
          console.log(`  - ${s.id}`);
        });
        return false;
      }

      // Initialize annotations structure if needed
      if (!source.annotations) {
        source.annotations = {};
      }
      if (!source.annotations[annotationType]) {
        source.annotations[annotationType] = [];
      }

      // Add metadata
      annotationData.addedAt = new Date().toISOString();
      
      // Add annotation
      source.annotations[annotationType].push(annotationData);
      
      console.log(`\n✅ Added ${annotationType} annotation to ${sourceId}`);
      return true;
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      return false;
    }
  }

  // Interactive annotation mode
  async interactive() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
      // Select film
      console.log('\n📽️  FILMS IN DATABASE:\n');
      this.data.forEach((f, i) => {
        console.log(`${i + 1}. ${f.film.title} (${f.film.year}) - ${f.sources.length} sources`);
      });

      const filmIndex = parseInt(await question('\nSelect film number: ')) - 1;
      if (filmIndex < 0 || filmIndex >= this.data.length) {
        throw new Error('Invalid film selection');
      }

      const selectedFilm = this.data[filmIndex];
      console.log(`\n✅ Selected: ${selectedFilm.film.title}`);

      // Select source
      console.log('\n📄 SOURCES (showing first 20):\n');
      selectedFilm.sources.slice(0, 20).forEach((s, i) => {
        const pub = s.scoring?.publication || 'unknown';
        const excerpt = s.attributes?.body?.attributes?.value || 'No excerpt available';
        console.log(`${i + 1}. [${pub}] ${s.id}`);
        console.log(`   "${excerpt.substring(0, 80)}..."\n`);
      });

      const sourceIndex = parseInt(await question('Select source number: ')) - 1;
      if (sourceIndex < 0 || sourceIndex >= selectedFilm.sources.length) {
        throw new Error('Invalid source selection');
      }

      const selectedSource = selectedFilm.sources[sourceIndex];
      console.log(`\n✅ Selected source: ${selectedSource.id}`);

      // Select annotation type
      console.log('\n🏷️  ANNOTATION TYPES:\n');
      const types = Object.keys(this.schemas);
      types.forEach((type, i) => {
        console.log(`${i + 1}. ${type}`);
      });

      const typeIndex = parseInt(await question('\nSelect annotation type: ')) - 1;
      if (typeIndex < 0 || typeIndex >= types.length) {
        throw new Error('Invalid type selection');
      }

      const annotationType = types[typeIndex];
      const schema = this.schemas[annotationType];

      console.log(`\n📝 Adding ${annotationType} annotation`);
      console.log(`Required fields: ${schema.required.join(', ')}`);
      console.log(`Optional fields: ${schema.optional.join(', ')}\n`);

      // Collect annotation data
      const annotationData = {};

      // Collect required fields
      for (const field of schema.required) {
        let value;
        
        // Show options for enum fields
        if (field === 'dateType' && schema.dateTypes) {
          console.log(`Options: ${schema.dateTypes.join(', ')}`);
        } else if (field === 'confidence' && schema.confidenceLevels) {
          console.log(`Options: ${schema.confidenceLevels.join(', ')}`);
        } else if (field === 'locationType' && schema.locationTypes) {
          console.log(`Options: ${schema.locationTypes.join(', ')}`);
        } else if (field === 'role' && schema.roles) {
          console.log(`Options: ${schema.roles.join(', ')}`);
        } else if (field === 'type' && schema.types) {
          console.log(`Options: ${schema.types.join(', ')}`);
        }

        value = await question(`${field} (required): `);
        if (!value) {
          throw new Error(`${field} is required`);
        }
        annotationData[field] = value;
      }

      // Ask about optional fields
      console.log('\n📋 Optional fields (press Enter to skip):');
      for (const field of schema.optional) {
        const value = await question(`${field} (optional): `);
        if (value) {
          annotationData[field] = value;
        }
      }

      // Add the annotation
      const success = this.addAnnotation(
        selectedFilm.film.title,
        selectedSource.id,
        annotationType,
        annotationData
      );

      if (success) {
        const saveNow = await question('\nSave changes now? (y/n): ');
        if (saveNow.toLowerCase() === 'y') {
          this.save();
        }

        const addAnother = await question('\nAdd another annotation? (y/n): ');
        if (addAnother.toLowerCase() === 'y') {
          rl.close();
          await this.interactive();
          return;
        }
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
    }

    rl.close();
  }

  // Batch add annotations from CSV
  async batchAdd(csvFile) {
    console.log(`\n📊 Batch adding annotations from ${csvFile}`);
    
    const content = fs.readFileSync(csvFile, 'utf8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx];
      });

      // Extract film info and annotation data
      const { film_title, source_id, annotation_type, ...annotationData } = row;

      try {
        const success = this.addAnnotation(film_title, source_id, annotation_type, annotationData);
        if (success) successCount++;
        else errorCount++;
      } catch (error) {
        console.error(`Row ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Batch complete: ${successCount} added, ${errorCount} errors`);
    
    if (successCount > 0) {
      this.save();
    }
  }

  // Show statistics about annotations
  showStats() {
    console.log('\n📊 ANNOTATION STATISTICS\n');
    
    let totalAnnotations = 0;
    const annotationCounts = {};
    const filmStats = {};

    this.data.forEach(filmData => {
      const filmKey = `${filmData.film.title} (${filmData.film.year})`;
      filmStats[filmKey] = { sources: filmData.sources.length, annotations: 0 };

      filmData.sources.forEach(source => {
        if (source.annotations) {
          Object.entries(source.annotations).forEach(([type, items]) => {
            const count = items.length;
            totalAnnotations += count;
            filmStats[filmKey].annotations += count;
            annotationCounts[type] = (annotationCounts[type] || 0) + count;
          });
        }
      });
    });

    console.log(`Total annotations: ${totalAnnotations}\n`);
    
    console.log('By type:');
    Object.entries(annotationCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\nBy film:');
    Object.entries(filmStats).forEach(([film, stats]) => {
      if (stats.annotations > 0) {
        console.log(`  ${film}: ${stats.annotations} annotations across ${stats.sources} sources`);
      }
    });
  }

  // Export annotations to CSV
  exportToCSV(outputFile) {
    const rows = [];
    
    this.data.forEach(filmData => {
      filmData.sources.forEach(source => {
        if (source.annotations) {
          Object.entries(source.annotations).forEach(([type, items]) => {
            items.forEach(item => {
              rows.push({
                film_title: filmData.film.title,
                film_year: filmData.film.year,
                source_id: source.id,
                publication: source.scoring?.publication || 'unknown',
                annotation_type: type,
                ...item
              });
            });
          });
        }
      });
    });

    if (rows.length === 0) {
      console.log('No annotations to export');
      return;
    }

    // Get all unique keys
    const allKeys = new Set();
    rows.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);

    // Create CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(h => {
          const value = row[h] || '';
          // Escape values containing commas or quotes
          if (value.toString().includes(',') || value.toString().includes('"')) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    fs.writeFileSync(outputFile, csv);
    console.log(`\n✅ Exported ${rows.length} annotations to ${outputFile}`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
✨ MAGIC LANTERN ANNOTATION HELPER

Usage: 
  node annotation-helper.js <json-file> [options]

Options:
  --interactive, -i     Interactive mode for adding annotations
  --add                 Add annotation programmatically
  --batch <csv>         Batch add from CSV file
  --stats               Show annotation statistics
  --export <file>       Export annotations to CSV

Examples:
  node annotation-helper.js results/search-results.json --interactive
  node annotation-helper.js results/search-results.json --stats
  node annotation-helper.js results/search-results.json --export annotations.csv
  
  # Add annotation programmatically:
  node annotation-helper.js results/search-results.json --add \\
    --film "The Wizard of Oz" \\
    --source "variety137-1940-01_0054" \\
    --type "productionDates" \\
    --date "1939-03-15" \\
    --dateType "filming_start" \\
    --excerpt "Principal photography commenced yesterday"
`);
    process.exit(0);
  }

  const jsonFile = args[0];
  const helper = new AnnotationHelper(jsonFile);

  if (args.includes('--interactive') || args.includes('-i')) {
    helper.interactive();
  } else if (args.includes('--stats')) {
    helper.showStats();
  } else if (args.includes('--export')) {
    const exportIndex = args.indexOf('--export');
    const outputFile = args[exportIndex + 1] || 'annotations-export.csv';
    helper.exportToCSV(outputFile);
  } else if (args.includes('--batch')) {
    const batchIndex = args.indexOf('--batch');
    const csvFile = args[batchIndex + 1];
    if (!csvFile) {
      console.error('Please provide a CSV file for batch import');
      process.exit(1);
    }
    helper.batchAdd(csvFile);
  } else if (args.includes('--add')) {
    // Parse command line arguments for programmatic add
    const getArg = (name) => {
      const index = args.indexOf(`--${name}`);
      return index > -1 ? args[index + 1] : null;
    };

    const film = getArg('film');
    const source = getArg('source');
    const type = getArg('type');

    if (!film || !source || !type) {
      console.error('--add requires --film, --source, and --type');
      process.exit(1);
    }

    // Build annotation data from remaining arguments
    const annotationData = {};
    const schema = helper.schemas[type];
    if (!schema) {
      console.error(`Unknown annotation type: ${type}`);
      process.exit(1);
    }

    [...schema.required, ...schema.optional].forEach(field => {
      const value = getArg(field);
      if (value) {
        annotationData[field] = value;
      }
    });

    const success = helper.addAnnotation(film, source, type, annotationData);
    if (success) {
      helper.save();
    }
  }
}

module.exports = AnnotationHelper;