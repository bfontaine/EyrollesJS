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

describe( 'getParams function', function() {

    it( 'should return an empty object for a malformed URL', function() {

        expect( requests.getParams( undefined ) ).toEqual( {} );
        expect( requests.getParams( null ) ).toEqual( {} );
        expect( requests.getParams( 42 ) ).toEqual( {} );
        expect( requests.getParams( '' ) ).toEqual( {} );

    });

    it( 'should return an empty object for an URL without query part', function() {

        expect( requests.getParams( 'http://foo.com' ) ).toEqual( {} );
        expect( requests.getParams( 'foo.com?' ) ).toEqual( {} );
        expect( requests.getParams( '?' ) ).toEqual( {} );

    });

    it( 'should return the URL parameters from its query part', function() {

        expect( requests.getParams( 'foo.com?a=b' ) ).toEqual({ a:'b' });
        expect( requests.getParams( '?foo=b' ) ).toEqual({ foo:'b' });
        expect( requests.getParams( 'foo.com?a=b&b=c&c=42' ) ).toEqual({
            a: 'b', b:'c', c:'42'
        });

    });

    it( 'should decode URI-encoded parameters', function() {

        expect( requests.getParams( 'foo.com?q=%20%3F' ) ).toEqual({ q:' ?' });
        expect( requests.getParams( 'foo.com?q=%26%23%24%2F%2F' ) ).toEqual({ q:'&#$//' });

    });

    it( 'should parse empty values as empty strings', function() {

        expect( requests.getParams( 'foo.com?q=' ) ).toEqual({ q:'' });
        expect( requests.getParams( 'foo.com?q=&r' ) ).toEqual({ q:'', r:'' });
        expect( requests.getParams( 'foo.com?a&b' ) ).toEqual({ a:'', b:'' });

    });

    it( 'should not parse empty keys', function() {

        expect( requests.getParams( 'foo.com?&' ) ).toEqual({});
        expect( requests.getParams( 'foo.com?&&&&&&&' ) ).toEqual({});
        expect( requests.getParams( 'foo.com?&a=2' ) ).toEqual({ a:'2' });
        expect( requests.getParams( 'foo.com?s=2&' ) ).toEqual({ s:'2' });

    });

});

describe( 'parseBodies function', function() {

    it( 'should pass an empty array if there’s no URL', function( done ) {

        requests.parseBodies( [], noop, function( r ) {

            expect( r ).toEqual( [] );
            done();

        })

    });

    it( 'should pass a null-filled array if there’s no valid URL', function( done ) {

        nock( 'http://www.eyrolles.com' )
            .get( '/404' ).reply( 404, 'Oops!' )
            .get( '/500' ).reply( 500, 'Oops!' );

        var codes = [];

        requests.parseBodies( [ '404', '500' ], noop, function( r ) {

            expect( r ).toEqual( [ null, null ] );
            expect( codes ).toContain( 404 );
            expect( codes ).toContain( 500 );
            done();

        }, function( err ) {
            codes.push( err );
        });

    });

    it( 'should works with one valid URL', function( done ) {

        nock( 'http://www.eyrolles.com' )
            .get( '/foo' ).reply( 200, '<p>It Works!</p>' );

        requests.parseBodies( [ 'foo' ], function( $ ) {
        
            return 'foo';
        
        }, function( r ) {
        
            expect( r ).toEqual([ 'foo' ]);
            done();
        
        });

    });

    it( 'should work with multiple valid URL', function( done ) {

        nock( 'http://www.eyrolles.com' )
            .get( '/foo' ).reply( 200, 'Foo!' )
            .get( '/bar' ).reply( 200, 'Bar!' )
            .get( '/moo' ).reply( 200, 'Moo!' );

        requests.parseBodies( [ 'foo', 'bar', 'moo' ], function( $ ) {

            return $.html();

        }, function( r ) {

            expect( r ).toContain( 'Foo!' );
            expect( r ).toContain( 'Bar!' );
            expect( r ).toContain( 'Moo!' );
            done();

        });

    });

    it(  'should pass the results array '
       + 'in the same order than the URLs one', function( done ) {

        nock( 'http://www.eyrolles.com' )
            .get( '/foo' ).reply( 200, 'Foo!' )
            .get( '/bar' ).reply( 200, 'Bar!' )
            .get( '/moo' ).reply( 200, 'Moo!' );

        requests.parseBodies( [ 'foo', 'bar', 'moo' ], function( $ ) {

            return $.html();

        }, function( r ) {

            expect( r ).toEqual([ 'Foo!', 'Bar!', 'Moo!' ])
            done();

        });
        
    });

    it( 'should set `null` as a result for failing URLs', function( done ) {

        nock( 'http://www.eyrolles.com' )
            .get( '/foo' ).reply( 200, 'Foo!' )
            .get( '/404' ).reply( 404, 'Oops' )
            .get( '/bar' ).reply( 200, 'Bar!' )
            .get( '/500' ).reply( 500, 'Oops' )
            .get( '/moo' ).reply( 200, 'Moo!' );

        var urls  = [ 'foo', '404', 'bar', '500', 'moo' ],
            codes = [];

        requests.parseBodies( urls, function( $ ) {

            return $.html();
        
        }, function( r ) {

            expect( r ).toEqual([ 'Foo!', null, 'Bar!', null, 'Moo!' ]);
            expect( codes ).toContain( 404 );
            expect( codes ).toContain( 500 );
            done();

        }, function ( err ) {
           
            codes.push( err );
        
        });

    });

});

/*
describe( 'paginate function', function() {

    it( 'should fail if no parser is provided', function() {

        expect( requests.paginate.bind( null, '/?q=2', {} ) )
                            .toThrow(new Error( 'No parser provided!' ));

        expect( requests.paginate.bind( null, '/?q=2', { limit:2, offset:2 } ) )
                            .toThrow(new Error( 'No parser provided!' ));

    });

    it( 'should handle empty pages', function( done ) {

        nock( 'http://www.eyrolles.com' )
                .get( '/nores1?ajax=on&page=1' ).reply( 200, '<p class="gauche">: 0 à 0 sur 0 livres</p>' );


        requests.paginate( 'nores1', {

            parser: function() { return []; },
            callback: function( all ) {

                expect( all ).toEqual( [] );
                done();

            }

        });

    });

});*/
