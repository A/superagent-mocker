'use strict';

/**
 * Expose Request
 */
module.exports = Request;

/**
 * Request
 */
function Request(state) {
  this.url = state.url;
  this.route = state.route;
  this.body = this.parseBody() || {};
}

/**
 * Setup the params
 */
Request.prototype.param = function() {
  var params = this.params || {};
  var body = this.body || {};
  var query = this.query || {};
};
