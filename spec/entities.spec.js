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

        var bl = new entities.BooksList( 'Accueil/Recherche/?q=foo' );

        bl.fetch({

            limit: false,

            callback: function() {

                expect( bl.books ).toBeDefined();
                expect( bl.books.length ).toEqual( 91 );

                done();

            }

        });

    });

});
