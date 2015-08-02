/* global describe, it, before, navigator */

'use strict';

/**
 * Dependencies
 */
var request = require('superagent');
var mock    = require('./')(request);
var should  = require('should');

describe('superagent mock', function() {

  describe('API', function() {

    it('should mock for get', function(done) {
      mock.get('/topics/:id', function(req) {
        req.params.id.should.be.equal('1');
        return { id: req.params.id };
      });
      request.get('/topics/1').end(function(_, data) {
        data.should.have.property('id', '1');
        done();
      });
    });

    it('should mock for post', function(done) {
      mock.post('/topics/:id', function(req) {
        return {
          id: req.params.id,
          content: req.body.content
        };
      });
      request
        .post('/topics/5', { content: 'Hello world' })
        .end(function(_, data) {
          data.should.have.property('id', '5');
          data.should.have.property('content', 'Hello world');
          done();
        })
      ;
    });

    it('should mock for put', function(done) {
      mock.put('/topics/:id', function(req) {
        return { id: req.params.id, content: req.body.content };
      });
      request
        .put('/topics/7', { id: 7, content: 'hello world, bitch!11' })
        .end(function(_, data) {
          data.should.have.property('id', '7');
          data.should.have.property('content', 'hello world, bitch!11');
          done();
        })
      ;
    });

    it('should mock for delete', function(done) {
      mock.del('/topics/:id', function(req) {
        return { id: req.params.id, content: req.body.content };
      });
      request
        .del('/topics/7', { id: 7, content: 'yay' })
        .end(function(_, data) {
          data.should.have.property('id', '7');
          data.should.have.property('content', 'yay');
          done(); // just done
        })
      ;
    });

    it('should be async', function(done) {
      var isAsync = true;
      mock.get('/async', function(req) {
        isAsync = false;
      });
      request
        .get('/async')
        .end()
      ;
      isAsync.should.be.true;
      done();
    });

    it('should work correct with unmocked requests', function(done) {
      request
        .get('http://example.com')
        .end(function(err, res) {
          done(err);
        });
    });
    it('should work with custom timeout', function(done) {
      var startedAt = +new Date();
      mock.timeout = 100;
      request
        .get('/async')
        .end(function(err, res) {
          var finishedAt = +new Date();
          var offset = finishedAt - startedAt;
          offset.should.be.above(mock.timeout - 1);
          done(err);
        });
    });
    it('should work with custom timeout function', function(done) {
      var startedAt = +new Date();
      mock.timeout = function () { return 200; };
      request
        .get('/async')
        .end(function(err, res) {
          var finishedAt = +new Date();
          var offset = finishedAt - startedAt;
          offset.should.be.above(199);
          done(err);
        });
    });
  });

});
