EyrollesJS
==========

This is an unofficial JS API for [Eyrolles](http://www.eyrolles.com/)’ website.

**[in development]**

Install
=======

```
npm install eyrolles-api
```

Usage
=====

The API has some objects (e.g. `Book`, `Publisher`, etc), each one has a
`.fetch` method, used to populate its attributes with the informations from the
website.

Each API’s function get an object with various attributes:

* `query`: the query string
* `limit`: the maximum number of results (e.g. for a search), default is 20
* `offset`: see `limit` (default: 0)
* `callback`: a function called with the result(s)
* `error`: a function called if there’s an error

Search
------

```js
var api = require( 'eyrolles-api' );

api.search({
    query: 'Foo',
    callback: function( q ) {

        console.log( q.results ); // `Book` objects

    }

});
```

Get a Book
----------

* with its ISBN code: `api.getBookByISBN( opts )`, put the code in the `query`
  attribute of the `opts` object. This return a `Book` object.


Get all books from a given author
---------------------------------

If you have an `Author` object, its `books` attributes is the list of their
books (you have to fetch them with the `.fetch` methods).
