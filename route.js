'use strict';

/**
 * Dependencies
 */
var pathtoRegexp = require('path-to-regexp');

/**
 * Route with given url
 */
var Route = module.exports = function Route(state) {
  this.url    = state.url;
  this.fn     = state.callback;
  this.method = state.method;
  this.regexp = pathtoRegexp(this.url, this.keys = []);
};

/**
 * Match route with given url
 */
Route.prototype.match = function(method, url) {
  if (this.method !== method) return false;
  var params = {};
  var m = this.regexp.exec(url);
  if (!m) return false;
  for (var i = 1, len = m.length; i < len; ++i) {
    var key = this.keys[i - 1];
    var val = m[i];
    if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
      params[key.name] = val;
    }
  }
  var route = this;
  return function() {
    return route.fn({
      url: url,
      params: params
    });
  };
};
