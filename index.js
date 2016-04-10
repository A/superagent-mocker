'use strict';

/**
 * Dependencies
 */
var pathtoRegexp = require('path-to-regexp');

/**
 * Expose public API
 */
module.exports = mock;
mock.get       = defineRoute.bind(null, 'GET');
mock.post      = defineRoute.bind(null, 'POST');
mock.put       = defineRoute.bind(null, 'PUT');
mock.del       = defineRoute.bind(null, 'DELETE');
mock.patch     = defineRoute.bind(null, 'PATCH');

/**
 * Request timeout
 * @type {number|function}
 */
mock.timeout    = 0;

/**
 * List of registred routes
 */
var routes = [];

/**
 * Original superagent methods
 * @type {{}}
 */
var originalMethods = {};

/**
 * Unregister all routes
 */
mock.clearRoutes = function() {
  routes.splice(0, routes.length)
};

/**
 * Map api method to http method
 */
var methodsMapping = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  del: 'DELETE',
  patch: 'PATCH'
};

/**
 * Unregister specific route
 */
mock.clearRoute = function(method, url) {
  method = methodsMapping[method] || method;
  routes = routes.filter(function(route) {
    return !(route.url === url && route.method === method);
  });
};

/**
 * Mock
 */
function mock(superagent) {

  // don't patch if superagent was patched already
  if (superagent._patchedBySuperagentMocker) return mock;
  superagent._patchedBySuperagentMocker = true;

  // The room for matched route
  var state = {
    current: null,
    reqest: {
      body: {},
      headers: {}
    }
  };

  // patch api methods (http)
  for (var method in methodsMapping) {
    if (methodsMapping.hasOwnProperty(method)) {
      var httpMethod = methodsMapping[method];
      patch(superagent, method, httpMethod, state);
    }
  }

  var reqProto = superagent.Request.prototype;

  // Patch Request.end()
  var oldEnd = originalMethods.end = superagent.Request.prototype.end;
  reqProto.end = function(cb) {
    var current = state.current;
    if (current) {
      setTimeout(function(request) {
        try {
          var response = current(request);
          if (response.status !== 200) {
            cb && cb(response, null);
          } else {
            cb && cb(null, response);
          }
        } catch (ex) {
          cb && cb(ex, null);
        }
      }, value(mock.timeout), state.request);
    } else {
      oldEnd.call(this, cb);
    }
  };

  // Patch Request.set()
  var oldSet = originalMethods.set = reqProto.set;
  reqProto.set = function(key, val) {
    if (!state.current) {
      return oldSet.call(this, key, val);
    }
    // Recursively set keys if passed an object
    if (isObject(key)) {
      for (var field in key) {
        this.set(field, key[field]);
      }
      return this;
    }
    if (typeof key !== 'string') {
      throw new TypeError('Header keys must be strings.');
    }
    state.request.headers[key.toLowerCase()] = val;
    return this;
  };

  // Patch Request.send()
  var oldSend = originalMethods.send = reqProto.send;
  reqProto.send = function(data) {
    if (!state.current) {
      return oldSend.call(this, data);
    }
    state.request.body = mergeObjects(state.current.body, data);
    return this;
  };

  return mock; // chaining

}

mock.unmock = function(superagent) {
  ['get', 'post', 'put', 'patch', 'del'].forEach(function(method) {
    superagent[method] = originalMethods[method];
  });

  var reqProto = superagent.Request.prototype;

  ['end', 'set', 'send'].forEach(function(method) {
    reqProto[method] = originalMethods[method];
  });

  delete superagent._patchedBySuperagentMocker;
};

/**
 * find route that matched with url and method
 * TODO: Remove data
 */
function match(method, url, data) {
  return routes.reduce(function(memo, cb) {
    var m = cb.match(method, url, data);
    return m ? m : memo;
  }, null);
}

/**
 * Register url and callback for `get`
 */
function defineRoute(method, url, handler) {
  routes.push(new Route({
    url: url,
    handler: handler,
    method: method
  }));
  return mock;
}

/**
 * Patch superagent method
 */
function patch(superagent, prop, method, state) {
  var old = originalMethods[prop] = superagent[prop];
  superagent[prop] = function (url, data, fn) {
    state.current = match(method, url, data);
    state.request = {
      headers: {},
      body: {}
    };
    return old.call(this, url, data, fn);
  };
}

/**
 * Route with given url
 */
var Route = function Route(state) {
  this.url     = state.url;
  this.handler = state.handler;
  this.method  = state.method;
  this.regexp  = pathtoRegexp(this.url, this.keys = []);
};

/**
 * Match route with given url
 */
Route.prototype.match = function(method, url, body) {
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
  return function(req) {
    var handlerValue = route.handler({
      url: url,
      params: params || {},
      body: mergeObjects(body, req.body),
      headers: req.headers
    });
    return mergeObjects({
      status: 200
    }, handlerValue);
  };
};


/**
 * Helpers
 */

/**
 * Simple object test
 * @param any obj Variable to test
 * @return bool True if variable is an object
 */
function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

/**
 * Exec function and return value, or just return arg
 * @param {fn|any} val Value or fn to exec
 */
function value(val) {
  return 'function' === typeof val
    ? val()
    : val;
}

/**
 * Object.assign replacement
 * This will always create a new object which has all of the own
 * properties of all objects passed.  It will ignore non-objects without error.
 * @param ...obj object variable number of objects to merge
 */
function mergeObjects() {
  var out = {},
      p;

  for(var index = 0; index < arguments.length; index++) {
    var arg = arguments[index]
    if(isObject(arg)) {
      for(var prop in arg) {
        if(arg.hasOwnProperty(prop)) {
          out[prop] = arg[prop];
        }
      }
    }
  }

  return out;
}
