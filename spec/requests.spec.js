var requests = require( '../src/requests' ),

    nock     = require( 'nock' ),
    
    noop = function(){};

describe( 'parseBody function', function() {

    var urls = {

            'undefined':    undefined,
            'not a string': 42,
            'empty string': '',
            'bad protocol': 'htttp://foo.com',
            'mal formed': 'http://-ww*$&.!~~^#',
            '404 error': 'http://404.com/'

        }, desc;

    nock( 'http://404.com' )
            .get( '/' ).reply( 404, 'boom' );

    for ( desc in urls ) {
        if ( !urls.hasOwnProperty( desc ) ) { continue; }

        (function(desc, url) {

            it( 'should call the error callback for bad URLs (' + desc + ')',
                function( done ) {

                    requests.parseBody( url, noop, function() {
                        done();
                    }, 100);

                }
            );

        })( desc, urls[ desc ] );

    }

});
