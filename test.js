var Crawler = require("crawler"),
    url = require('url'),
    cheerio = require('cheerio'),
    google = require("./google.js"),
    process = require('process'),
    fsExtra = require('fs-extra'),
    path = require('path'),
    stats = require('stats'),
    _ = require('underscore'),
    exec = require('child_process').execSync,
    fs = require('fs'),
    wstream = fs.createWriteStream("input.txt"),
    self = this,
    keyWord = '',
    newestFile = '',
    queueCount = 0,
    urlList = [],
    child,
    nextCounter = 0;
$ = cheerio.load('');

// ****** CONFIG ******
var googlePages = 1,
    rnnSize = 128,
    layers = 1,
    temperature = 0.5,
    length = 10000,
    crawlerDirectory = '/home/ubuntu/server/nodecrawler/',
    rnnDirectory = '/home/ubuntu/char-rnn/',
    test = false;
google.resultsPerPage = 5;

test = process.argv[3].toLowerCase() || false;

// If test don't rest the file and clear the directory
if (!test) {
    // reset the file
    fs.truncate('input.txt', 0, function () {
        console.log('Cleared input.txt')
    });

    // empty training directory
    fsExtra.emptyDir('/home/ubuntu/char-rnn/cv', function (err) {
        if (!err) console.log('Successfully Emptied Cv directory!')
    });
}

var checkNumbersInString = function(string) {
    var length = string.replace(/[^0-9]/g, "").length;
    return (length < 30);
};

function getNewestFile(dir) {
    var files = fs.readdirSync(dir);
    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    });
}

var ruleSet = function(key,pS) {
    var text = $(pS[key]).text();
    var lowerCaseText = text.toLowerCase();
    if (text.length > 200 &&
     text.indexOf('»') === -1 &&
     lowerCaseText.indexOf('privacy policy') === -1 &&
     lowerCaseText.indexOf('terms of use') === -1 &&
     lowerCaseText.indexOf('gallery') === -1 &&
     lowerCaseText.indexOf('©') === -1 &&
     lowerCaseText.indexOf('jquery') === -1 &&
     lowerCaseText.indexOf('var ') === -1 &&
     checkNumbersInString(lowerCaseText)) {
        return true;
    } else {
        return false;
    }
};

var resultFormatter = function(string) {
    // remove spaces
    var newString = string.replace(/\s\s+/g, ' ');

    // strip html
    newString = newString.replace(/<(?:.|\n)*?>/gm, '');

    // strip comments 
    newString = newString.replace(/<!--[\s\S]*?-->/g, '');

    // remove urls 
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    newString = newString.replace(urlRegex, function(url) {
        return '';
    });

    // remove special characters
    newString = newString.replace(/[^A-Za-z0-9;.,'?() ]/g, '');

    if (newString.length > 200) {
        newString = '    ' + newString + ' \n\n';
    }

    return newString;
};

var sampleData = function() {
  child = exec('th sample.lua cv/'+newestFile+' -gpuid -0 -temperature '+temperature+' -length '+length,
      function (error, stdout, stderr) {
      //console.log(error);
      //console.log(stdout);
      //console.log(stderr);
      var finalOutput = fs.createWriteStream(crawlerDirectory+'output.txt');
      finalOutput.write(stdout);
      console.log('Finished Sampling saved to output.txt');
  });         
};

var launchTrainer = function() {
    console.log('Starting directory: ' + process.cwd());
    try {
        process.chdir(rnnDirectory);
        console.log('Switch to New directory: ' + process.cwd());

        console.log ('Starting RNN');

        child = exec('th train.lua -data_dir '+crawlerDirectory+'  -rnn_size '+rnnSize+' -num_layers '+layers+' -dropout 0.5 -gpuid -0 | tee ./output.txt');
        newestFile = getNewestFile(rnnDirectory+'cv');
        console.log(newestFile);
        sampleData();
    }
    catch (err) {
        console.log('chdir: ' + err);
    }
};

var c = new Crawler({
    maxConnections : 10,
    timeout: 10000,
    retries:1,
    retryTimeout: 5000,
    useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
    // This will be called for each crawled page
    callback : function (error, result, $) {
        //console.log(result.options.uri);
        //console.log(error);
        console.log("Crawling:");
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
        if (result && $) {
	      console.log(result.options.uri + " SUCCESS");
            var pS = $('body').find('p'),
                prevPs = '';
            pS.each(function(key,callback) {

                //console.log($(pS[key]).text());
                // remove last sentence because sometimes copyright stuff
                if (key < pS.length - 4) {
                    if (ruleSet(key,pS)) {
                        wstream.write(resultFormatter($(pS[key]).text()));
                    }
                }
            });
        }
    },
    onDrain: function(){
        wstream.end();
        launchTrainer();
    }
});

keyWord = process.argv[2].toLowerCase();

/***** ENTRY POINT *****/
if (!test) {
    google(keyWord, function (err, next, links) {
        if (err) console.error(err);

        for (var i = 0; i < links.length; ++i) {
            console.log(links[i].link);
            if (links[i].link) {
                urlList.push(links[i].link);
            }
        }

        if (nextCounter < googlePages) {
            nextCounter += 1;
            if (next) {
                next()
            }
        } else {
            console.log('******** START CRAWL *******');
            console.log(urlList);
            c.queue(urlList);
        }
    });
} else {
    // Test options
    newestFile = getNewestFile(rnnDirectory+'cv');
    console.log(newestFile);
    sampleData();
}
