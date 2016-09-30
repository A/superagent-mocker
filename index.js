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

  // patch api methods (http)
  for (var method in methodsMapping) {
    if (methodsMapping.hasOwnProperty(method)) {
      var httpMethod = methodsMapping[method];
      patch(superagent, method, httpMethod);
    }
  }

  var reqProto = superagent.Request.prototype;

  // Patch Request.end()
  var oldEnd = originalMethods.end = superagent.Request.prototype.end;
  reqProto.end = function(cb) {
    var state = this._superagentMockerState;
    if (state && state.current) {
      var current = state.current;
      setTimeout(function(request) {
        try {
          var response = current(request);
          if (!/20[0-6]/.test(response.status)) {
            // superagent puts status and response on the error it returns,
            // which should be an actual instance of Error
            // See http://visionmedia.github.io/superagent/#error-handling
            var error = new Error(response.status);
            error.status = response.status;
            error.response = response;
            cb && cb(error, null);
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
    var state = this._superagentMockerState;
    if (!state || !state.current) {
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
    var state = this._superagentMockerState;
    if (!state || !state.current) {
      return oldSend.call(this, data);
    }
    if (isObject(data)) {
      state.request.body = mergeObjects(state.current.body, data);
    }
    else {
      state.request.body = data;
    }
    return this;
  };

  // Patch Request.query()
  var oldQuery = originalMethods.query = reqProto.query;
  reqProto.query = function(objectOrString) {
    var state = this._superagentMockerState;
    if (!state || !state.current) {
      return oldQuery.call(this, objectOrString);
    }
    var obj = {};
    if (isString(objectOrString)) {
      obj = parseQueryString(objectOrString);
    }
    else if (isObject(objectOrString)) {
      obj = stringifyValues(objectOrString);
    }
    state.request.query = mergeObjects(state.request.query, obj);
    return this;
  }

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
function patch(superagent, prop, method) {
  var old = originalMethods[prop] = superagent[prop];
  superagent[prop] = function (url, data, fn) {
    var current = match(method, url, data);
    var orig = old.call(this, url, data, fn);
    orig._superagentMockerState = {
      current: current,
      request: {
        headers: {},
        body: {},
        query: {}
      },
    };
    return orig;
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
      body: isObject(req.body) ? mergeObjects(body, req.body) : req.body,
      headers: req.headers,
      query: req.query
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
 * Simple string test
 * @param any val Variable to test
 * @return bool True if variable is a string
 */
function isString(val) {
  return 'string' === typeof val;
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
 * Parses a query string like "foo=bar&baz=bat" into objects like
 * { foo: 'bar', baz: 'bat' }
 * @param s string
 */
function parseQueryString(s) {
  return s.split('&').reduce(function (obj, param) {
    var parts = param.split('=');
    var key = parts.shift();
    var val = parts.shift();
    if (key && val) {
      obj[key] = val;
    }
    return obj;
  }, {});
}

function stringifyValues(oldObj) {
  return Object.keys(oldObj).reduce(function(obj, key) {
    obj[key] = String(oldObj[key]);
    return obj;
  }, {});
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
