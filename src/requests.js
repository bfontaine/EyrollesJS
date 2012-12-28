
var cheerio    = require( 'cheerio' ),
    request    = require( 'request' ),
    config     = require( './config' ).variables,
    utils      = require( './utils' ),

    re_http     = /^https?:\/\//,
    re_list_len = /: \d+ à \d+ sur (\d+) livres/,

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
 * Handle pagination on an url.
 * @url: URL of the content (books list)
 * @opts: Mandatory parameter, must provide a `parser`
 * key which is a function which get one argument, a cheerio object on
 * a page, and must return an array. The `paginate` function will call
 * this parser on each page, and concatenate the arrays. It will then
 * call opts.callback and pass it the results array.
 * It allows a few more arguments:
 * - error_callback: called on each page where there’s an error (e.g.: 404)
 * - limit: the results limit (default: 20)
 * - offset
 * - bpp: number of books per page (default: 20)
 * - $: A cheerio object loaded with the current page's body (optional)
 **/
function paginate( url, opts ) {

    opts = opts || {};

    var callback     = opts.callback || noop,
        error_cb     = opts.error_callback || noop,
        limit        = opts.limit >= 0 ? opts.limit : 20,
        offset       = opts.offset > 0 ? opts.offset : 0,
        parser       = opts.parser,
        bpp          = opts.bpp || 20,
        params       = getParams( url ),

        total_count  = null,
        
        pages_count  = Math.ceil( limit / bpp ),
        // current page
        page         = Math.floor( offset / bpp ),
        // current page offset
        page_offset  = offset % bpp,
        page_limit   = pages_count,

        // lists of books (will be concatenated)
        parts        = [], i;
    
    if ( !parser ) { throw new Error( 'No parser provided!' ); }

    if ( limit - offset <= 0 ) {
        
        return callback([]);
    
    }

    params.nb   = bpp;
    params.ajax = 'on';

    for ( i = page; i < pages_count; i++ ) {

        (function( i, page_limit ) {

            var p = utils.clone( params );

            p.page = i + 1;

            function parse( $ ) {

                var total_count_str = re_list_len.exec( $( '.gauche' ).first() ),

                    books           = parser( $, opts ),

                    total_count = total_count_str ? total_count_str[0] : 0;


                if ( i === page ) {

                    books = books.slice( page_offset );
                    page_offset = 0;

                }

                parts[ i ] = books.slice( 0, limit );

                if ( parts.length === pages_count) {

                    for ( var j=0; j<pages_count; j++ ) {
                        
                        if ( parts[ j ] === undefined ) {

                            return;

                        }

                    }


                    var all = [], j = 0;

                    for (; j < pages_count; j++ ) {

                        all = all.concat( parts[j] );

                    }

                    return callback( all );

                }

            }

            // if this is the first page and we have the body in opts.$,
            // we don't need to request it again
            if ( i === page ) {
    
                if ( '$' in opts ) {

                    parse( opts.$ );
                    delete opts.$;

                    return;
                }

            }

            parseBody( makeParams( p, url ), parse, error_cb);

        })( i, limit - i * bpp);

    }

}

exports.parseBody   = parseBody;
exports.parseBodies = parseBodies;
exports.paginate    = paginate;
exports.getParams   = getParams;
