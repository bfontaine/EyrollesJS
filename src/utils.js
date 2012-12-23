
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

function getURL( url, callback, error_callback ) {

    if ( !re_http.test( url ) ) {
        url = config.urls.root + url;
    }

    return request( url, function( error, response, body ) {

        var code  = response.statusCode;

        if ( error || code !== 200 ) {
            console.log( 'Error requesting ' + url ); 

            if ( code === 404 ) {
                console.log( 'E404: ' + url )
            }

            return ( error_callback || noop )( error || code );
        }

        return ( callback || noop )( cheerio.load( body ) );

    });

}

function _extends( target ) {

    var k, o,
        objs   = [].slice.call( arguments ).slice( 1 );

    for ( o in objs ) {
        for ( k in o ) {
            if ( o.hasOwnProperty( k ) ) {

                target[ k ] = o[ k ];

            }
        }
    }

    return target;

}

function _clone( o ) {
    return _extends( {}, o );
}

exports.getURL     = getURL;
exports.makeParams = makeParams;
exports.extends    = _extends;
