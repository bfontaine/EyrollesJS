var entities = require( './entities' );

var SearchQuery = function SearchQuery( opts ) {

    var that = this;

    that.results = [];

    if ( !opts ) { opts = {}; }

    new entities.BooksList(

        'Accueil/Recherche/?q=' + encodeURIComponent( opts.query )

    ).fetch({

        limit: +opts.limit || 20,
        offset: +opts.offset || 0,

        callback: function( bl ) {

            that.results = bl.books;

            if ( typeof opts.callback === 'function' ) {

               opts.callback( that.results );

            }

        }

    });

};

/**
 * === API endpoints ===
 **/

/**
 * #search( opts )
 * ---------------
 * Return a `SearchQuery` object to perform a search on Eyrolles’ website. This
 * has a .results attribute which is populated by a query on the website.
 * @opts:
 *  - query [String]: the string query
 *  - limit [Number] (default: 20)
 *  - offset [Number] (default: 0)
 *  - callback [Function]: function called when the results have been
 *  populated (default: none)
 **/
exports.search = function( opts ) {

    return new SearchQuery( opts );

};

/**
 * Return a `Book` object from the given ISBN code.
 * @opts [Object]:
 * - query [String]: the ISBN code
 * - callback [Function]
 **/
exports.getBookByISBN = function( opts ) {

    if ( opts === undefined || !opts.query ) { return null; }

    if ( typeof opts === 'string' ) {

        opts = { query: opts };

    }

    var isbn = encodeURIComponent( ( '' + opts.query ).trim() );

    // The website redirects to the book page if it can find it
    return new entities.Book(
        '/Accueil/Recherche/?q=' + isbn ).fetch( opts.callback );

}
