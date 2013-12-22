
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
  
  function hasName(n) {
    return names.hasOwnProperty(n);
  }
  
  function push(code, node) {
    var call = { code: code };
    Object.defineProperty(call, 'node', {
      value: node,
      enumerable: false
    });
    calls.push(call);
  }
  
  walk(function(node) {
    if (isRequire(node) && name == node.arguments[0].value) {
      if ('VariableDeclarator' == node.parent.type) {
        // var name = require('name');
        names[node.parent.id.name] = true;
        var code = 'var ' + codegen(node.parent) + ';';
        debug('declaration require: %s', code);
        push(code, node);
      } else if ('MemberExpression' == node.parent.type) {
        if (node.parent.parent
          && 'VariableDeclarator' == node.parent.parent.type
        ) {
          // var member = require('name').member;
          names[node.parent.parent.id.name] = true;
          var code = 'var ' + codegen(node.parent.parent) + ';';
          debug('require member declaration: %s', code);
          push(code, node);
        } else if (node.parent.parent
          && 'AssignmentExpression' == node.parent.parent.type
        ) {
          // member = require('name').member;
          names[node.parent.parent.left.name] = true;
          var code = codegen(node.parent.parent) + ';';
          debug('require member assignment: %s', code);
          push(code, node);
        }
      } else if ('AssignmentExpression' == node.parent.type) {
        // name = require('name');
        names[node.parent.left.name] = true;
        var code = codegen(node.parent) + ';';
        debug('assignemt require: %s', code);
        push(code, node);
      } else if ('CallExpression' == node.parent.type) {
        if (node.parent.parent
          && 'VariableDeclarator' == node.parent.parent.type
        ) {
          // var name = require('name')(arg);
          names[node.parent.parent.id.name] = true;
          node.parent.arguments = shortenCallbacks(node.parent.arguments);
          var code = 'var ' + codegen(node.parent.parent) + ';';
          debug('require call declaration: %s', code);
          push(code, node);
        } else if (node.parent.parent
          && 'AssignmentExpression' == node.parent.parent.type) {
            // name = require('name')(arg);
            names[node.parent.parent.left.name] = true;
            node.parent.arguments = shortenCallbacks(node.parent.arguments);
            var code = codegen(node.parent.parent) + ';';
            debug('require call assignment: %s', code);
            push(code, node);
        } else {
          // require('name')(arg);
          node.parent.arguments = shortenCallbacks(node.parent.arguments);
          var code = codegen(node.parent.parent);
          debug('require call: %s', code);
          push(code, node);
        }
      } else {
        // require('name');
        var code = codegen(node.parent);
        debug('require: %s', code);
        push(code, node);
      }
    } else if ('CallExpression' == node.type && hasName(node.callee.name)) {
      node.arguments = shortenCallbacks(node.arguments);
      
      if ('VariableDeclarator' == node.parent.type) {
        // var ret = name(arg);
        var code = 'var ' + codegen(node.parent) + ';';
        debug('declaration: %s', code);
        push(code, node);
      } else if ('AssignmentExpression' == node.parent.type) {
        // ret = name(arg);
        var code = codegen(node.parent) + ';';
        debug('assignment: %s', code);
        push(code, node);
      } else {
        // name(arg)
        var code = codegen(node.parent);
        debug('call: %s', code);
        push(code, node);
      }
    } else if ('MemberExpression' == node.type && hasName(node.object.name)) {
      // name.member(arg)
      node.parent.arguments = shortenCallbacks(node.parent.arguments);
      var code = codegen(node.parent.parent);
      debug('member call: %s', code);
      push(code, node);
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
