var requests = require( '../src/requests' ),
    nock     = require( 'nock' ),

    BASE_URL = 'http://www.eyrolles.com',

    _n       = function() { return nock( BASE_URL ); },
    noop     = function(){};

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

        _n().get( '/404' ).reply( 404, 'Oops!' )
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

        _n().get( '/foo' ).reply( 200, '<p>It Works!</p>' );

        requests.parseBodies( [ 'foo' ], function( $ ) {
        
            return 'foo';
        
        }, function( r ) {
        
            expect( r ).toEqual([ 'foo' ]);
            done();
        
        });

    });

    it( 'should work with multiple valid URL', function( done ) {

        _n().get( '/foo' ).reply( 200, 'Foo!' )
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

        _n().get( '/foo' ).reply( 200, 'Foo!' )
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

        _n().get( '/foo' ).reply( 200, 'Foo!' )
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

describe( 'paginate function', function() {

    it( 'should fail if no parser is provided', function() {

        expect( requests.paginate.bind( null, '/?q=2', {} ) )
                            .toThrow(new Error( 'No parser provided!' ));

        expect( requests.paginate.bind( null, '/?q=2', { limit:2, offset:2 } ) )
                            .toThrow(new Error( 'No parser provided!' ));

    });

    it(  'should return an empty array '
       + 'if the first page request fails', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 404, 'Oops!' );

        var code = null;

        requests.paginate( 'foo', {

            parser: noop,

            callback: function( r ) {

                expect( r ).toEqual( [] );
                expect( code ).toEqual( 404 );
                done();

            },

            error: function( err ) {

                code =  err;

            }

        });

    })

    it(  'should not request other pages '
       + 'if the first one contains no results', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '1' )
            .get( '/foo?ajax=on&page=2' ).reply( 200, '2' );

        var _2nd_page_requested = false;

        requests.paginate( 'foo', {

            callback: function( r ) {

                expect( _2nd_page_requested ).toBeFalsy();
                expect( r ).toEqual( [] );
                done();

            },

            parser: function( $ ) {

                if ( $.html() === '2' ) {
                    _2nd_page_requested = true;
                }

                return [];

            }


        })

    });

    it( 'should set the `first` flag on the first page', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '1' )
            .get( '/foo?ajax=on&page=2' ).reply( 200, '2' );
            

        requests.paginate( 'foo', {

            parser: function( $, flags ) {

                if ( $.html() === '1' ) {

                    expect( flags ).toBeDefined();
                    expect( flags ).not.toBeNull();
                    expect( flags.first ).toBeTruthy();

                } else {

                    expect( flags && flags.first ).toBeFalsy();

                }

            },

            callback: function() { done(); }

        });

    });

    it( 'should pass an empty array if limit < offset', function( done ) {

        _n();

        requests.paginate( 'foo', {
            parser: noop, limit: 10, offset: 12,

            callback: function( r ) {

                expect( r ).toEqual( [] );
                done();

            }
        
        });

    });

    it( 'should pass an empty array if limit = offset', function( done ) {

        _n();

        requests.paginate( 'foo', {
            parser: noop, limit: 10, offset: 10,

            callback: function( r ) {

                expect( r ).toEqual( [] );
                done();

            }
        
        });

    });

    it(  'should not request the second page '
       + 'if there’re enough books on the first one', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '1' )
            .get( '/foo?ajax=on&page=2' ).reply( 200, '2' );

        var _2nd_page_requested = false;

        requests.paginate( 'foo', {
            limit: 2,
            parser: function( $ ) {

                if ( $.html() === '1' ) {

                    return [ 'foo', 'bar' ];

                }
                else {

                    _2nd_page_requested = true;
                    return [];
                    
                }

            },

            callback: function( r ) {

                expect( r ).toEqual( [ 'foo', 'bar' ] );
                expect( _2nd_page_requested ).toBeFalsy();
                done();

            }
        
        });

    });

    it(  'should truncate the first page’s results '
       + 'if there’re more books than needed', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '-' );

        requests.paginate( 'foo', {
            limit: 2,
            parser: function( $ ) {

                return [ 'foo', 'bar', 'moo' ];

            },

            callback: function( r ) {

                expect( r ).toEqual( [ 'foo', 'bar' ] );
                done();

            }
        
        });

    });

    it(  'should truncate the first page’s results '
       + 'according to the offset', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '-' );

        requests.paginate( 'foo', {
            limit: 2, offset: 1,
            parser: function( $ ) {

                return [ 'foo', 'bar', 'moo' ];

            },

            callback: function( r ) {

                expect( r ).toEqual( [ 'bar' ] );
                done();

            }
        
        });

    });

    it( 'should work with no offset', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '1' )
            .get( '/foo?ajax=on&page=2' ).reply( 200, '2' )
            .get( '/foo?ajax=on&page=3' ).reply( 200, '3' );

        requests.paginate( 'foo', {

            limit: 5,

            parser: function( $ ) {


                var n = $.html();

                return [ n+'1', n+'2' ];

            },

            callback: function( r ) {

                expect( r ).toEqual([ '11', '12', '21', '22', '31' ]);
                done();

            }


        });

    });

    it( 'should work with an offset < nb of books per page', function( done ) {

        _n().get( '/foo?ajax=on&page=1' ).reply( 200, '1' )
            .get( '/foo?ajax=on&page=2' ).reply( 200, '2' )
            .get( '/foo?ajax=on&page=3' ).reply( 200, '3' );

        requests.paginate( 'foo', {

            limit: 5, offset: 1,

            parser: function( $ ) {


                var n = $.html();

                return [ n+'1', n+'2' ];

            },

            callback: function( r ) {

                expect( r ).toEqual([ '12', '21', '22', '31' ]);
                done();

            }


        });

    });

});

