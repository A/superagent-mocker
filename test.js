/* global describe, it, before, navigator */

'use strict';

/**
 * Dependencies
 */
var request = require('superagent');
var should  = require('should');
var mock    = process.env.SM_COV
                ? require('./index-cov')(request)
                : require('./index')(request);

describe('superagent mock', function() {

  beforeEach(function() {
    mock.clearRoutes();
    mock.timeout = 0;
  });

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

    it('should mock multiple requests', function(done) {
      mock.get('/thread/:id', function(req) {
        return { id: req.params.id };
      });
      var finished = 0;
      var r1 = request.get('/thread/1');
      var r2 = request.get('/thread/2');

      r1.end(function(_, data) {
        data.should.have.property('id', '1');
        if (++finished == 2) done();
      });
      r2.end(function(_, data) {
        data.should.have.property('id', '2');
        if (++finished == 2) done();
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
        });
    });

    it('should mock for put', function(done) {
      mock.put('/topics/:id', function(req) {
        return { id: req.params.id, content: req.body.content };
      });
      request
        .put('/topics/7', { id: 7, content: 'hello world!11' })
        .end(function(_, data) {
          data.should.have.property('id', '7');
          data.should.have.property('content', 'hello world!11');
          done();
        });
    });

    it('should mock for patch', function(done) {
      mock.patch('/topics/:id', function(req) {
        return { id: req.params.id, content: req.body.content };
      });
      request
        .patch('/topics/7', { id: 7, content: 'hello world!11' })
        .end(function(_, data) {
          data.should.have.property('id', '7');
          data.should.have.property('content', 'hello world!11');
          done();
        });
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
        });
    });

    it('should be async', function(done) {
      var isAsync = true;
      mock.get('/async', function(req) {
        isAsync = false;
      });
      request
        .get('/async')
        .end();
      isAsync.should.be.true;
      done();
    });

    it('should work correct with unmocked requests', function(done) {
      request
        .get('http://example.com')
        .query({ foo: 'bar' })
        .end(function(err, res) {
          done(err);
        });
    });

    it('should work with custom timeout', function(done) {
      var startedAt = +new Date();
      mock.timeout = 100;
      mock.get('/timeout', noop);
      request
        .get('/timeout')
        .end(function(err, res) {
          var finishedAt = +new Date();
          var offset = finishedAt - startedAt;
          offset.should.be.above(mock.timeout - 1);
          done(err);
        });
    });

    it('should work with custom timeout function', function(done) {
      var startedAt = +new Date();
      mock.get('/timeout', noop);
      mock.timeout = function () { return 200; };
      request
        .get('/timeout')
        .end(function(err, res) {
          var finishedAt = +new Date();
          var offset = finishedAt - startedAt;
          offset.should.be.above(199);
          done(err);
        });
    });

    it('should clear registered routes', function(done) {
      mock.get('/topics', noop);
      mock.clearRoutes();
      request
        .get('/topics')
        .end(function(err, res) {
          should.throws(function() {
            should.ifError(err);
          }, /ECONNREFUSED/);
          done();
        });
    });

    it('should clear registered specific route', function(done) {
      mock
        .get('/topics', noop)
        .get('/posters', function() {
          return { id: 7 };
        });
      mock.clearRoute('get', '/topics');
      request
        .get('/topics')
        .end(function(err, res) {
          should.throws(function() {
            should.ifError(err);
          }, /ECONNREFUSED/);

          request
            .get('/posters')
            .end(function(_, data) {
              data.should.have.property('id', 7);
              done();
            });
        });
    });

    it('should provide error when method throws', function(done) {
      var error = Error('This should be in the callback!');
      mock.get('http://example.com', function(req) {
        throw error;
      });
      request
        .get('http://example.com')
        .end(function(err, res) {
          err.should.equal(error);
          done();
        });
    });

    it('should not treat a 204 as an error', function(done) {
      mock.get('/topics/:id', function(req) {
        return {status: 204};
      });
      request.get('/topics/1')
        .end(function(err, data) {
          should.not.exist(err);
          data.should.have.property('status', 204);
          done();
        });
    });

    it('should support status code in response', function(done) {
      mock.get('/topics/:id', function(req) {
        return {body: {}, status: 500};
      });
      request.get('/topics/1')
        .end(function(err, data) {
          err.should.have.property('status', 500);
          err.should.have.property('response');
          should.deepEqual(err.response, {body: {}, status: 500});
          done();
        });
    });

    it('should support headers', function(done) {
      mock.get('/topics/:id', function(req) {
        return req.headers;
      });
      request.get('/topics/1')
        .set('My-Header', 'my-Value')
        .set('User-Agent', 'Opera Mini')
        .end(function(_, data) {
          // lowercase
          data.should.have.property('my-header', 'my-Value')
          data.should.have.property('user-agent', 'Opera Mini')
          done();
        });
    });

    it('should support multiple headers', function(done) {
      mock.get('/', function(req) {
        return req.headers;
      });
      request.get('/')
        .set({
          'My-Header': 'my-Value',
          'User-Agent': 'Opera Mini',
        })
        .end(function(_, data) {
          data.should.have.property('my-header', 'my-Value')
          data.should.have.property('user-agent', 'Opera Mini')
          done();
        })
    })

    it('should throw error when header isn\'t a string', function() {
      mock.get('/topics/:id', function(req) {
        return req.headers;
      });
      should.throws(function() {
        request.get('/topics/1')
          .set(42, 'my-Value')
          .end(function(_, data) {
            done();
          });
        should.ifError(err);
      }, /Header keys must be strings/);
    });

    it('should pass data from send()', function(done) {
      mock.post('/topics/:id', function(req) {
        return req.body;
      });
      request
        .post('/topics/5')
        .send({ content: 'Hello world' })
        .end(function(_, data) {
          data.should.have.property('content', 'Hello world');
          done();
        })
      ;
    });

    it('should pass non-object data from send()', function(done) {
      mock.post('/topics/:id', function(req) {
        return { body: req.body };
      });
      request
        .post('/topics/6')
        .send('foo bar baz')
        .end(function(_, data) {
          should.equal(data.body, 'foo bar baz');
          done();
        })
      ;
    });

    it('should rewrite post() data by send()', function(done) {
      mock.post('/topics/:id', function(req) {
        return req.body;
      });
      request
        .post('/topics/5', { content: 'Hello Universe' })
        .send({ content: 'Hello world', title: 'Yay!' })
        .end(function(_, data) {
          data.should.have.property('title', 'Yay!');
          data.should.have.property('content', 'Hello world');
          done();
        })
      ;
    });

    it('should parse parameters from query()', function(done) {
      mock.get('/topics/:id', function(req) {
        return req;
      });
      request
        .get('/topics/5')
        .query('hello=world')
        .query('xx=yy&zz=0')
        .query({ test: 'yay' })
        .query({ foo: 'bar', baz: 'bat' })
        .end(function(_, data) {
          data.should.have.property('query');
          should.deepEqual(data.query, {
            hello: 'world',
            xx: 'yy',
            zz: '0',
            test: 'yay',
            foo: 'bar',
            baz: 'bat'
          });
          done();
        })
      ;
    });

    it('should remove patches by unmock()', function() {
      mock.unmock(request);
      (request._patchedBySuperagentMocker === void 0).should.be.true;
    });

  });

});

/**
 * Just noop
 */
function noop() {};
