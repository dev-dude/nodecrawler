var wwwDirectory = '/home/ubuntu/server/www/',
    logDirectory = '/home/ubuntu/logs',
    process = require('process'),
    exec = require('child_process').execSync,
    regularExec = require('child_process').exec,
    fs = require('fs'),
    child,
    sampleOutPutFile = '/home/ubuntu/char-rnn/sample-output.txt',
    hexoLocation = '/usr/local/lib/node_modules/hexo-cli/bin/',
    keyword = 'free antivirus'.replace(/ /g, '-');

var buildSiteCore = function() {
    try {
        process.chdir(wwwDirectory);
        console.log('Switch to New directory: ' + process.cwd());
        child = exec(hexoLocation + 'hexo init ' + keyword + ' | tee '+logDirectory+'/website-output.txt');

        process.chdir(wwwDirectory + keyword);
        child = exec('npm install | tee ' + logDirectory + '/website-output.txt');
        child = exec(hexoLocation + 'hexo new Page ' + keyword + ' | tee ' + logDirectory + '/website-output.txt');
        mvCommand = 'mv /home/ubuntu/char-rnn/sample-output.txt '+wwwDirectory + keyword+'/_pages/'+ keyword+'.md';
        console.log(mvCommand);
        child = exec(mvCommand);
        console.log('start server');
        child = regularExec(hexoLocation + 'hexo server');
    }
    catch (err) {
        console.log('chdir: ' + err);
    }
};

buildSiteCore();