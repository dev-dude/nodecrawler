var wwwDirectory = '/ubuntu/home/server/www/',
    logDirectory = '/ubuntu/home/logs',
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
        if (!fs.existsSync(wwwDirectory + keyword)){
            fs.mkdirSync(dir);
            child = exec(hexoLocation + 'hexo init ' + keyword + ' | tee '+logDirectory+'/website-output.txt');

            try {
                process.chdir(wwwDirectory + keyword);
                child = exec('npm install | tee ' + logDirectory + '/website-output.txt');
                child = exec(hexoLocation + 'hexo new [layout] ' + keyword + ' | tee ' + logDirectory + '/website-output.txt');
                child = exec(hexoLocation + 'hexo publish [layout]' +sampleOutPutFile+ ' | tee ' + logDirectory + '/website-output.txt');
                child = regularExec(hexoLocation + 'hexo server');
            }
            catch (err) {
                console.log('chdir: ' + err);
            }
        }
    }
    catch (err) {
        console.log('chdir: ' + err);
    }
};

buildSiteCore();