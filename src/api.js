var entities = require( './entities' ),
    config   = require( './config' ).vars,
    utils    = require( './utils' );

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
 * Set some config values
 **/
exports.set = function _set() {

    var k, opts = {};

    if ( arguments.length === 1 ) {

        // .set( 'foo' )
        if ( '' + ( k = arguments[0] ) === k ) {

            opts[ k ] = true;

        // .set({ … })
        } else { opts = k; }

    } else if ( arguments.length === 2 ) {

        // .set( 'foo', 'bar' )
        opts[ arguments[0] ] = arguments[1];

    }

    utils.extends( config.globals, opts );
    return exports;

};

/**
 * Unset a config value
 **/
exports.unset = function _unset( k ) {

    if ( k instanceof Array ) {

        k.forEach(function( e ) {
            _unset( e );
        });
    
    } else if ( arguments.length > 1 ) {

        [].forEach.call( arguments, function( e ) {
            _unset(e);
        });

    } else {

        delete config.globals[k];

    }

    return exports;

};

/**
 * Get a config value
 **/
exports.getVar = function ( k ) {

    return config.globals[k];

};

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

    if ( opts === undefined || opts === null || !opts.query ) { return null; }

    if ( typeof opts === 'string' ) {

        opts = { query: opts };

    }

    var isbn = encodeURIComponent( ( '' + opts.query ).trim() );

    // The website redirects to the book page if it can find it
    return new entities.Book(
        'Accueil/Recherche/?q=' + isbn ).fetch( opts.callback );

}
