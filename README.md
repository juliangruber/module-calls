
# module-calls

Find all places a node module is used in a string of code.

## Example

Print usage info for the node modules this modules depends upon:

```js
var fs = require('fs');
var calls = require('module-calls');

var source = fs.readFileSync(__dirname + '/index.js', 'utf8');

console.log('Usage of `astw`:');
console.log(calls('astw', source));
console.log();

console.log('Usage of `escodegen`:');
console.log(calls('escodegen', source));
console.log();

console.log('Usage of `debug`:');
console.log(calls('debug', source));
```

The output is:

```bash
$ node example.js
Usage of `astw`:
[ { code: 'var astw = require(\'astw\');' },
  { code: 'var walk = astw(code);' } ]

Usage of `escodegen`:
[ { code: 'var codegen = require(\'escodegen\').generate;' },
  { code: '\'var \' + codegen(node.parent)' },
  { code: '\'var \' + codegen(node.parent.parent)' },
  { code: 'codegen(node.parent.parent) + \';\'' },
  { code: 'codegen(node.parent) + \';\'' },
  { code: '\'var \' + codegen(node.parent.parent)' },
  { code: 'codegen(node.parent.parent) + \';\'' },
  { code: 'var code = codegen(node.parent.parent);' },
  { code: 'var code = codegen(node.parent);' },
  { code: '\'var \' + codegen(node.parent)' },
  { code: 'codegen(node.parent) + \';\'' },
  { code: 'var code = codegen(node.parent);' } ]

Usage of `debug`:
[ { code: 'var debug = require(\'debug\')(\'module-calls\');' },
  { code: 'debug(\'declaration require: %s\', code);' },
  { code: 'debug(\'require member declaration: %s\', code);' },
  { code: 'debug(\'require member assignment: %s\', code);' },
  { code: 'debug(\'assignemt require: %s\', code);' },
  { code: 'debug(\'require call declaration: %s\', code);' },
  { code: 'debug(\'require call assignment: %s\', code);' },
  { code: 'debug(\'require call: %s\', code);' },
  { code: 'debug(\'require: %s\', code);' },
  { code: 'debug(\'declaration: %s\', code);' },
  { code: 'debug(\'assignment: %s\', code);' },
  { code: 'debug(\'call: %s\', code);' } ]
```

This still needs improvement, e.g. here calls to `walk` should be tracked too.

## API

### calls(name, source)

Find all places module `name` is used in `source`.

## Installation

```bash
$ npm install module-calls
```

## License

  MIT
  