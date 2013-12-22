var fs = require('fs');
var calls = require('./');

var source = fs.readFileSync(__dirname + '/index.js', 'utf8');

console.log('Usage of `astw`:');
console.log(calls('astw', source));
console.log();

console.log('Usage of `escodegen`:');
console.log(calls('escodegen', source));
console.log();

console.log('Usage of `debug`:');
console.log(calls('debug', source));
