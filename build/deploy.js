const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');

let source = path.join('.', 'node_modules');
let dest = path.join('.', 'deploy', 'node_modules');

fs.mkdirSync(path.join('.', 'deploy'));

const options = {};

ncp(source, dest, options, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('node_modules copied');
});

source = path.join('.', 'index.js');
dest = path.join('.', 'deploy');

ncp(source, dest, options, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log('index.js copied');
});
