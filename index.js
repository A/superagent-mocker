'use strict';

/**
 * Expose public API
 */
exports      = mock;
exports.get  = get;
exports.post = post;
exports.put  = put;
exports.del  = del;


function mock(superagent) {
  // patch superagent here
}


/**
 * Dispatch the route with all the middlewares
 */
function dispatch() {

}


/**
 * Register url and callback for `get`
 */
function get(url, cb) {

}


/**
 * Register url and callback for `post`
 */
function post(url, cb) {

}

/**
 * Register url and callback for `put`
 */
function put(url, cb) {

}

/**
 * Register url and callback for `del`
 */
function del(url, cb) {

}


/**
 * Request
 */
function Request() {

}

/**
 * Response
 */
function Response() {

}

/**
 * Response with given json
 */
Response.prototype.json = function(data) {

};


/**
 * Route with given url
 */
function Route() {

}

/**
 * Match route with given url
 */
Route.prototype.match = function match() {

};

/**
 * Register middleware for the route
 */
Route.prototype.middleware = function() {

};

/**
 * List of registred callbacks
 */
var callbacks = [];
