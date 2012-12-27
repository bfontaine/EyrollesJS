
var cheerio    = require( 'cheerio' ),
    request    = require( 'request' ),
    config     = require( './config' ).variables,

    re_http = /^https?:\/\//,

    noop = function(){};


function makeParams( params ) {

    var encoded = [],
        params  = _extends( {}, config.defaultParams, params ),
        k;

    for ( k in params ) {

        if ( !params.hasOwnProperty( k ) ) { continue; }

        encoded.push(
            encodeURIComponent( k ) + '=' + encodeURIComponent( params[k] )
        );

    }

    return '?' + encoded.join( '&' );

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

exports.parseBody = parseBody;
exports.getParams = getParams;
