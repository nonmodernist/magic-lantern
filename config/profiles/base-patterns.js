// config/profiles/base-patterns.js
module.exports = {
  // Core patterns used by all profiles
  // These patterns match against Lantern item IDs to identify publications
  
  // regex cheatsheet
  // (?=foo)   // Positive lookahead: MUST be followed by 'foo'
  // (?!foo)   // Negative lookahead: must NOT be followed by 'foo'
  // (?<=foo)  // Positive lookbehind: MUST be preceded by 'foo'
  // (?<!foo)  // Negative lookbehind: must NOT be preceded by 'foo'
  
  // PATTERN COVERAGE REFERENCE:
  // harrisonsreports43harr_* → 'harrisons reports' (/harrison/i)
  // motionpictureexh65jaye_* → 'the exhibitor' (/\bexhibitor|motionpictureexh/i)
  // boxofficejanmar178boxo_* → 'boxoffice' (/boxoffice(?!digest|baromet)/i)
  // boxofficebarometer*_* → 'boxoffice barometer' (/boxofficebaromet/i)
  // americancinemato41unse_* → 'american cinematographer' (/americancinemato|american|amento/i)
  // artcraftpressboo*_* → 'paramount press book' (/paramountpress|artcraftpress|paramountartcraf|paramountpressbo/i)
  // exh00newy_* → 'exhibitors trade review' (/exhibitorstrade|exhibitorstra|exhibitorst(?!rade)|\bexhibitors(?!daily|herald)|\bexhi(?!bitor|bher)|\bexh(?!ibitor|iber)/i)
  // camera04unse_* → 'camera' (/camera/i)
  // cinemundial19unse_* → 'cinemundial' (/cinemundial/i)
  // clipper61-1914-01_* → 'the new york clipper' (/clipper/i)
  // closeup1920192300clos_* → 'close up' (/closeup/i)
  // amento04asch_* → 'american cinematographer' (/americancinemato|american|amento/i)
  // 
  // ADDITIONAL PATTERNS FROM JUNE 3RD RESULTS:
  // movingpicturewee24movi_* → 'moving picture weekly' (/movingpicturewee/i)
  // dynamo24-1950-04-01_* → '20th century fox dynamo' (/dynamo/i)
  // exhibitorfebapr149jaye_* → 'the exhibitor' (/\bexhibitor|motionpictureexh/i)
  // britishk2122brit_* → 'british kinematograph' (/britishk/i)
  // britishki20brit_* → 'british kinematograph' (/britishk/i)
  // britishkig1819brit_* → 'british kinematograph' (/britishk/i)
  // canadianfilmweekly-yearbook-* → 'canadian film weekly' (/canadianfilmweekly/i)
  // filmbulletin*film_* → 'independent exhibitors film bulletin' (/independentexhibitorsfilm|filmbulletin|\bindepe/i)

  'motion picture reviews': /motionpicturerev/i, // women's film reviews!
  'the motion picture and the family': /motionpicturefam/i, // try this source for 'wholesome' movies
  'motion picture daily': /motionpicturedai/i,
  'motion picture herald': /motionpictureher/i,
  'motion picture magazine': /motionpicturemag/i,
  'the exhibitor': /motionpictureexh/i,
  'motion picture story magazine': /motionpicturesto|motionpicture(?!rev|fam|dai|her|mag|new|exh)/i,
  'motion picture news': /motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i,
  
  'moving picture weekly': /movingpicturewee/i,
  'moving picture world': /^(MPW\d|moving(?:picture)?wor|moving(?:\d|$)|movin(?:g)?(?:or|wor)|movie?wor|mo(?:v)?(?:pic|wor)|more?wor|move?wor|movure)/i,
  'the movies and the people who make them': /moviespeoplewhom/i,
  'movie classic': /movieclassic/i,
  'movieland': /movielandtv/i,

  'picture play': /pictureplay/i,
  'motion picture news': /picturen/i,
  'pictures and the picturegoer': /\bpicture(?!n)/i,

  'exhibitors daily review': /exhibitorsdailyr/i,
  'exhibitors herald': /exhibher|exhibitorsh/i,
  'the exhibitor': /\bexhibitor|motionpictureexh/i,
  'independent exhibitors film bulletin': /independentexhibitorsfilm|filmbulletin|\bindepe/i,
  'the philadelphia exhibitor': /philadelphiaexhi/i,
  'exhibitors trade review': /exhibitorstrade|exhibitorstra|exhibitorst(?!rade)|\bexhibitors(?!daily|herald)|\bexhi(?!bitor|bher)|\bexh(?!ibitor|iber)/i,

  'the film daily': /filmdaily/i,
  'film mercury': /filmmercury/i,
  'film fun': /filmfun/i,

  'glamour of hollywood': /glamourofhollywo/i,

  'hollywood filmograph': /hollywoodfilmogr/i,
  'hollywood reporter': /hollywoodreport/i,
  'hollywood spectator': /hollywoodspectat/i,
  'hollywood': /\bhollywood(?!spectat|report|filmgr)/i,

  'new movie magazine': /newmoviemag/i,
  'new movies the national board of review magazine': /newmoviesnation/i,
  'national board of review magazine': /nationalboardofr/i,

  'american cinematographer': /^america(?!nmotionpi)|amento|^amri/i,
  'national box office digest': /boxofficedigest/i,
  'boxoffice barometer': /boxofficebaromet/i, 
  'boxoffice': /boxoffice(?!digest|baromet|checkup)/i,  // NOT followed by 'digest' or 'baromet'

  'cinemundial': /cinemundial/i,
  'camera': /camera/i,
  'close up': /closeup/i,
  'the new york clipper': /clipper/i,
  'harrisons reports': /harrisons/i,
  'illustrated films monthly': /illustra/i,
  'modern screen': /modernscreen/i,
  'motography': /motography/i,
  'movie mirror': /moviemirror/i,
  'photoplay': /photoplay|photo|pho/i,
  'radio tv mirror': /radiotvmirror|radiotvmi/i,
  'reel life': /reellife/i,
  'the screen writer': /screenwriter/i,
  'showmens trade review': /showmen/i,
  'silver screen': /silverscreen/i,
  'screenland': /screenland/i,
  'talking screen': /talkingscreen/i,
  'technicolor news and views': /technewsviews/i,
  'variety': /variety/i,
  'wids': /wids/i,
  'the writers monthly': /writersmonthly/i,

  '20th century fox dynamo': /dynamo/i,
  'paramount press book': /paramountpress|artcraftpress|paramountartcraf|paramountpressbo/i,
  'universal weekly': /universalweekly|universal/i,
  'mgm studio news': /mgmstudionews/i,
  'whos who at metro-goldwyn-mayer': /whoswhoatmetrogo/i,
  'mensajero paramount': /mensajeroparamou/i,
  'paramount around the world': /paramountinterna/,

  'MPPC lawsuit': /indistrictcourto/i,

  // Additional publications found in June 3rd results
  'british kinematograph': /britishk/i,
  'canadian film weekly': /canadianfilmweekly/i,

};