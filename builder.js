var wwwDirectory = '/home/ubuntu/server/www/',
    logDirectory = '/home/ubuntu/logs',
    process = require('process'),
    exec = require('child_process').execSync,
    regularExec = require('child_process').exec,
    fs = require('fs'),
    request = require('request'),
    http = require('http'),
    child,
    sampleOutPutFile = '/home/ubuntu/char-rnn/sample-output.txt',
    hexoLocation = '/usr/local/lib/node_modules/hexo-cli/bin/',
    cheerio = require('cheerio'),
    $ = cheerio.load(''),
    q = require('q'),
    lastRandom = 0,
    /*
    pos = require('pos'),
    chunker = require('pos-chunker'),
    tokenizer = require('node-tokenizer'),
    */
    dataFile,
    test = (process.argv[3]) ? true : false;

var getImages = function(keyword,path) {
    var defer = q.defer();
    var url = 'http://www.bing.com/images/search?q='+encodeURIComponent(keyword)+'&go=Submit&qs=ds&form=QBILPG';
    request.get({
    url: url
    }, function(err, resp, html){
        var randomNumber,
            link,
            file,
            request;
        $ = cheerio.load(html),
        imagesLength = $('.thumb').length;
        randomNumber = Math.floor(Math.random()*imagesLength);
        link = $($('.thumb')[randomNumber]).attr('href');
        file = fs.createWriteStream(keyword + '-' + randomNumber + '.jpg');
        request = http.get(link, function(response) {
          response.pipe(file);
          console.log('herefirst');
          return defer.resolve();
        });
    });
    return defer.promise;
};

var builder = function(keyword) {
    keyword = keyword.replace(/ /g, '-') || 'freantivirus';
    getImages(keyword).then(function(){
      console.log('here');
        try {
          var mvCommand,
             newPageCommand,
             serverCommand,
             loadContentCommand,
             initHexoCommand,
             removeHelloWorld;

           process.chdir(wwwDirectory);
           console.log('Switch to New directory: ' + process.cwd());
           initHexoCommand = hexoLocation + 'hexo init ' + keyword + ' | tee '+logDirectory+'/website-output.txt';
           console.log(initHexoCommand);
           child = exec(initHexoCommand);
           process.chdir(wwwDirectory + keyword);

           // Install Node Packages
           loadContentCommand = 'npm install | tee ' + logDirectory + '/website-output.txt';
           console.log(loadContentCommand);
           child = exec(loadContentCommand);

           // Create Post
           newPageCommand = hexoLocation + 'hexo new post ' + keyword + ' | tee ' + logDirectory + '/website-output.txt';
           console.log(newPageCommand);
           child = exec(newPageCommand);

           // Remove Hello World
           ///server/www/free-antivirus/source/_posts
           removeHelloWorld = 'rm ' + wwwDirectory + keyword+'/source/_posts/hello-world.md';
           console.log(removeHelloWorld);
           child = exec(removeHelloWorld);

           // 2nd keyword is page name
           mvCommand = 'cp /home/ubuntu/char-rnn/sample-output.txt '+wwwDirectory + keyword+'/source/_posts/'+ keyword+'.md';
           console.log(mvCommand);
           child = exec(mvCommand);

           // Start Server
           console.log('start server');
           serverCommand = hexoLocation + 'hexo server';
           console.log(serverCommand);
           child = regularExec(serverCommand);
        }
        catch (err) {
            console.log('chdir: ' + err);
        }
    });
};

//getProperNouns();
//module.exports = builder;
builder('free antivirus');

/*
var getProperNouns = function() {
    fs.readFile(sampleOutPutFile, 'utf8', function(err, data) {
        if (err) throw err;
        console.log('OK: ' + dataFile);
        dataFile = data;
        var words = new pos.Lexer().lex(dataFile);
        var tags = new pos.Tagger()
          .tag(words)

        console.log(tags)
        //var places = chunker.chunk(tags, '[{ tag: NNP }]');
        console.log(places);

        for (var i = 0; i < tags.length; i++) {
          if (tags[i][1] === 'NNP' || tags[i][1] === 'NNPS' || tags[i][1] === 'NN') {

          }
        }
        builder();
    });
}
*/

/*
var getProperNouns = function() {
    fs.readFile(sampleOutPutFile, 'utf8', function(err, data) {
        dataFile = data;
        tokenizer.debug = true;
        tokenizer.rule('newline', /^\n/);
        tokenizer.rule('whitespace', /^\s+/);
        tokenizer.rule('word', /^[^\s]+/);
        var tokens = tokenizer.tokenize(dataFile);
        console.log('Parsed ' + tokens.length + ' tokens');
    });

};
*/
