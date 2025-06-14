// config/profiles/base-patterns.js
module.exports = {
  // Core patterns used by all profiles
  // These patterns match against Lantern item IDs to identify publications
  
  // regex cheatsheet
  // (?=foo)   // Positive lookahead: MUST be followed by 'foo'
  // (?!foo)   // Negative lookahead: must NOT be followed by 'foo'
  // (?<=foo)  // Positive lookbehind: MUST be preceded by 'foo'
  // (?<!foo)  // Negative lookbehind: must NOT be preceded by 'foo'
  

  // WARNING: "motionpicture" prefix is used by multiple publications:
  // - Motion Picture Story Magazine - usually `motionpicturesto`
  // - Motion Picture Classic - usually `motionpicturecla`
  // - Motion Picture - 30s-40s fan magazine - primarily `motionpicture`
  // - Motion Picture Magazine - 10s-20s fan magazine
  // - Motion Picture News - trade mag - when "new" is truncated
  // - Moving Picture Weekly - `motionpicturewee00movi` - just once?

  // WARNING: "motion" prefix is used by multiple publications:
  // - Motion Play - `motionplay-1920-11-14-washington`
  // - Motion Picture News - trade mag - when "picture" is truncated

  // WARNING: `motion picture` patterns may generate false positives - always check Lantern for the real metadata

  // Order matters - most specific patterns first!

  'moving picture weekly': /movingpicturewee|motionpicturewee/i,

  'motion picture reviews': /motionpicturerev/i, // women's film reviews!
  'the motion picture and the family': /motionpicturefam/i, // try this source for 'wholesome' movies
  'motion picture daily': /motionpicturedai/i,
  'motion picture herald': /motionpictureher/i,
  'motion picture exhibitor': /motionpictureexh/i,
  'motion picture projectionist': /motionpicturepro/i,
  'motion picture studio': /motionpicturestu/i,
  'motion picture story magazine': /motionpicturesto/i, // fan mag
  'motion picture magazine': /motionpicturemag/i, // fan mag
  'motion picture classic': /motionpicturecla/i, // fan mag
  'motion picture news': /motionpicturenew|motionnew|^motionpic(?!ture)|^motionp(?!icture|lay)|^motion(?!picture|-play)|^picturen/i, // trade mag with many pattern variations
  'motion picture': /motionpicture(?!new|rev|dai|her|exh|pro|stu|sto|mag|cla)/i, // fan mag
  'motion play': /motion-play|motionplay/i,

  'the movies and the people who make them': /moviespeoplewhom/i,
  'movie classic': /movieclassic/i,
  'movieland': /movielandtv/i,
  'movietone': /movietone/i, // projectionist mag and chinese fan mag both use this
  'moving picture age': /movingpictureage/i,
  'moving picture world': /^(MPW\d|moving(?:picture)?wor|moving(?:\d|$)|movin(?:g)?(?:or|wor)|movie?wor|mo(?:v)?(?:pic|wor)|more?wor|move?wor|movure)/i, // yes it really does need to be this complicated and specific

  'picture play': /pictureplay|picturep/i,
  'motion picture news': /picturen/i,
  'pictures and the picturegoer': /^picture(?!n)/i,

  'exhibitors daily review': /exhibitorsdailyr/i,
  'exhibitors herald': /exhibher|exhibitorsh|exibitorsheraldw/i,
  'the exhibitor': /^exhibitor/i,
  'independent exhibitors film bulletin': /independentexhibitorsfilm|filmbulletin|^indepe/i,
  'the philadelphia exhibitor': /philadelphiaexhi/i,
  'exhibitors trade review': /exhibitorstrade|exhibitorstra|exhibitorst(?!rade)|^exhibitors(?!daily|herald)|\bexhi(?!bitor|bher)|\bexh(?!ibitor|iber)/i,

  'the film daily': /filmdai/i,
  'film mercury': /filmmercury/i,
  'film fun': /filmfun/i,

  'glamour of hollywood': /glamourofhollywo/i,

  'hollywood studio magazine': /hollywood-studio-magazine/i,
  'hollywood filmograph': /hollywoodfilmogr/i,
  'hollywood reporter': /hollywoodreport/i,
  'hollywood spectator': /hollywoodspectat/i,
  'hollywood': /^hollywood(?!spectat|report|filmogr|lowdown|motionp)/i,

  'new movie magazine': /newmoviemag/i,
  'new movies the national board of review magazine': /newmoviesnation/i,
  'national ballyhoo': /national-ballyhoo/i, // canadian
  'national box office digest': /nationalboxoffic/i,
  'national board of review magazine': /nationalboardofr/i,

  'american cinematographer': /^america(?!nmotionpi)|amento|^amri/i,
  'national box office digest': /boxofficedigest/i,
  'boxoffice barometer': /boxofficebaromet/i, 
  'boxoffice': /boxoffice(?!digest|baromet|checkup)/i,  // NOT followed by 'digest' or 'baromet'

  'billboard': /billboard/i,
  'broadway and hollywood movies': /broadwayhollywoo/i,
  'cine-journal': /cinejournal|^cine(?!mundial)/i,
  'cinelandia': /cinelandia/i,
  'cinemundial': /cinemundial/i,
  'cinema illustrazione': /cinema-illustrazione/i,
  'courrier cinematographique': /courrier/i,
  'camera': /camera/i,
  'close up': /closeup/i,
  'the new york clipper': /clipper/i,
  'harrisons reports': /harrisons/i,
  'illustrated films monthly': /illustra/i,
  'modern screen': /modernscreen/i,
  'motography': /motography/i,
  'movie mirror': /moviemirror/i,
  'new york state exhibitor': /newyorkstateexhi/i,
  'photoplay': /photoplay|^photo|^pho/i,
  'publix opinion': /publix/i,
  'radio tv mirror': /radiotvmirror|radiotvmi|radiotv|radiom/i,
  'reel life': /reellife/i,
  'the screen writer': /screenwriter/i,
  'shadowland': /shadowland/i,
  'showmens trade review': /showmen/i,
  'silver screen': /silverscreen/i,
  'screen and radio weekly': /screen-and-radio/i,
  'screenland': /screenland/i,
  'sponsor': /sponsor/i,
  'talking screen': /talkingscreen/i,
  'technicolor news and views': /technewsviews/i,
  'variety': /variety/i,
  'wids': /wids/i,
  'world film and television progress': /worldfilm/i,
  'the writers monthly': /writersmonthly/i,

  '20th century fox dynamo': /dynamo/i,
  'paramount press book': /paramountpress|artcraftpress|paramountartcraf|paramountpressbo/i,
  'universal weekly': /universalweekly|universal/i,
  'mgm studio news': /mgmstudionews/i,
  'whos who at metro-goldwyn-mayer': /whoswhoatmetrogo/i,
  'mensajero paramount': /mensajeroparamou/i,
  'paramount around the world': /paramountinterna/,
  'fox folks': /foxfolks/i,

  'pressbooks': /pressbook/i, // will match any pressbook, useful for boosting or downranking all at once

  'MPPC lawsuit': /indistrictcourto/i,

  'british kinematograph': /britishk/i,
  'canadian film weekly': /canadianfilmweekly/i,
  'der kinematograph': /kinematograph/i,
  'whats new': /whats-new/i,
  'neue filmwelt': /neue-filmwelt/i,
  'weekly kinema guide': /^weeklyki/i, 
};