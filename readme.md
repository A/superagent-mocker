# superagent-mocker

[![Build Status](https://travis-ci.org/rambler-digital-solutions/superagent-mocker.svg?branch=master)](https://travis-ci.org/rambler-digital-solutions/superagent-mocker)

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

```js
mock.get('/topics/:id', function(req) {
  return {
    id: req.params.id,
    content: 'Hello World!'
  };
});

request
  .get('/topics/1')
  .end(function(err, data) {
    console.log(data); // { id: 1, content: 'Hello World' }
  })
;
```

### Post

```js
mock.post('/topics/:id', function(req) {
  return {
    id: req.params.id,
    content: req.body.content
  };
});

request
  .post('/topics/5', { content: 'Hello world' })
  .end(function(err, data) {
    console.log(data); // { id: 5, content: 'Hello world' }
  })
;
```

`mock.put()` and `mock.del()` methods works as well.

### Note

Sadly, but `request.send()` doesn't work :( Sorry

## License

MIT © [Shuvalov Anton](http://shuvalov.info)

