
/**
 * Module dependencies.
 */

var astw = require('astw');
var codegen = require('escodegen').generate;
var debug = require('debug')('module-calls');

/**
 * Expose `find`.
 */

module.exports = find;

/**
 * Find all places module `name` is used in `code`.
 *
 * @param {String} name
 * @param {String} code
 * @return {Array}
 */

function find(name, code) {
  var calls = [];
  var names = {};
  var walk = astw(code);
  
  walk(function(node) {
    if (isRequire(node) && name == node.arguments[0].value) {
      if ('VariableDeclarator' == node.parent.type) {
        // var name = require('name');
        names[node.parent.id.name] = true;
        var code = 'var ' + codegen(node.parent) + ';';
        debug('declaration require: %s', code);
        calls.push({ code: code });
      } else if ('AssignmentExpression' == node.parent.type) {
        // name = require('name');
        names[node.parent.left.name] = true;
        var code = codegen(node.parent) + ';';
        debug('assignemt require: %s', code);
        calls.push({ code: code });
      } else if ('CallExpression' == node.parent.type) {
        if (node.parent.parent
          && 'VariableDeclarator' == node.parent.parent.type
        ) {
          // var name = require('name')(arg);
          names[node.parent.parent.id.name] = true;
          node.parent.arguments = shortenCallbacks(node.parent.arguments);
          var code = 'var ' + codegen(node.parent.parent) + ';';
          debug('require call declaration: %s', code);
          calls.push({ code: code });
        } else if (node.parent.parent
          && 'AssignmentExpression' == node.parent.parent.type) {
            // name = require('name')(arg);
            names[node.parent.parent.left.name] = true;
            node.parent.arguments = shortenCallbacks(node.parent.arguments);
            var code = codegen(node.parent.parent) + ';';
            debug('require call assignment: %s', code);
            calls.push({ code: code });
        } else {
          // require('name')(arg);
          node.parent.arguments = shortenCallbacks(node.parent.arguments);
          var code = codegen(node.parent.parent);
          debug('require call: %s', code);
          calls.push({ code: code });
        }
      } else {
        // require('name');
        var code = codegen(node.parent);
        debug('require: %s', code);
        calls.push({ code: code });
      }
    } else if ('CallExpression' == node.type && names[node.callee.name]) {
      node.arguments = shortenCallbacks(node.arguments);
      
      if ('VariableDeclarator' == node.parent.type) {
        // var ret = name(arg);
        var code = 'var ' + codegen(node.parent) + ';';
        debug('declaration: %s', code);
        calls.push({ code: code });
      } else if ('AssignmentExpression' == node.parent.type) {
        // ret = name(arg);
        var code = codegen(node.parent) + ';';
        debug('assignment: %s', code);
        calls.push({ code: code });
      } else {
        // name(arg)
        var code = codegen(node.parent);
        debug('call: %s', code);
        calls.push({ code: code });
      }
    }
  });
  
  return calls;
}

/**
 * Shorten callbacks from
 *
 *   function(arg) {
 *       some();
 *       code();
 *   }
 *
 * to
 *
 *   function(arg) {
 *       "callback...";
 *   }
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

function shortenCallbacks(args) {
  return args.map(function(arg) {
    if ('FunctionExpression' == arg.type) {
      arg.body = {
        type: 'BlockStatement',
        body: [{
          type: 'ExpressionStatement',
          expression: {
            type: 'Literal', value: 'callback...'
          }
        }]
      };
      return arg;
    } else {
      return arg;
    }
  });
}

/**
 * Check if `node` is a `require` call.
 *
 * @param {Node} node
 * @return {Boolean}
 * @api private
 */

function isRequire(node) {
  return 'CallExpression' == node.type && 'require' == node.callee.name;
}
