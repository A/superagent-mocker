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
mock.get       = get;
// mock.post      = post;
// mock.put       = put;
// mock.del       = del;

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
    var req;
    if (match) {
      req = superagent('GET', url, data, fn);
    } else {
      req = oldGet.call(this, url, data, fn);
    }
    return req;
  };

  SuperRequest.prototype.end = function(cb) {
    cb(null, match && match());
  };

  return mock;

}

function dispatch(method, url) {
  var match;
  var i = callbacks.length;
  callbacks.forEach(function(callback) {
    var m = callbacks[i-1].match('GET', url);
    if (m) match = m;
  });
  return match;
}

/**
 * Register url and callback for `get`
 */
function get(url, cb) {
  callbacks.push(new Route({
    url: url,
    callback: cb,
    method: 'GET'
  }));
  return mock;
}


/**
 * List of registred callbacks
 */
var callbacks = [];
