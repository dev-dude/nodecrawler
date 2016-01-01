var wwwDirectory = '/home/ubuntu/server/www/',
    logDirectory = '/home/ubuntu/logs',
    process = require('process'),
    exec = require('child_process').execSync,
    regularExec = require('child_process').exec,
    fs = require('fs'),
    child,
    sampleOutPutFile = '/home/ubuntu/char-rnn/sample-output.txt',
    hexoLocation = '/usr/local/lib/node_modules/hexo-cli/bin/',
    test = (process.argv[3]) ? true : false;

var builder = function(keyword) {
    keyword = keyword.replace(/ /g, '-');
    try {
        var mvCommand,
            newPageCommand,
            serverCommand,
            loadContentCommand,
            initHexoCommand;

        process.chdir(wwwDirectory);
        console.log('Switch to New directory: ' + process.cwd());
        initHexoCommand = hexoLocation + 'hexo init ' + keyword + ' | tee '+logDirectory+'/website-output.txt';
        console.log(initHexoCommand);
        child = exec(initHexoCommand);
        process.chdir(wwwDirectory + keyword);
        loadContentCommand = 'npm install | tee ' + logDirectory + '/website-output.txt';
        console.log(loadContentCommand);
        child = exec(loadContentCommand);
        newPageCommand = hexoLocation + 'hexo new post ' + keyword + ' | tee ' + logDirectory + '/website-output.txt';
        console.log(newPageCommand);
        child = exec(newPageCommand);
        // 2nd keyword is page name
        mvCommand = 'cp /home/ubuntu/char-rnn/sample-output.txt '+wwwDirectory + keyword+'/source/'+ keyword+'/index.md';
        console.log(mvCommand);
        child = exec(mvCommand);
        console.log('start server');
        serverCommand = hexoLocation + 'hexo server';
        console.log(serverCommand);
        child = regularExec(serverCommand);
    }
    catch (err) {
        console.log('chdir: ' + err);
    }
};

if (test) {
    builder();
} else {
    module.exports = builder;
}

