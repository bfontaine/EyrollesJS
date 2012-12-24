var requests = require( '../src/requests' ),

    nock     = require( 'nock' ),
    
    noop = function(){};

describe( 'parseBody function', function() {

    var urls = {

            'undefined':    undefined,
            'not a string': 42,
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

    it( 'should call the success callback for good URLs', function( done ) {

        var url = 'http://www.google.com',
            page_content = '<h1>Google</h1>';

        nock( url )
            .get( '/' ).reply( 200, page_content );

        requests.parseBody( url, function( $ ) {

            expect( $( '*' ).toString() ).toEqual( page_content );
            done();

        });

    });

});
