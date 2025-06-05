// config/profiles/base-patterns.js
module.exports = {
  // Core patterns used by all profiles
  // regex cheatsheet
  // (?=foo)   // Positive lookahead: MUST be followed by 'foo'
  // (?!foo)   // Negative lookahead: must NOT be followed by 'foo'
  // (?<=foo)  // Positive lookbehind: MUST be preceded by 'foo'
  // (?<!foo)  // Negative lookbehind: must NOT be preceded by 'foo'

  'motion picture reviews': /motionpicturerev/i, // women's film reviews!
  'the motion picture and the family': /motionpicturefam/i, // try this source for 'wholesome' movies
  'motion picture daily': /motionpicturedai/i,
  'motion picture herald': /motionpictureher/i,
  'motion picture magazine': /motionpicturemag/i,
  'motion picture story magazine': /motionpicturesto|motionpicture(?!rev|fam|dai|her|mag|new)/i,
  'motion picture news': /motionpicturenew|motionnew|motionpic(?!ture)|motionp(?!ic|icture)/i,
  
  'moving picture weekly': /movingpicturewee/i,
  'moving picture world': /movingpicture|movpict|mopicwor|mowor|moviwor|moviewor|moving|movpicwor|morewor|movingpicwor|movwor/i,

  'the movies and the people who make them': /moviespeoplewhom/i,
  'movie classic': /movieclassic/i,
  'movieland': /movielandtv/i,

  'picture play': /pictureplay/i,
  'pictures and the picturegoer': /\bpicture/i,

  'exhibitors daily review': /exhibitorsdailyr/i,
  'exhibitors herald': /exhibher|exhibitorsh/i,
  'the exhibitor': /\bexhibitor|motionpictureexh/i,
  'independent exhibitors film bulletin': /independentexhibitorsfilm|filmbulletin|\bindepe/i,
  'the philadelphia exhibitor': /philadelphiaexhi/i,
  'exhibitors trade review': /exhibitorstrade|exhibitorstra|exhibitorst(?!rade)|\bexhibitors(?!daily|herald)|\bexhi(?!bitor|bher)|\bexh(?!ibitor|iber|i)/i,

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

  'american cinematographer': /americancinemato|american|amento/i,
  'national box office digest': /boxofficedigest/i,
  'boxoffice': /boxoffice(?!digest)/i,  // NOT followed by 'digest'
  'cinemundial': /cinemundial/i,
  'camera': /camera/i,
  'close up': /closeup/i,
  'the new york clipper': /clipper/i,
  'harrisons reports': /harrison/i,
  'illustrated films monthly': /illustra/i,
  'modern screen': /modernscreen/i,
  'motography': /motography/i,
  'movie mirror': /moviemirror/i,
  'photoplay': /photoplay|photo|pho/i,
  'radio tv mirror': /radiotvmirror/i,
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


};