'use strict';

/**
 * Dependencies
 */
var pathToRegexp = require('path-to-regexp');
var Request      = require('./request');
var Response     = require('./response');
var Route        = require('./route');


/**
 * Expose public API
 */
module.exports = mock;
mock.get       = defineRoute.bind(null, 'GET');
mock.post      = defineRoute.bind(null, 'POST');
/**
 * List of registred callbacks
 */
var callbacks = [];

/**
 * Mock
 */
function mock(superagent) {
  var SuperRequest = superagent.Request;
  var oldGet = superagent.get;
  var oldEnd = SuperRequest.prototype.end;
  var match;
  superagent.get = function (url, data, fn) {
    match = dispatch('GET', url);
    return match
      ? superagent('GET', url, data, fn)
      : oldGet.call(this, url, data, fn);
  };
  superagent.post = function (url, data, fn) {
    match = dispatch('POST', url, data);
    return match
      ? superagent('POST', url, data, fn)
      : oldGet.call(this, url, data, fn);
  };
  SuperRequest.prototype.end = function(cb) {
    cb(null, match && match());
  };
  return mock; // chaining
}

function dispatch(method, url, data) {
  var match;
  var i = callbacks.length;
  callbacks.forEach(function(callback) {
    var m = callbacks[i-1].match(method, url, data);
    if (m) match = m;
  });
  return match;
}

/**
 * Register url and callback for `get`
 */
function defineRoute(method, url, callback) {
  callbacks.push(new Route({
    url: url,
    callback: callback,
    method: method
  }));
  return mock;
}
