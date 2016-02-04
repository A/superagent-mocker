# superagent-mocker

[![Build Status](https://travis-ci.org/A/superagent-mocker.svg?branch=master)](https://travis-ci.org/A/superagent-mocker)
[![Coverage Status](https://coveralls.io/repos/github/A/superagent-mocker/badge.svg?branch=master)](https://coveralls.io/github/A/superagent-mocker?branch=master)

REST API mocker for the browsers. LOOK MA NO BACKEND! 👐

Written for [superagent](https://github.com/visionmedia/superagent).

## Install

```shell
npm i superagent-mocker
```

## Usage

### Setup

```js
var request = require('superagent');
var mock = require('superagent-mocker')(request);
```

### Timeout

You can provide custom timeout, that can be a function or a number. Just set
`timeout` property to the `mock`:

```js
var mock = require('superagent-mocker');

// set just number
mock.timeout = 100;

// Or function to get random
mock.timeout = function () {
  return Math.random() * 1e4 |0;
}
```

### Get

You may set headers using the `mock.set()`.  To ensure header keys are not case sensitive,
all keys will be transformed to lower case (see example).

```js
mock.get('/topics/:id', function(req) {
  return {
    id: req.params.id,
    content: 'Hello World!',
    headers: req.headers
  };
});

request
  .get('/topics/1')
  .set({ 'X-Custom-Header': 'value of header' })
  .end(function(err, data) {
    console.log(data); // { id: 1, content: 'Hello World', headers: { 'x-custom-header': 'value of header' } }
  })
;
```

`mock.del()` works in a similar way.

### Post

You may set the body of a `POST` request as the second parameter of `mock.post()`
or in `mock.send()`.  Values set in `send()` will overwrite previously set values.

```js
mock.post('/topics/:id', function(req) {
  return {
    id: req.params.id,
    body: req.body
  };
});

request
  .post('/topics/5', {
    content: 'I will be overwritten',
    fromPost: 'Foo'
  })
  .send({
    content: 'Hello world',
    fromSend: 'Bar'
  })
  .end(function(err, data) {
    console.log(data); // { id: 5, body: { content: 'Hello world', fromPost: 'Foo', fromSend: 'Bar' } }
  })
;
```

`mock.put()`, `mock.patch()` methods works in a similar way.

### Teardown

You can remove all of the route handlers by calling `mock.clearRoutes()`.  This is useful when defining temporary route handlers for unit tests.

```js

// Using the mocha testing framework
define('My API module', function(){

  beforeEach(function(){
    // Guarentee each test knows exactly which routes are defined
    mock.clearRoutes()
  })

  it('should GET /me', function(done){
    mock.get('/me', function(){done()})
    api.getMe()
  })

  it('should POST /me', function(done){
    // The GET route handler no longer exists
    // So there is no chance to see a false positive
    // if the function actually calls GET /me
    mock.post('/me', function(){done()})
    api.saveMe()
  })

})
```

Or you can remove only one specified route (by method and url)

```js
// to register route
mock.get('/me', function(){done()})

...

// to remove registered handler
mock.clearRoute('get', '/me');

```

### Rollback library effect

In some cases it will be useful to remove patches from superagent lib after using mocks.
In this cases you can use ```mock.unmock()``` method, that will rollback all patches that ```mock(superagent)``` call make.

## License

MIT © [Shuvalov Anton](http://shuvalov.info)

