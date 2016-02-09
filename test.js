var test = require('tape');
var findCalls = require('./');

test('no calls', function(t) {
  var calls = findCalls('name', '"nope"');
  t.deepEqual(calls, []);
  t.end();
});

test('require', function(t) {
  var source = 'require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'require(\'name\');' }
  ]);
  t.end();
});

test('node', function(t) {
  var source = 'require(\'name\');';
  var calls = findCalls('name', source);
  t.ok('object' == typeof calls[0].node);
  t.end();
});

test('declaration require', function(t) {
  var source = 'var name = require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' }
  ]);
  t.end();
});

test('multi declaration require', function(t) {
  var source = 'var x = y,\nname = require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' }
  ]);
  t.end();
});

test('assign require', function(t) {
  var source = 'name = require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'name = require(\'name\');' }
  ]);
  t.end();
});

test('multi assignment require', function(t) {
  var source = 'x = y,\nname = require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'name = require(\'name\');' }
  ]);
  t.end();
});

test('require member declaration', function(t) {
  var source = 'var foo = require(\'name\').foo; foo(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var foo = require(\'name\').foo;' },
    { code: 'foo(arg);' }
  ]);
  t.end();
});

test('require member assignment', function(t) {
  var source = 'foo = require(\'name\').foo; foo(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'foo = require(\'name\').foo;' },
    { code: 'foo(arg);' }
  ]);
  t.end();
});

test('function call', function(t) {
  var source = 'var name = require(\'name\'); name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'name(arg);' }
  ]);
  t.end();
});

test('require call', function(t) {
  var source = 'require(\'name\')(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'require(\'name\')(arg);' }
  ]);
  t.end();
});

test('declaration', function(t) {
  var source = 'var name = require(\'name\'); var ret = name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'var ret = name(arg);' }
  ]);
  t.end();
});

test('multi declaration', function(t) {
  var source = 'var name = require(\'name\'); var foo = bar, ret = name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'var ret = name(arg);' }
  ]);
  t.end();
});

test('assignment', function(t) {
  var source = 'var name = require(\'name\'); ret = name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'ret = name(arg);' }
  ]);
  t.end();
});

test('multi assignment', function(t) {
  var source = 'var name = require(\'name\'); foo = bar, ret = name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'ret = name(arg);' }
  ]);
  t.end();
});

test('require call declaration', function(t) {
  var source = 'var name = require(\'name\')(arg); name(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\')(arg);' },
    { code: 'name(arg);' }
  ]);
  t.end();
});

test('aliased', function(t) {
  var source = 'var alias = require(\'name\'); alias(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var alias = require(\'name\');' },
    { code: 'alias(arg);' }
  ]);
  t.end();
});

test('callback in function call', function(t) {
  var source = 'var name = require(\'name\'); name(function(arg){\n"bar"\n});';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'name(function (arg) {\n    \'callback...\';\n});' }
  ]);
  t.end();
});

test('callback in require call', function(t) {
  var source = 'require(\'name\')(function(arg){\n"bar"\n});';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'require(\'name\')(function (arg) {\n    \'callback...\';\n});' }
  ]);
  t.end();
});

test('member call', function(t) {
  var source = 'var name = require(\'name\'); name.member(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' },
    { code: 'name.member(arg);' }
  ]);
  t.end();
});

test('toString member error', function(t) {
  var source = 'var name = require(\'name\'); toString.call(arg);';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' }
  ]);
  t.end();
});

test('unix shebang', function(t) {
  var source = '#!/usr/bin/env node\nvar name = require(\'name\');';
  var calls = findCalls('name', source);
  t.deepEqual(calls, [
    { code: 'var name = require(\'name\');' }
  ]);
  t.end();
});
