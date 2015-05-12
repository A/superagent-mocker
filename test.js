/* global describe, it, before, navigator */

'use strict';

/**
 * Dependencies
 */
var request = require('superagent');
var mock    = require('..')(request);

describe('superagent mock', function() {

  describe('callbacks', function() {

    it('should register callback for get', function() {
      mock.get('/topics/:id', function(req, res) {
        res.json({ id: req.params.id });
      });
      request.get('/topics/1', function(_, data) {
        data.should.have.property('id', 1);
      });
    });

    it('should register callback for post', function() {
      mock.post('/topics/:id', function(req, res) {
        res.json({ id: req.params.id, content: req.body.content });
      });
      request
        .post('/topics/5')
        .send({ body: 'hello world' })
        .end(function(_, data) {
          data.should.have.property('id', 5);
          data.should.have.property('content', 'hello world');
        })
      ;
    });

    it('should register callback for put', function() {
      mock.put('/topics/:id', function(req, res) {
        res.json({ id: req.params.id, content: req.body.content });
      });
      request
        .put('/topics/7')
        .send({ id: 7, body: 'hello world, bitch!' })
        .end(function(_, data) {
          data.should.have.property('id', 7);
          data.should.have.property('content', 'hello world, bitch');
        })
      ;
    });

    it('should register callback for delete', function() {
      mock.put('/topics/:id', function(req, res) {
        res.json({ id: req.params.id, content: req.body.content });
      });
      request
        .put('/topics/7')
        .send({ id: 7, body: 'hello world, bitch!' })
        .end(function(_, data) {
          done(); // just done
        })
      ;
    });

  });

});
