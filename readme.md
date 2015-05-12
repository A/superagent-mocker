# superagent-mocker

[![Build Status](https://travis-ci.org/shuvalov-anton/superagent-mocker.svg)](https://travis-ci.org/shuvalov-anton/superagent-mocker)

Pretty simple mocks for the CRUD and REST API.

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

### Get

```js
mock.get('/topics/:id', function(req) {
  var id = req.param.id;
  return { id: req.params.id, content: 'Hello World!' };
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

