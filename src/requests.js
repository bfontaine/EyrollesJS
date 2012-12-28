var cheerio    = require( 'cheerio' ),
    request    = require( 'request' ),
    config     = require( './config' ).variables,
    utils      = require( './utils' ),

    re_http     = /^https?:\/\//,

    noop = function(){};


function makeParams( params, url ) {

    var encoded = [],
        params  = utils.extends( {}, config.defaultParams, params ),
        k;

    for ( k in params ) {

        if ( !params.hasOwnProperty( k ) ) { continue; }

        encoded.push(
            encodeURIComponent( k ) + '=' + encodeURIComponent( params[k] )
        );

    }

    if ( url ) {

        url  = url.split( '?' )[0];

    }

    return ( url || '' ) + '?' + encoded.join( '&' );

}

function getParams( url ) {

    if (!( '' + url === url )) {

        return {};

    }

    var params = {},
        query = url.split( '?', 2 )[1],
        param;

    if ( !query ) {

        return params;
    
    }

    query.split( '&' ).forEach(function( p ) {

        param = p.split('=');

        if ( param.length === 1 ) {

            param.push( '' );

        }

        if ( param[0].length == 0 ) {
    
            return;

        }

        params[ decodeURIComponent( param[0] ) ]
                                = decodeURIComponent( param[1] );

    });

    return params;
}

/**
 * Request an URL, load the response in a Cheerio object
 * and pass it to a callback.
 **/
function parseBody( url, callback, error_callback ) {

    if ( !re_http.test( url ) ) {
        url = config.urls.root + url;
    }

    return request( url, function( error, response, body ) {

        var code  = response && response.statusCode;

        if ( error || code !== 200 ) {
            //console.log( 'Error requesting ' + url ); 

            if ( code === 404 ) {
                //console.log( 'E404: ' + url )
            }

            return ( error_callback || noop )( error || code );
        }

        return ( callback || noop )( cheerio.load( body ) );

    });

}

/**
 * Request a bunch of URLs, parse each page (`parser` function arg),
 * and pass the list of parsed values to the callback
 **/
function parseBodies( urls, parser, callback, error_callback ) {

    var urls_count = urls.length,
        results    = [];

    if ( urls_count === 0 ) {
        return ( callback || noop )( results );
    }

    urls.forEach( function( url, i ) {

        parseBody( url, function( $ ) {

           results[ i ] = parser( $ );
           urls_count--;

           if ( urls_count === 0 ) {
               ( callback || noop )( results );
           }

        }, function( err ) {
            
            results[ i ] = null;
            urls_count--;

            ( error_callback || noop )( err );

           if ( urls_count === 0 ) {
               ( callback || noop )( results );
           }
        });

    });

}

/**
 * Handle pagination on an URL.
 * @url: URL of the content (books list)
 * @opts: set of key/value parameters:
 * - parser [Function] (mandatory): takes a cheerio object,
 *   return a list of books. An object may be passed as a second argument,
 *   to set some flags:
 *   - 'first' [Boolean]: truthy if it’s the first page of the pages set. This
 *     is useful if some informations need to be parsed on the first page only.
 *   if the parser return an empty array, or if the `bpp` option (see below)
 *   is set and the parser returns less than `bpp` books, we assume that
 *   there’s no more resumts
 * - callback [Function]: called with the whole list of books
 * - error [Function]: called with each page it fails to retrieve. Two
 *   arguments are passed: the error code and the page’s indice (starts at 0)
 * - limit [Number]: the maximum number of books to retrieve (default: 20)
 * - offset [Number]: the offset
 * - bpp [Number]: number of books per page. If this option is not set, it’s
 *   gessed from the first page.
 **/
function paginate( url, opts ) {

    if (!( typeof opts === 'object' )) {
        opts = {};
    }

    var params   = getParams( url ),
        
        parser   = opts.parser,
        final_cb = opts.callback || noop,
        error_cb = opts.error || noop,
        limit    = opts.limit > 0 ? opts.limit : 20,
        offset   = opts.offset > 0 ? opts.offset : 0,
        bpp      = opts.bpp > 0 ? opts.bpp : null;


    if (!( typeof parser === 'function' )) {

        throw new Error( 'No parser provided!' );

    }

    if ( limit <= offset ) {

        return final_cb( [] );

    }

    params.page = 1;
    params.ajax = 'on';

    // first page
    parseBody( makeParams( params, url ), function( $ ) {

        var books = parser( $, { first: true } ),
            len, len2,
            page_min = 2,
            page_max,
            first_page_offset = 0,
            page, pages, i, j, p;

        if ( !utils.isArray( books ) ) {
            return final_cb( [] );
        }

        len = books.length;

        if (( bpp !== null && len < bpp ) || len === 0) {

            return final_cb( books );

        } else if ( bpp === null ) {

            bpp = len;

        }

        if ( len >= limit ) {

            return final_cb( books.slice( offset, limit ) );

        }

        if ( offset > 0 ) {

            limit -= offset;

            if ( offset < bpp ) {

                books  = books.slice( offset );
                offset = 0;

            } else {

                books.length = 0; // more efficient than `books = []`

                if ( offset > bpp ) {

                    page_min = Math.ceil( offset / bpp );
                    offset   = offset % bpp;

                }

            }

        }

        // other pages
        pages = [];
        page_max = Math.floor( limit / bpp ) + 1;

        for ( i = page_min; i <= page_max; i++ ) {

            p = utils.clone( params );
            p.page = i;

            pages.push( makeParams( p, url ) );

        }

        parseBodies( pages, parser, function( results ) {

            for ( i = 0, len = results.length; i<len; i++ ) {

                if ( !utils.isArray( results[ i ] ) ) { continue; }

                page = ( i === 0 )
                            ? results[ i ].slice( offset )
                            : results[ i ];

                for ( j=0, len2=page.length; j<len2; j++ ) {

                    books.push( page[j] );

                }


            }

            final_cb( books.slice( 0, limit - offset ) );

        }, error_cb );


    }, function( err ) {

        error_cb( err, 0 );
        final_cb( [] );

    });
}

exports.parseBody   = parseBody;
exports.parseBodies = parseBodies;
exports.paginate    = paginate;
exports.getParams   = getParams;
