var Crawler = require("crawler");
var url = require('url');
var cheerio = require('cheerio');
var google = require("./google.js");
var fs = require('fs');
var wstream = fs.createWriteStream("train.txt");
var self = this;
google.resultsPerPage = 10;
var nextCounter = 0;
$ = cheerio.load('');
var keyWord = '';
var queueCount = 0;
var urlList = [];
//reset the file
fs.truncate('train.txt', 0, function(){console.log('done')});

var checkNumbersInString = function(string) {
    var length = string.replace(/[^0-9]/g, "").length;
    return (length < 30);
};

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
     lowerCaseText.indexOf('var') === -1 &&
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
    newString = newString.replace(/[^\w\s]/gi, '');


    if (newString.length > 200) {
        newString = '    ' + newString + ' \n\n';
    }

    return newString;
};


var c = new Crawler({
    maxConnections : 1,
    useragent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
    // This will be called for each crawled page
    callback : function (error, result, $) {
        console.log(result.options.uri);
        //console.log(error);
        //console.log(result);
        // $ is Cheerio by default
        //a lean implementation of core jQuery designed specifically for the server
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
    },
    onDrain: function(){
        wstream.end();
    }
});

// Queue just one URL, with default callback
//c.queue('http://www.pcmag.com/article2/0,2817,2388652,00.asp');
//c.queue('http://www.tomsguide.com/us/best-antivirus,review-2588-5.html');
//c.queue('http://www.amazon.com/Avast-Free-Antivirus-2015-Download/product-reviews/B00H9A60O4');
//c.queue('http://www.alphr.com/security/6745/best-free-antivirus-of-2015-the-best-free-internet-security-software');

keyWord = process.argv[2].toLowerCase();
google(keyWord, function (err, next, links){
  if (err) console.error(err);

  for (var i = 0; i < links.length; ++i) {  
      console.log(links[i].link);
      if (links[i].link) {
        urlList.push(links[i].link);
      }
  }

  if (nextCounter < 4) {
    nextCounter += 1;
    if (next) {
        next()
    } else {
        console.log('done');
    }

  }
});