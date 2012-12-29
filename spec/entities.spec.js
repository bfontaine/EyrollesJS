var entities = require( '../src/entities' ),
    nock     = require( 'nock' );

describe( 'BooksList', function() {

    it( 'should have a .fetch method', function() {

            var bl = new entities.BooksList();

            expect( typeof bl.fetch ).toEqual( 'function' );

    });

    it( 'should use pagination to fetch large results', function( done ) {

        var _n = nock( 'http://www.eyrolles.com' ), p;

        // the following two lines should be removed when BooksList
        // pagination will be implemented.
        _n = _n.get( '//Accueil/Recherche/?q=foo' )
                .replyWithFile( 200, __dirname + '/mocks/search-for-foo-p1.html' );


        for ( p = 1; p <= 5; p++ ) {

            _n = _n.get( '/Accueil/Recherche/?ajax=on&q=foo&page=' + p )
                    .replyWithFile( 200,
                        __dirname + '/mocks/search-for-foo-p' + p + '.html' );

        }

        var bl = new entities.BooksList( '?q=foo' );

        bl.fetch(function() {

            expect( bl.results ).toBeDefined();
            expect( bl.results.length ).toEqual( 91 );

            done();

        });

    });

});
