var fs = require('fs');
var findCalls = require('./');

var source = fs.readFileSync(__dirname + '/index.js', 'utf8');

console.log('Usage of `astw`:');
console.log(findCalls('astw', source));
console.log();

console.log('Usage of `escodegen`:');
console.log(findCalls('escodegen', source));
console.log();

console.log('Usage of `debug`:');
console.log(findCalls('debug', source));
